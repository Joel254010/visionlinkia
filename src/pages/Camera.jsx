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

        // ============================
        //  📌 AUMENTO DE ZOOM REAL
        // ============================
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            zoom: { ideal: 2 },     // tenta zoom real de hardware
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        // fallback se não suportar zoom
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // ============================
          //  📌 ZOOM DIGITAL EXTRA
          // ============================
          videoRef.current.style.transform = "scale(1.4)";
          videoRef.current.style.transformOrigin = "center center";

          await videoRef.current.play();
        }

        setError("");
        startOCRLoop(); 
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);

        if (err.name === "NotAllowedError")
          setError("Permissão negada. Ative o acesso à câmera.");
        else if (err.name === "NotFoundError")
          setError("Nenhuma câmera encontrada neste dispositivo.");
        else if (err.name === "NotReadableError")
          setError("A câmera está sendo usada por outro aplicativo.");
        else setError("Não foi possível acessar a câmera.");
      }
    }

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setScanning(false);
    };
  }, []);

  // ====================================================
  // 🔍 OCR LOOP — agora pegando somente a PARTE CENTRAL
  // ====================================================
  function startOCRLoop() {
    if (scanning) return;
    setScanning(true);

    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const fullW = video.videoWidth;
      const fullH = video.videoHeight;

      if (fullW === 0 || fullH === 0) return;

      const ctx = canvas.getContext("2d");

      // 🟦 RECORTE CENTRAL (aumenta precisão)
      const cropW = fullW * 0.6;
      const cropH = fullH * 0.35;
      const cropX = (fullW - cropW) / 2;
      const cropY = (fullH - cropH) / 2;

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(
        video,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH
      );

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: "0123456789+()- ",
        });

        const text = result.data.text;

        const match = text.match(
          /(\+?\d{1,3}[\s-]?)?(\(?\d{2,3}\)?[\s-]?)?(\d{4,5}[\s-]?\d{4})/g
        );

        if (match?.length > 0) {
          const clean = match[0].replace(/\s+/g, " ").trim();

          if (clean !== lastDetected) {
            setLastDetected(clean);
            if (onDetectNumber) onDetectNumber(clean);
          }
        }
      } catch (err) {
        console.log("OCR falhou:", err);
      }
    }, 450); // 🔥 mais rápido e mais preciso

    return () => clearInterval(interval);
  }

  // ====================================================
  // RENDER
  // ====================================================
  return (
    <div className="v-camera-root">
      <div className="v-camera-header">
        <div>
          <div className="v-camera-title">MODO SCANNER • VisionlinkIA</div>
          <p className="v-camera-sub">
            Aponte a câmera para números de telefone. A IA detecta e envia para
            a interface principal em tempo real.
          </p>
        </div>

        <div className="v-camera-actions">
          <button className="v-btn-ghost" onClick={onBack}>⬅ voltar</button>
          <div className="v-camera-chip">beta público • v1.0</div>
        </div>
      </div>

      <div className="v-camera-shell">
        <div className="v-camera-inner">
          <div className="v-camera-video-frame">
            <div className="v-scanner-grid" />
            <div className="v-scanner-line" />

            <video ref={videoRef} playsInline muted />

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {error && (
              <div className="v-camera-placeholder">
                <span>⚠ {error}</span>
                <span>Ative o acesso à câmera e recarregue.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
