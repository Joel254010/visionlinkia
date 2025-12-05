import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ onBack, onDetectNumber, onDetectPlate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastDetected, setLastDetected] = useState("");

  // ======================================================
  // 🔍 REGEX PROFISSIONAL (MERCOSUL + ANTIGA)
  // Permite variações comuns de OCR
  // ======================================================
  const regexPlacaFlex = /^[A-Z]{3}[0-9A-Z][A-Z][0-9A-Z]{2}$/; // Mercosul tolerante
  const regexPlacaAntiga = /^[A-Z]{3}-?[0-9]{4}$/;

  // ======================================================
  // 🔧 Função para corrigir erros comuns de OCR
  // ======================================================
  function corrigirOCR(placa) {
    return placa
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/S/g, "5")
      .replace(/B/g, "8");
  }

  // ======================================================
  // 🚀 INICIAR CÂMERA
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
  }, []);

  // ======================================================
  // 🧠 OCR LOOP MELHORADO PARA PLACAS
  // ======================================================
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

      // ======================================================
      // 🟦 RECORTE OTIMIZADO PARA PLACA (mais horizontal)
      // ======================================================
      const cropW = fullW * 0.80;
      const cropH = fullH * 0.22;
      const cropX = (fullW - cropW) / 2;
      const cropY = fullH * 0.58;

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // ======================================================
      // 🎨 PRÉ-PROCESSAMENTO MELHORADO
      // ======================================================
      const frame = ctx.getImageData(0, 0, cropW, cropH);
      const data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        gray = gray < 140 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      ctx.putImageData(frame, 0, 0);

      // ======================================================
      // 🔠 OCR
      // ======================================================
      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        });

        let rawText = result.data.text;
        let text = rawText.toUpperCase().replace(/[^A-Z0-9]/g, "");

        console.log("📸 OCR RAW:", rawText);
        console.log("🔤 OCR CLEAN:", text);

        // ======================================================
        // 🔎 PROCURAR PADRÃO DE PLACA
        // ======================================================
        if (text.length >= 6 && text.length <= 8) {
          let corrigida = corrigirOCR(text);
          console.log("🔧 OCR CORRIGIDA:", corrigida);

          // Mercosul
          if (regexPlacaFlex.test(corrigida)) {
            if (corrigida !== lastDetected) {
              console.log("🎯 PLACA MERCOSUL DETECTADA:", corrigida);
              setLastDetected(corrigida);
              onDetectPlate?.(corrigida);
            }
            return;
          }

          // Antiga
          if (regexPlacaAntiga.test(corrigida)) {
            if (corrigida !== lastDetected) {
              console.log("🎯 PLACA ANTIGA DETECTADA:", corrigida);
              setLastDetected(corrigida);
              onDetectPlate?.(corrigida);
            }
            return;
          }
        }

        // ======================================================
        // 📞 DETECÇÃO DE TELEFONE (continua funcionando)
        // ======================================================
        const phoneMatch = rawText.match(/(\d{4,5}[- ]?\d{4})/);
        if (phoneMatch) {
          const phone = phoneMatch[0];
          if (phone !== lastDetected) {
            console.log("📞 TELEFONE DETECTADO:", phone);
            setLastDetected(phone);
            onDetectNumber?.(phone);
          }
        }
      } catch (err) {
        console.error("❌ OCR falhou:", err);
      }
    }, 900); // intervalo maior melhora a precis�o

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
          <button className="v-btn-ghost" onClick={onBack}>⬅ voltar</button>
          <div className="v-camera-chip">beta público • v1.3</div>
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
