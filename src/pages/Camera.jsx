import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function Camera({ mode, onBack, onDetectNumber, onDetectPlate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // refs para controle interno
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const processingRef = useRef(false);

  const lastPlateRef = useRef("");
  const confirmTimeoutRef = useRef(null);
  const phoneSentRef = useRef(false);

  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  // ======================================================
  // 🔍 REGEX PLACAS BRASIL (MERCOSUL + ANTIGA)
  // ======================================================
  const regexPlacaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/; // AAA1B23
  const regexPlacaAntiga = /^[A-Z]{3}[0-9]{4}$/; // AAA1234

  // ======================================================
  // 🔧 Correção automática OCR
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
  // ♻️ Função para encerrar câmera + OCR
  // ======================================================
  function stopAll() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (confirmTimeoutRef.current) {
      clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }

    processingRef.current = false;
    setScanning(false);
  }

  // ======================================================
  // 🚀 Iniciar câmera sempre que o modo mudar
  // ======================================================
  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        stopAll(); // garante que não tem nada antigo rodando

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        lastPlateRef.current = "";
        phoneSentRef.current = false;
        setError("");

        startOCRLoop();
      } catch (e) {
        console.error("Erro ao acessar câmera:", e);
        setError("Erro ao acessar câmera.");
      }
    }

    start();

    return () => {
      cancelled = true;
      stopAll();
    };
    // importante: reinicia se o modo mudar
  }, [mode]);

  // ======================================================
  // 🧠 OCR LOOP — leitura contínua, mas 1 por vez
  // ======================================================
  function startOCRLoop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setScanning(true);

    const delay = mode === "plate" ? 1200 : 900; // placas um pouco mais leve

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const fullW = video.videoWidth;
      const fullH = video.videoHeight;
      if (!fullW || !fullH) return;

      // não deixa empilhar OCR
      if (processingRef.current) return;
      processingRef.current = true;

      const ctx = canvas.getContext("2d");

      // ===== Recorte ajustado por modo =====
      let cropW, cropH, cropX, cropY;

      if (mode === "plate") {
        // Placas mais horizontais, próximo da parte inferior
        cropW = fullW * 0.8;
        cropH = fullH * 0.22;
        cropX = (fullW - cropW) / 2;
        cropY = fullH * 0.55;
      } else {
        // Telefones mais centrais
        cropW = fullW * 0.55;
        cropH = fullH * 0.30;
        cropX = (fullW - cropW) / 2;
        cropY = (fullH - cropH) / 2;
      }

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      // ===== Pré-processamento (B/W) =====
      const frame = ctx.getImageData(0, 0, cropW, cropH);
      const data = frame.data;

      for (let i = 0; i < data.length; i += 4) {
        let g = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        g = g < 140 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = g;
      }

      ctx.putImageData(frame, 0, 0);

      // ===== OCR =====
      const whitelist =
        mode === "plate"
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          : "0123456789()+- ";

      try {
        const result = await Tesseract.recognize(canvas, "eng", {
          tessedit_char_whitelist: whitelist,
        });

        let raw = result.data.text.toUpperCase().trim();
        let clean = raw.replace(/[^A-Z0-9]/g, "");

        console.log("[OCR RAW]", raw);
        console.log("[OCR CLEAN]", clean);

        // ======================================================
        // 🎯 DETECÇÃO DE PLACA
        // ======================================================
        if (mode === "plate") {
          if (clean.length !== 7) {
            processingRef.current = false;
            return;
          }

          const corrected = corrigirPlaca(clean);
          console.log("[PLACACORRIGIDA]", corrected);

          const isValid =
            regexPlacaMercosul.test(corrected) ||
            regexPlacaAntiga.test(corrected);

          if (!isValid) {
            processingRef.current = false;
            return;
          }

          // confirmação dupla: precisa ler a mesma placa 2 vezes seguidas
          if (lastPlateRef.current === corrected) {
            stopAll(); // para OCR + câmera
            onDetectPlate?.(corrected);
            onBack(); // volta para o Home
            return;
          }

          // primeira leitura: guarda e arma um timeout para limpar
          lastPlateRef.current = corrected;
          if (confirmTimeoutRef.current) {
            clearTimeout(confirmTimeoutRef.current);
          }
          confirmTimeoutRef.current = setTimeout(() => {
            lastPlateRef.current = "";
          }, 1000);

          processingRef.current = false;
          return;
        }

        // ======================================================
        // 🎯 DETECÇÃO DE TELEFONE
        // ======================================================
        if (mode === "phone") {
          if (phoneSentRef.current) {
            processingRef.current = false;
            return;
          }

          const phoneMatch = raw.match(
            /(\+?\d{1,3}[- ]?)?(\(?\d{2,3}\)?[- ]?)?(\d{4,5}[- ]?\d{4})/
          );

          if (phoneMatch) {
            const phone = phoneMatch[0];
            phoneSentRef.current = true;
            stopAll();
            onDetectNumber?.(phone);
            onBack();
            return;
          }

          processingRef.current = false;
          return;
        }

        processingRef.current = false;
      } catch (e) {
        console.error("OCR falhou:", e);
        processingRef.current = false;
      }
    }, delay);
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
          <button
            className="v-btn-ghost"
            onClick={() => {
              stopAll();
              onBack();
            }}
          >
            ⬅ voltar
          </button>
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
