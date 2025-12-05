import { useEffect, useState } from "react";

/**
 * PlateCard.jsx
 * Exibe informações da placa detectada + valor FIPE via consulta direta.
 * Totalmente sem backend — usa API FIPE pública.
 */
export default function PlateCard({ plate, onClose }) {
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plate) return;
    fetchVehicleData(plate);
  }, [plate]);

  // ==========================================================
  // 🔍 Função principal: consulta FIPE por placa (API pública)
  // ==========================================================
  async function fetchVehicleData(placa) {
    try {
      setLoading(true);
      setError("");

      // API Pública para consulta FIPE por placa (substituta até API oficial)
      const url = `https://brasilapi.com.br/api/fipe-veiculo/v1/${placa}`;
      const response = await fetch(url);

      if (!response.ok) {
        setError("Não encontramos informações FIPE para esta placa.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data || Object.keys(data).length === 0) {
        setError("Nenhum dado encontrado para esta placa.");
        setLoading(false);
        return;
      }

      setVehicle(data);

      // Salvar histórico local
      saveHistory(placa, data);

    } catch (err) {
      console.log("Erro ao consultar FIPE:", err);
      setError("Erro ao consultar dados da placa.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // 💾 Salvamento no LocalStorage
  // ==========================================================
  function saveHistory(placa, data) {
    const history = JSON.parse(localStorage.getItem("vision_history") || "[]");

    const novoRegistro = {
      placa,
      data: new Date().toISOString(),
      info: data,
    };

    const updated = [novoRegistro, ...history].slice(0, 10); // mantém só os 10 últimos
    localStorage.setItem("vision_history", JSON.stringify(updated));
  }

  // ==========================================================
  // 🎨 Interface visual
  // ==========================================================
  return (
    <div className="plate-card-overlay">
      <div className="plate-card">
        <button className="plate-close" onClick={onClose}>✖</button>

        <h1 className="plate-title">Placa Detectada</h1>
        <div className="plate-code">{plate}</div>

        {loading && <p className="plate-loading">Carregando informações...</p>}

        {error && (
          <p className="plate-error">
            ⚠ {error}
          </p>
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
          max-width: 400px;
          background: #0F172A;
          color: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          position: relative;
          animation: slideUp .3s ease;
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
        .plate-close:hover {
          opacity: 1;
        }

        .plate-title {
          font-size: 1.2rem;
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .plate-code {
          font-size: 28px;
          padding: 10px 0;
          margin-bottom: 15px;
          font-weight: bold;
          color: #22C55E;
          letter-spacing: 2px;
        }

        .plate-info p {
          margin: 6px 0;
          font-size: 15px;
        }

        .plate-price {
          margin-top: 15px;
          font-size: 18px;
          background: #1E293B;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
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
