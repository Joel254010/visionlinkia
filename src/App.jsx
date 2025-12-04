import { useState } from "react";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Camera from "./pages/Camera.jsx";

export default function App() {
  // controla a troca de telas
  const [screen, setScreen] = useState("home"); // 'home' | 'camera'

  // estado global onde fica armazenado o número detectado pela câmera
  const [detectedNumber, setDetectedNumber] = useState("");

  const goToCamera = () => setScreen("camera");
  const goToHome = () => setScreen("home");

  return (
    <div className="vision-app">
      {/* topo */}
      <Header onStartScan={goToCamera} />

      {/* tela HOME (recebe número detectado e atualiza interface) */}
      {screen === "home" && (
        <Home
          onStartScan={goToCamera}
          detectedNumber={detectedNumber}
        />
      )}

      {/* tela CAMERA (envia número detectado para o App.jsx) */}
      {screen === "camera" && (
        <Camera
          onBack={goToHome}
          onDetectNumber={setDetectedNumber} 
        />
      )}

      {/* rodapé */}
      <footer className="v-footer">
        VisionlinkIA • câmera inteligente para leitura de contatos —
        <span>&nbsp;versão web 1.0</span>
      </footer>
    </div>
  );
}
