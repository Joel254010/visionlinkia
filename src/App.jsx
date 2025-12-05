import { useState } from "react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Camera from "./pages/Camera.jsx";

export default function App() {
  // controla a troca de telas
  const [screen, setScreen] = useState("home");

  // modo atual de leitura: "phone" | "plate" | null
  const [scanMode, setScanMode] = useState(null);

  // número detectado pelo OCR
  const [detectedNumber, setDetectedNumber] = useState("");

  // placa detectada pelo OCR
  const [detectedPlate, setDetectedPlate] = useState("");

  // ir para câmera no modo TELEFONE
  const startPhoneScan = () => {
    setScanMode("phone");
    setScreen("camera");
  };

  // ir para câmera no modo PLACA
  const startPlateScan = () => {
    setScanMode("plate");
    setScreen("camera");
  };

  // voltar para home
  const goToHome = () => setScreen("home");

  return (
    <div className="vision-app">
      
      {/* Header */}
      <Header 
        onStartScan={startPhoneScan} 
      />

      {/* ============================== */}
      {/*            HOME                */}
      {/* ============================== */}
      {screen === "home" && (
        <Home
          onStartScanPhone={startPhoneScan}
          onStartScanPlate={startPlateScan}
          detectedNumber={detectedNumber}
          detectedPlate={detectedPlate}
        />
      )}

      {/* ============================== */}
      {/*            CAMERA              */}
      {/* ============================== */}
      {screen === "camera" && (
        <Camera
          mode={scanMode}
          onBack={goToHome}
          onDetectNumber={setDetectedNumber}
          onDetectPlate={setDetectedPlate}
        />
      )}

      {/* Rodapé */}
      <footer className="v-footer">
        VisionlinkIA • câmera inteligente para leitura de contatos —
        <span>&nbsp;versão web 1.3</span>
      </footer>
    </div>
  );
}
