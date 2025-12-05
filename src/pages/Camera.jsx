import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ mode, onBack, onDetectNumber, onDetectPlate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState("");

  // ======================================================
  // 🔍 REGEX DE PLACAS BR COMO SUPORTE FLEXÍVEL
  // ======================================================
  const regexPlacaFlex = /^[A-Z]{3}[0-9A-Z][A-Z][0-9A-Z]{2}$/;
  const regexPlacaAntiga = /^[A-Z]{3}-?[0-9]{4}$/;

  // ======================================================
  // 🔧 Correção automática de OCR para placas
  // ======================================================
  function corrigirPlaca(placa) {
    return placa
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/S/g, "5")
      .replace(/B/g, "8");
  }

  // ======================================================
  // 🚀 Iniciar câmera
  // ======================================================
  useEffect(() => {
    let stream;
    let ocrIntervalId;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        const video = videoRef.current;
        video.srcObject = stream;

        await video.play();
        ocrIntervalId = startOCRLoop();
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        setError("Erro ao acessar câmera.");
      }
    }

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ocrIntervalId) clearInterval(ocrIntervalId);
      setScanning(false);
    };
  }, [mode]);

  // ======================================================
  // 🧠 OCR LOOP — totalmente separado por modo
  // ======================================================
  function startOCRLoop() {
    if (scanning) return;
    setScanning(true);

    const intervalId = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const fullW = video.videoWidth;
      const fullH = video.videoHeight;
      if (!fullW || !fullH) return;

      const ctx = canvas.getContext("2d");

      // ================================================
      // 📸 DEFINIÇÃO DO CROP POR MODO (FUNDAMENTAL!)
      // ================================================
      let cropW, cropH, cropX, cropY;

      if (mode === "plate") {
        // Placas são horizontais → crop largo e baixo
        cropW = fullW * 0.80;
        cropH = fullH * 0.22;
        cropX = (fullW - cropW) / 2;
        cropY = fullH * 0.55;
      } else {
        // Telefones são verticais e grandes → crop central alto
        cropW = fullW * 0.55;
        cropH = fullH * 0.30;
        cropX = (fullW - cropW) / 2;
        cropY = (fullH - cropH) / 2;
      }

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // ================================================
      // 🎨 PRÉ-PROCESSAMENTO UNIFICADO
      // ================================================
      const frame = ctx.getImageData(0, 0, cropW, cropH);
      const data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        gray = gray < 140 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      ctx.putImageData(frame, 0, 0);

      // ================================================
      // 🔠 OCR — whitelist separada por modo
      // ================================================
      let whitelist =
        mode === "plate"
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          : "0123456789() -+";

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: whitelist,
        });

        let raw = result.data.text.toUpperCase().trim();
        let clean = raw.replace(/[^A-Z0-9]/g, "");

        console.log("RAW:", raw);
        console.log("CLEAN:", clean);

        // ======================================================
        // 🎯 MODE = PLACA
        // ======================================================
        if (mode === "plate") {
          if (clean.length >= 6 && clean.length <= 8) {
            let corrected = corrigirPlaca(clean);
            console.log("CORRIGIDA:", corrected);

            if (
              regexPlacaFlex.test(corrected) ||
              regexPlacaAntiga.test(corrected)
            ) {
              if (corrected !== lastDetected) {
                setLastDetected(corrected);
                onDetectPlate?.(corrected);
              }
            }
          }
          return;
        }

        // ======================================================
        // 🎯 MODE = TELEFONE
        // ======================================================
        if (mode === "phone") {
          const phoneMatch = raw.match(
            /(\+?\d{1,3}[- ]?)?(\(?\d{2,3}\)?[- ]?)?(\d{4,5}[- ]?\d{4})/
          );

          if (phoneMatch) {
            const phone = phoneMatch[0];
            if (phone !== lastDetected) {
              setLastDetected(phone);
              onDetectNumber?.(phone);
            }
          }
          return;
        }
      } catch (err) {
        console.error("OCR falhou:", err);
      }
    }, 900);

    return intervalId;
  }

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="v-camera-root">
      <div className="v-camera-header">
        <div>
          <div className="v-camera-title">MODO SCANNER • VisionlinkIA</div>

          <p className="v-camera-sub">
            {mode === "phone"
              ? "Modo especializado em leitura de números telefônicos."
              : "Modo especializado em leitura de placas veiculares."}
          </p>
        </div>

        <div className="v-camera-actions">
          <button className="v-btn-ghost" onClick={onBack}>
            ⬅ voltar
          </button>
          <div className="v-camera-chip">
            {mode === "phone"
              ? "scanner telefônico • v2.0"
              : "scanner de placas • v2.0"}
          </div>
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
                <span>Ative o acesso à câmera e recarregue a página.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
