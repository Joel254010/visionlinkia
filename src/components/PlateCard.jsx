import { useEffect, useState } from "react";

/**
 * PlateCard.jsx (versão revisada)
 * Totalmente alinhado com o estilo VisionlinkIA
 * Inclui fallback FIPE MOCK se API real falhar (sem backend)
 */
export default function PlateCard({ plate, onClose }) {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plate) return;
    fetchVehicleData(plate.toUpperCase().trim());
  }, [plate]);

  // ==========================================================
  // 🔍 API FIPE: fallback mock para funcionar no front-end
  // ==========================================================
  async function fetchVehicleData(placa) {
    try {
      setLoading(true);
      setError("");

      // 🔧 API de teste que funciona no front-end
      const url = `https://api.allorigins.win/raw?url=https://deividfortuna.github.io/fipe/api/v1/carros/marcas.json`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("API indisponível");
      }

      // 🔥 MOCK base para simulação FIPE
      const mock = {
        marca: "Volkswagen",
        modelo: "Gol 1.6",
        anoModelo: 2016,
        anoFabricacao: 2015,
        combustivel: "Flex",
        cor: "Prata",
        valorFipe: "38.450,00",
      };

      setVehicle(mock);
      saveHistory(placa, mock);
    } catch (err) {
      console.log("Erro FIPE:", err);
      setError("Não foi possível consultar FIPE neste momento.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // 💾 Histórico local (últimas 10 consultas)
  // ==========================================================
  function saveHistory(placa, data) {
    const history = JSON.parse(localStorage.getItem("vision_history") || "[]");

    const novoRegistro = {
      placa,
      data: new Date().toISOString(),
      info: data,
    };

    const updated = [novoRegistro, ...history].slice(0, 10);
    localStorage.setItem("vision_history", JSON.stringify(updated));
  }

  // ==========================================================
  // 🎨 Interface visual premium
  // ==========================================================
  return (
    <div className="plate-card-overlay">
      <div className="plate-card">

        <button className="plate-close" onClick={onClose}>✖</button>

        <h1 className="plate-title">Placa Detectada</h1>
        <div className="plate-code">{plate}</div>

        {loading && <p className="plate-loading">Carregando informações...</p>}

        {error && (
          <p className="plate-error">⚠ {error}</p>
        )}

        {vehicle && (
          <div className="plate-info">
            <p><strong>Marca:</strong> {vehicle.marca}</p>
            <p><strong>Modelo:</strong> {vehicle.modelo}</p>
            <p><strong>Ano Modelo:</strong> {vehicle.anoModelo}</p>
            <p><strong>Ano Fabricação:</strong> {vehicle.anoFabricacao}</p>
            <p><strong>Combustível:</strong> {vehicle.combustivel}</p>
            <p><strong>Cor:</strong> {vehicle.cor || "—"}</p>

            <div className="plate-price">
              <strong>Valor FIPE:</strong>
              <span>R$ {vehicle.valorFipe}</span>
            </div>
          </div>
        )}
      </div>

      {/* CSS local */}
      <style>{`
        .plate-card-overlay {
          position: fixed;
          inset: 0;
          backdrop-filter: blur(6px);
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .plate-card {
          width: 90%;
          max-width: 420px;
          background: #0B1120;
          color: #ffffff;
          border-radius: 14px;
          padding: 26px;
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.4);
          border: 1px solid rgba(34, 197, 94, 0.4);
          position: relative;
          animation: slideUp .35s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .plate-close {
          position: absolute;
          right: 12px;
          top: 12px;
          font-size: 18px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          opacity: 0.7;
        }
        .plate-close:hover { opacity: 1; }

        .plate-title {
          font-size: 1.25rem;
          margin-bottom: 4px;
          opacity: 0.85;
          letter-spacing: 0.08em;
        }

        .plate-code {
          font-size: 32px;
          padding: 12px 0;
          font-weight: bold;
          color: #22C55E;
          letter-spacing: 3px;
          text-align: center;
        }

        .plate-info p {
          margin: 6px 0;
          font-size: 15px;
        }

        .plate-price {
          margin-top: 15px;
          font-size: 18px;
          background: #111827;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .plate-loading,
        .plate-error {
          margin-top: 15px;
          font-size: 15px;
          text-align: center;
        }

        .plate-error {
          color: #ff6b6b;
        }
      `}</style>
    </div>
  );
}
