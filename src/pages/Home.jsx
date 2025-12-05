import { useEffect, useState } from "react";
import PlateCard from "../components/PlateCard";

export default function Home({
  onStartScanPhone,
  onStartScanPlate,
  detectedNumber,
  detectedPlate,
}) {
  // ===== TELEFONE =====
  const [number, setNumber] = useState("");
  const [whatsLink, setWhatsLink] = useState("");
  const [phoneStatus, setPhoneStatus] = useState("aguardando leitura…");

  // ===== PLACA =====
  const [plateValue, setPlateValue] = useState("");
  const [plateOpen, setPlateOpen] = useState(false);

  // ===== CARD PREMIUM DINÂMICO =====
  const [activeMode, setActiveMode] = useState(null); 
  // valores possíveis: "phone" | "plate" | null

  // ======================================================
  // 📌 DETECÇÃO DE PLACA
  // ======================================================
  useEffect(() => {
    if (!detectedPlate) return;

    setPlateValue(detectedPlate);
    setPlateOpen(true);
    setActiveMode("plate");
  }, [detectedPlate]);

  // ======================================================
  // 📌 DETECÇÃO DE TELEFONE
  // ======================================================
  useEffect(() => {
    if (!detectedNumber) return;

    const raw = detectedNumber.trim();
    const digits = raw.replace(/\D/g, "");

    if (digits.length < 8) {
      setPhoneStatus("número muito curto ou ilegível");
      return;
    }

    let finalDigits = digits;

    if (
      !finalDigits.startsWith("55") &&
      (finalDigits.length === 10 || finalDigits.length === 11)
    ) {
      finalDigits = "55" + finalDigits;
    }

    setNumber(raw);
    setPhoneStatus("pronto para conectar");

    setWhatsLink(`https://wa.me/${finalDigits}`);
    setActiveMode("phone");
  }, [detectedNumber]);

  // ======================================================
  // 📌 CARD PREMIUM – SUPER ESTILIZADO
  // ======================================================
  const renderDynamicCard = () => {
    if (!activeMode) return null;

    return (
      <section className="v-premium-wrapper">
        <div className="v-premium-glow"></div>

        <div className="v-premium-card">
          <div className="v-scanner-grid" />
          <div className="v-scanner-line" />

          {/* === TELEFONE === */}
          {activeMode === "phone" && (
            <div className="v-premium-inner">
              <div className="v-premium-number">{number}</div>
              <div className="v-premium-tag">número detectado • {phoneStatus}</div>

              <div className="v-premium-footer">
                <div className="v-status">
                  <span className="v-dot"></span>
                  scanner ativo (telefone)
                </div>

                <div className="v-chip">modo leitura telefônica • v2.0</div>
              </div>

              {whatsLink && phoneStatus === "pronto para conectar" && (
                <a
                  href={whatsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v-premium-btn"
                >
                  💬 falar com este número no WhatsApp
                </a>
              )}
            </div>
          )}

          {/* === PLACA === */}
          {activeMode === "plate" && (
            <div className="v-premium-inner">
              <div className="v-premium-number">{plateValue}</div>
              <div className="v-premium-tag">
                placa detectada • padrão reconhecido
              </div>

              <div className="v-premium-footer">
                <div className="v-status">
                  <span className="v-dot"></span>
                  scanner ativo (placa)
                </div>

                <div className="v-chip">modo leitura veicular • v2.0</div>
              </div>

              <button
                className="v-premium-btn"
                onClick={() => setPlateOpen(true)}
              >
                🚗 ver informações do veículo
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  // ======================================================
  // 📌 LAYOUT COMPLETO
  // ======================================================
  return (
    <main className="v-main">
      <div className="v-main-inner">

        {/* ================= HERO ================= */}
        <section className="v-hero">
          <div className="v-hero-eyebrow">plataforma global • visionlinkia</div>

          <div className="v-hero-title">
            <h1 className="v-hero-brand">
              <span className="vision">VISION</span>
              <span className="linkia">
                link<span className="ia">ia</span>
              </span>
            </h1>

            <h2 className="v-hero-headline">Câmera inteligente VisionlinkIA</h2>
          </div>

          <p className="v-hero-description">
            Escolha o modo de leitura avançado:{" "}
            <strong>telefone</strong> ou <strong>placa veicular</strong>.
          </p>

          <div className="v-hero-actions">
            <button className="v-btn-primary" onClick={onStartScanPhone}>
              📞 Ler número de telefone
            </button>

            <button className="v-btn-secondary" onClick={onStartScanPlate}>
              🚗 Ler placa veicular
            </button>
          </div>

          <div className="v-badge-strip">
            <div className="v-badge-chip">OCR neural inteligente</div>
            <div className="v-badge-chip">Precisão aprimorada</div>
            <div className="v-badge-chip">Modo duplo</div>
            <div className="v-badge-chip">Arquitetura VisionlinkIA</div>
          </div>
        </section>

        {/* CARD PREMIUM */}
        {renderDynamicCard()}

        {/* SEÇÕES INFORMATIVAS (inalteradas) */}
        <section className="v-extra-section">
          <div className="v-extra-title">Leitura inteligente de números</div>
          <div className="v-extra-grid">
            <div className="v-extra-card">
              <h3>📲 Reconhecimento avançado</h3>
              <p>Extrai números até em ambientes desfavoráveis.</p>
            </div>
            <div className="v-extra-card">
              <h3>🌍 Compatível com DDI</h3>
              <p>De +1 a +81, telefonia global.</p>
            </div>
            <div className="v-extra-card">
              <h3>⚡ Conexão instantânea</h3>
              <p>Um toque e você fala no WhatsApp.</p>
            </div>
          </div>
        </section>

        <section className="v-extra-section-alt">
          <div className="v-extra-title">Leitura especializada de placas</div>
          <div className="v-applications-grid">
            <div className="v-app-card"><h3>🚗 Mercosul</h3></div>
            <div className="v-app-card"><h3>🚘 Antigas</h3></div>
            <div className="v-app-card"><h3>🧠 Autocorreção</h3></div>
            <div className="v-app-card"><h3>🔎 Análise completa</h3></div>
          </div>
        </section>

        {/* CARD DE PLACA */}
        {plateOpen && (
          <PlateCard plate={plateValue} onClose={() => setPlateOpen(false)} />
        )}
      </div>
    </main>
  );
}
