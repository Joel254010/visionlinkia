import { useState } from "react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Camera from "./pages/Camera.jsx";

export default function App() {
  // controla a troca de telas
  const [screen, setScreen] = useState("home"); // 'home' | 'camera'

  // número detectado pelo OCR
  const [detectedNumber, setDetectedNumber] = useState("");

  // NOVO → placa detectada pelo OCR
  const [detectedPlate, setDetectedPlate] = useState("");

  const goToCamera = () => setScreen("camera");
  const goToHome = () => setScreen("home");

  return (
    <div className="vision-app">
      {/* Topo */}
      <Header onStartScan={goToCamera} />

      {/* TELA HOME → recebe número e placa */}
      {screen === "home" && (
        <Home
          onStartScan={goToCamera}
          detectedNumber={detectedNumber}
          detectedPlate={detectedPlate}   // <-- ADICIONADO
        />
      )}

      {/* TELA CÂMERA → detecta número e placa */}
      {screen === "camera" && (
        <Camera
          onBack={goToHome}
          onDetectNumber={setDetectedNumber}
          onDetectPlate={setDetectedPlate}   // <-- ADICIONADO
        />
      )}

      {/* Rodapé */}
      <footer className="v-footer">
        VisionlinkIA • câmera inteligente para leitura de contatos —
        <span>&nbsp;versão web 1.2</span>
      </footer>
    </div>
  );
}
