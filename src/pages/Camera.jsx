import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ onBack, onDetectNumber }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState("");

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Seu navegador não permite acesso à câmera.");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        // fallback caso a câmera traseira não exista
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setError("");
        startOCRLoop(); // inicia OCR contínuo
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);

        if (err.name === "NotAllowedError") {
          setError("Permissão negada. Ative o acesso à câmera.");
        } else if (err.name === "NotFoundError") {
          setError("Nenhuma câmera encontrada neste dispositivo.");
        } else if (err.name === "NotReadableError") {
          setError("A câmera está sendo usada por outro aplicativo.");
        } else {
          setError("Não foi possível acessar a câmera.");
        }
      }
    }

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setScanning(false);
    };
  }, []);

  // ============================================
  // 🔍 LOOP DE OCR — CAPTURA FRAMES E ANALISA
  // ============================================

  function startOCRLoop() {
    if (scanning) return;
    setScanning(true);

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;

      const w = (canvas.width = video.videoWidth);
      const h = (canvas.height = video.videoHeight);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, w, h);

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: "0123456789+()- ",
        });

        const text = result.data.text;

        // REGEX para extrair telefones brasileiros e internacionais
        const match = text.match(
          /(\+?\d{1,3}[\s-]?)?(\(?\d{2,3}\)?[\s-]?)?(\d{4,5}[\s-]?\d{4})/g
        );

        if (match && match.length > 0) {
          const clean = match[0].replace(/\s+/g, " ").trim();

          if (clean !== lastDetected) {
            setLastDetected(clean);
            if (onDetectNumber) onDetectNumber(clean);
          }
        }
      } catch (err) {
        console.log("OCR falhou:", err);
      }
    }, 600); // roda a cada 0.6s

    return () => clearInterval(interval);
  }

  // ============================================
  // RENDER DA INTERFACE
  // ============================================

  return (
    <div className="v-camera-root">
      <div className="v-camera-header">
        <div>
          <div className="v-camera-title">MODO SCANNER • VisionlinkIA</div>
          <p className="v-camera-sub">
            Aponte a câmera para números de telefone. A IA identifica e envia
            automaticamente para WhatsApp em segundos.
          </p>
        </div>

        <div className="v-camera-actions">
          <button className="v-btn-ghost" onClick={onBack}>
            ⬅ voltar
          </button>
          <div className="v-camera-chip">beta público • v1.0</div>
        </div>
      </div>

      {/* VIDEO */}
      <div className="v-camera-shell">
        <div className="v-camera-inner">
          <div className="v-camera-video-frame">
            <div className="v-scanner-grid" />
            <div className="v-scanner-line" />

            <video ref={videoRef} playsInline muted />

            {/* canvas invisível — usado pelo OCR */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {error && (
              <div className="v-camera-placeholder">
                <span>⚠ {error}</span>
                <span>Ative a câmera no navegador e recarregue.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
