import { useEffect, useState } from "react";
import PlateCard from "../components/PlateCard";

export default function Home({ onStartScan, detectedNumber, detectedPlate }) {
  const [number, setNumber] = useState("+55 13 98107 1907");
  const [status, setStatus] = useState("aguardando leitura…");
  const [whatsLink, setWhatsLink] = useState("");

  // NOVO → Estado para abrir/fechar o card de placa detectada
  const [plateOpen, setPlateOpen] = useState(false);
  const [plateValue, setPlateValue] = useState("");

  // ======================================================
  // 🔥 PROCESSA PLACA DETECTADA PELO OCR
  // ======================================================
  useEffect(() => {
    if (!detectedPlate) return;

    setPlateValue(detectedPlate);
    setPlateOpen(true);

  }, [detectedPlate]);

  // ======================================================
  // 🔥 PROCESSA NÚMERO DETECTADO PELO OCR (continua igual)
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

    if (!finalDigits.startsWith("55") && (finalDigits.length === 10 || finalDigits.length === 11)) {
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
              Câmera inteligente • leitura de contatos em tempo real
            </h2>
          </div>

          <p className="v-hero-description">
            A <strong>VISIONlinkIA</strong> transforma qualquer número que você vê em{" "}
            <strong>conexão instantânea</strong>.  
            Escaneie, identifique e conecte — tudo em segundos,
            com tecnologia global de visão artificial.
          </p>

          <div className="v-hero-actions">
            <button className="v-btn-primary" onClick={onStartScan}>
              <span className="icon">📸</span>
              <span>abrir câmera inteligente</span>
            </button>

            <button type="button" className="v-btn-ghost" onClick={onStartScan}>
              <span>ver modo scanner em tempo real</span>
            </button>
          </div>

          <div className="v-badge-strip">
            <div className="v-badge-chip">Leitura global em tempo real</div>
            <div className="v-badge-chip">Compatível com qualquer país</div>
            <div className="v-badge-chip">Conexão instantânea via IA</div>
            <div className="v-badge-chip">Pronto para virar super-app mobile</div>
          </div>
        </section>

        {/* =============================================== */}
        {/*            VISOR SCANNER — DINÂMICO            */}
        {/* =============================================== */}
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
                    <span>scanner ativo</span>
                  </div>

                  <div className="v-scanner-chip">modo demonstração • v1.1</div>
                </div>

                {/* BOTÃO MANUAL — abrir WhatsApp */}
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

      </div>

      {/* =================================================== */}
      {/*        SESSÕES INFORMATIVAS / FUTURO IA            */}
      {/* =================================================== */}
      <section className="v-extra-section">
        <div className="v-extra-title">Por que a VisionlinkIA é tão inovadora?</div>
        <p className="v-extra-sub">
          A tecnologia embarcada na VisionlinkIA redefine como humanos se conectam
          a partir do mundo físico.
        </p>

        <div className="v-extra-grid">
          <div className="v-extra-card">
            <h3>📡 Leitura instantânea</h3>
            <p>A IA identifica números em superfícies físicas e digitais.</p>
          </div>

          <div className="v-extra-card">
            <h3>🌎 Inteligência Global</h3>
            <p>Compatível com padrões internacionais de numeração.</p>
          </div>

          <div className="v-extra-card">
            <h3>🤖 IA de Visão Avançada</h3>
            <p>OCR neural com foco em cenários reais e texto pequeno.</p>
          </div>

          <div className="v-extra-card">
            <h3>⚡ Conexão Automática</h3>
            <p>Números detectados viram links diretos para atendimento.</p>
          </div>
        </div>
      </section>

      <section className="v-extra-section-alt">
        <div className="v-extra-title">Aplicações Reais da VisionlinkIA</div>

        <div className="v-applications-grid">
          <div className="v-app-card">
            <h3>🏢 Cartões Empresariais</h3>
            <p>Escaneie e fale direto com o responsável.</p>
          </div>

          <div className="v-app-card">
            <h3>🚐 Veículos e Outdoors</h3>
            <p>Transforme anúncios na rua em contatos em segundos.</p>
          </div>

          <div className="v-app-card">
            <h3>🛍️ Etiquetas e Embalagens</h3>
            <p>Atendimento instantâneo a partir de embalagens.</p>
          </div>

          <div className="v-app-card">
            <h3>📱 Telas e prints</h3>
            <p>Detecta números até em screenshots e monitores.</p>
          </div>
        </div>
      </section>

      <section className="v-future-section">
        <div className="v-extra-title">Tecnologia que evolui todos os dias</div>
        <p className="v-extra-sub">
          Em breve: identificação de nomes, empresas, QR codes, links e muito mais.
        </p>

        <button className="v-btn-primary" onClick={onStartScan}>
          🌐 experimentar o futuro agora
        </button>
      </section>

      {/* =================================================== */}
      {/*            📌 CARD DE PLACA DETECTADA             */}
      {/* =================================================== */}
      {plateOpen && (
        <PlateCard
          plate={plateValue}
          onClose={() => setPlateOpen(false)}
        />
      )}
    </main>
  );
}
