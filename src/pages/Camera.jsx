import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ mode, onBack, onDetectNumber, onDetectPlate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  // 🔒 Armazena a última placa lida para confirmação dupla
  const [lastPlateRaw, setLastPlateRaw] = useState("");
  const [confirmTimer, setConfirmTimer] = useState(null);

  // ======================================================
  // 🔍 REGEX PLACAS BRASIL (MERCOSUL + ANTIGA)
  // ======================================================
  const regexPlacaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;  // AAA1B23
  const regexPlacaAntiga = /^[A-Z]{3}[0-9]{4}$/;             // AAA1234

  // ======================================================
  // 🔧 Correção automática OCR (melhorada)
  // ======================================================
  function corrigirPlaca(text) {
    return text
      .replace(/O/g, "0")
      .replace(/Q/g, "0")
      .replace(/I/g, "1")
      .replace(/L/g, "1")
      .replace(/S/g, "5")
      .replace(/B/g, "8")
      .replace(/Z/g, "2");
  }

  // ======================================================
  // 🚀 Iniciar câmera
  // ======================================================
  useEffect(() => {
    let stream;
    let intervalId;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        intervalId = startOCRLoop();
      } catch (e) {
        setError("Erro ao acessar câmera.");
        console.error(e);
      }
    }

    start();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (intervalId) clearInterval(intervalId);
      setScanning(false);
    };
  }, [mode]);

  // ======================================================
  // 🧠 OCR LOOP — leitura contínua
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

      // ===== Recorte ajustado por modo =====
      let cropW, cropH, cropX, cropY;

      if (mode === "plate") {
        cropW = fullW * 0.80;
        cropH = fullH * 0.20;
        cropX = (fullW - cropW) / 2;
        cropY = fullH * 0.60;
      } else {
        cropW = fullW * 0.55;
        cropH = fullH * 0.30;
        cropX = (fullW - cropW) / 2;
        cropY = (fullH - cropH) / 2;
      }

      canvas.width = cropW;
      canvas.height = cropH;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // ===== Pré-processamento =====
      let frame = ctx.getImageData(0, 0, cropW, cropH);
      let data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        let g = 0.3 * data[i] + 0.59 * data[i+1] + 0.11 * data[i+2];
        g = g < 140 ? 0 : 255;
        data[i] = data[i+1] = data[i+2] = g;
      }

      ctx.putImageData(frame, 0, 0);

      // ===== OCR =====
      let whitelist = mode === "plate"
        ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        : "0123456789()+- ";

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: whitelist
        });

        let raw = result.data.text.toUpperCase().trim();
        let clean = raw.replace(/[^A-Z0-9]/g, "");

        console.log("RAW:", raw);
        console.log("CLEAN:", clean);

        // ======================================================
        // 🎯 DETECÇÃO DE PLACA — AGORA ULTRA PRECISA
        // ======================================================
        if (mode === "plate") {
          if (clean.length !== 7) return; // tamanho exato obrigatório

          let corrected = corrigirPlaca(clean);
          console.log("CORRIGIDA:", corrected);

          let isValid =
            regexPlacaMercosul.test(corrected) ||
            regexPlacaAntiga.test(corrected);

          if (!isValid) return;

          // ===== CONFIRMAÇÃO DUPLA =====
          if (lastPlateRaw === corrected) {
            clearInterval(intervalId); // para OCR
            onDetectPlate(corrected);
            onBack();                  // volta imediatamente
            return;
          }

          // Primeira leitura → armazena temporário
          setLastPlateRaw(corrected);

          // Limpa caso não confirme em 1s
          if (confirmTimer) clearTimeout(confirmTimer);
          setConfirmTimer(setTimeout(() => setLastPlateRaw(""), 1000));

          return;
        }

        // ======================================================
        // 🎯 DETECÇÃO DE TELEFONE
        // ======================================================
        if (mode === "phone") {
          const phoneMatch = raw.match(
            /(\+?\d{1,3}[- ]?)?(\(?\d{2,3}\)?[- ]?)?(\d{4,5}[- ]?\d{4})/
          );
          if (phoneMatch) {
            onDetectNumber(phoneMatch[0]);
            onBack();
          }
        }

      } catch (e) {
        console.error("OCR falhou:", e);
      }
    }, 700);

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
              ? "Modo especializado em leitura telefônica."
              : "Modo especializado em leitura veicular."}
          </p>
        </div>

        <div className="v-camera-actions">
          <button className="v-btn-ghost" onClick={onBack}>⬅ voltar</button>
          <div className="v-camera-chip">
            {mode === "phone" ? "leitura telefone" : "leitura placa"}
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
                <span>Ative a câmera e recarregue a página.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
