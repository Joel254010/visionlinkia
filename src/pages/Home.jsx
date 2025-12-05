import { useEffect, useState } from "react";
import PlateCard from "../components/PlateCard";

export default function Home({
  onStartScanPhone,
  onStartScanPlate,
  detectedNumber,
  detectedPlate,
}) {
  const [number, setNumber] = useState("+55 13 98107 1907");
  const [status, setStatus] = useState("aguardando leitura…");
  const [whatsLink, setWhatsLink] = useState("");

  // Card de placa
  const [plateOpen, setPlateOpen] = useState(false);
  const [plateValue, setPlateValue] = useState("");

  // ======================================================
  // 📌 Quando uma placa é detectada
  // ======================================================
  useEffect(() => {
    if (!detectedPlate) return;

    setPlateValue(detectedPlate);
    setPlateOpen(true);
  }, [detectedPlate]);

  // ======================================================
  // 📌 Quando um número é detectado
  // ======================================================
  useEffect(() => {
    if (!detectedNumber) return;

    const raw = detectedNumber.trim();
    const digits = raw.replace(/\D/g, "");

    if (digits.length < 8) {
      setStatus("número muito curto ou ilegível");
      return;
    }

    let finalDigits = digits;

    if (!finalDigits.startsWith("55")
        && (finalDigits.length === 10 || finalDigits.length === 11)) {
      finalDigits = "55" + finalDigits;
    }

    setNumber(raw);
    setStatus("pronto para conectar");

    const link = `https://wa.me/${finalDigits}`;
    setWhatsLink(link);
  }, [detectedNumber]);

  return (
    <main className="v-main">
      <div className="v-main-inner">

        {/* =============================================== */}
        {/*                HERO PRINCIPAL                  */}
        {/* =============================================== */}
        <section className="v-hero">
          <div className="v-hero-eyebrow">plataforma global • visionlinkia</div>

          <div className="v-hero-title">
            <h1 className="v-hero-brand">
              <span className="vision">VISION</span>
              <span className="linkia">
                link<span className="ia">ia</span>
              </span>
            </h1>

            <h2 className="v-hero-headline">
              Câmera inteligente com leitura especializada
            </h2>
          </div>

          <p className="v-hero-description">
            A <strong>VISIONlinkIA</strong> permite que você escolha o modo
            de leitura mais avançado para sua necessidade:
            <strong> contatos telefônicos</strong> ou <strong>placas veiculares</strong>.
            Nossa IA foi treinada para atuar com precisão em cenários reais.
          </p>

          {/* ====================================================== */}
          {/*            BOTÕES SEPARADOS DE LEITURA                 */}
          {/* ====================================================== */}
          <div className="v-hero-actions" style={{ gap: "1rem" }}>
            <button className="v-btn-primary" onClick={onStartScanPhone}>
              📞 Ler número de telefone
            </button>

            <button className="v-btn-secondary" onClick={onStartScanPlate}>
              🚗 Ler placa veicular
            </button>
          </div>

          <div className="v-badge-strip">
            <div className="v-badge-chip">IA híbrida: OCR + heurísticas inteligentes</div>
            <div className="v-badge-chip">Precisão aprimorada em ambientes reais</div>
            <div className="v-badge-chip">Leitura segmentada por contexto</div>
            <div className="v-badge-chip">Pronto para super-app VisionlinkIA</div>
          </div>
        </section>

        {/* ====================================================== */}
        {/*                 VISOR DINÂMICO DO TELEFONE             */}
        {/* ====================================================== */}
        <section className="v-hero-scanner">
          <div className="v-hero-scanner-inner">
            <div className="v-scanner-frame">
              <div className="v-scanner-grid" />
              <div className="v-scanner-line" />

              <div className="v-scanner-content">
                <div>
                  <div className="v-scanner-number">{number}</div>
                  <div className="v-scanner-tag">
                    número detectado • {status}
                  </div>
                </div>

                <div className="v-scanner-footer">
                  <div className="v-scanner-status">
                    <span className="v-dot"></span>
                    <span>scanner ativo (telefone)</span>
                  </div>

                  <div className="v-scanner-chip">modo leitura telefônica • v2.0</div>
                </div>

                {whatsLink && status === "pronto para conectar" && (
                  <a
                    className="v-btn-primary"
                    href={whatsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: "1rem", display: "inline-flex" }}
                  >
                    💬 falar com este número no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/*          SESSÃO EXPLICATIVA SOBRE TELEFONE            */}
        {/* ====================================================== */}
        <section className="v-extra-section">
          <div className="v-extra-title">Leitura inteligente de números</div>
          <p className="v-extra-sub">
            A IA identifica padrões internacionais de telefonia automaticamente.
          </p>

          <div className="v-extra-grid">
            <div className="v-extra-card">
              <h3>📲 Reconhecimento avançado</h3>
              <p>A VisionlinkIA extrai números até em ambientes desfavoráveis.</p>
            </div>

            <div className="v-extra-card">
              <h3>🌍 Compatível com DDI</h3>
              <p>Do Brasil ao Japão: detectamos padrões globais.</p>
            </div>

            <div className="v-extra-card">
              <h3>⚡ Conexão Instantânea</h3>
              <p>Toque uma vez e fale no WhatsApp.</p>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/*           SESSÃO EXPLICATIVA SOBRE PLACAS             */}
        {/* ====================================================== */}
        <section className="v-extra-section-alt">
          <div className="v-extra-title">Leitura especializada de placas</div>

          <div className="v-applications-grid">
            <div className="v-app-card">
              <h3>🚗 Placas Mercosul</h3>
              <p>Reconhecimento otimizado para AAA1B23.</p>
            </div>

            <div className="v-app-card">
              <h3>🚘 Placas antigas</h3>
              <p>Detecta modelos no padrão AAA-1234.</p>
            </div>

            <div className="v-app-card">
              <h3>🧠 IA com autocorreção</h3>
              <p>Corrige falhas comuns do OCR automaticamente.</p>
            </div>

            <div className="v-app-card">
              <h3>🔎 Pesquisa automática</h3>
              <p>Integração direta com o card de informações veiculares.</p>
            </div>
          </div>
        </section>

        <section className="v-future-section">
          <div className="v-extra-title">Tecnologia VisionlinkIA</div>
          <p className="v-extra-sub">
            Evoluindo diariamente com novos módulos inteligentes.
          </p>

          <div className="v-btn-primary" onClick={onStartScanPhone}>
            🌐 testar leitura instantânea
          </div>
        </section>

        {/* ====================================================== */}
        {/*            📌 CARD DE PLACA DETECTADA                 */}
        {/* ====================================================== */}
        {plateOpen && (
          <PlateCard plate={plateValue} onClose={() => setPlateOpen(false)} />
        )}
      </div>
    </main>
  );
}
