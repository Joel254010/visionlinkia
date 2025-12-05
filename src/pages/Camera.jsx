import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ onBack, onDetectNumber, onDetectPlate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState("");

  // ================================================
  //  🔍 REGEX PROFISSIONAL PARA PLACAS BRASIL
  // ================================================
  const regexPlacaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const regexPlacaAntiga = /^[A-Z]{3}-?[0-9]{4}$/;

  useEffect(() => {
    let stream;
    let ocrIntervalId;

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
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;

          const [track] = stream.getVideoTracks();
          const capabilities = track.getCapabilities?.();
          if (capabilities?.zoom) {
            const maxZoom = capabilities.zoom.max || 2;
            track
              .applyConstraints({
                advanced: [{ zoom: maxZoom * 0.7 }],
              })
              .catch(() => {});
          }

          video.style.transform = "scale(1.8)";
          video.style.transformOrigin = "center center";

          await video.play();
        }

        setError("");
        ocrIntervalId = startOCRLoop();
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
      if (ocrIntervalId) clearInterval(ocrIntervalId);
      setScanning(false);
    };
  }, []);

  // ====================================================
  // 🔍 OCR LOOP — recorte central + pré-processamento
  // ====================================================
  function startOCRLoop() {
    if (scanning) return null;
    setScanning(true);

    const intervalId = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const fullW = video.videoWidth;
      const fullH = video.videoHeight;
      if (!fullW || !fullH) return;

      const ctx = canvas.getContext("2d");

      // 🟦 RECORTE CENTRAL
      const cropW = fullW * 0.55;
      const cropH = fullH * 0.30;
      const cropX = (fullW - cropW) / 2;
      const cropY = (fullH - cropH) / 2;

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // 🧪 PRÉ-PROCESSAMENTO
      const frame = ctx.getImageData(0, 0, cropW, cropH);
      const data = frame.data;
      for (let i = 0; i < data.length; i += 4) {
        let gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        gray = gray < 128 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(frame, 0, 0);

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -()",
        });

        let text = result.data.text.toUpperCase().replace(/\s+/g, "");

        // ================================================
        // 🔎 DETECÇÃO DE PLACAS AUTOMOTIVAS
        // ================================================
        const placaMatch = text.match(/[A-Z0-9-]{6,8}/g);

        if (placaMatch) {
          for (let p of placaMatch) {
            let clean = p.replace(/[^A-Z0-9]/g, "");

            // Mercosul (AAA1B23)
            if (regexPlacaMercosul.test(clean)) {
              if (clean !== lastDetected) {
                setLastDetected(clean);
                if (onDetectPlate) onDetectPlate(clean);
              }
              return;
            }

            // Antiga (AAA1234)
            if (regexPlacaAntiga.test(clean)) {
              if (clean !== lastDetected) {
                setLastDetected(clean);
                if (onDetectPlate) onDetectPlate(clean);
              }
              return;
            }
          }
        }

        // ================================================
        // 🔎 DETECÇÃO DE TELEFONE (MODO ANTIGO)
        // ================================================
        const matchPhone = text.match(
          /(\+?\d{1,3}[- ]?)?(\(?\d{2,3}\)?[- ]?)?(\d{4,5}[- ]?\d{4})/
        );

        if (matchPhone) {
          const cleanPhone = matchPhone[0].trim();
          if (cleanPhone !== lastDetected) {
            setLastDetected(cleanPhone);
            if (onDetectNumber) onDetectNumber(cleanPhone);
          }
        }
      } catch (err) {
        console.log("OCR falhou:", err);
      }
    }, 700); // mais estável

    return intervalId;
  }

  return (
    <div className="v-camera-root">
      <div className="v-camera-header">
        <div>
          <div className="v-camera-title">MODO SCANNER • VisionlinkIA</div>
          <p className="v-camera-sub">
            Aponte a câmera para uma PLACA ou um NÚMERO de telefone.
            A VisionlinkIA detecta automaticamente o tipo.
          </p>
        </div>

        <div className="v-camera-actions">
          <button className="v-btn-ghost" onClick={onBack}>
            ⬅ voltar
          </button>
          <div className="v-camera-chip">beta público • v1.2</div>
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
