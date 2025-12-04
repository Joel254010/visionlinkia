import { useEffect, useState } from "react";

export default function Home({ onStartScan, detectedNumber }) {
  const [number, setNumber] = useState("+55 13 98107 1907"); 
  const [status, setStatus] = useState("aguardando leitura…");
  const [whatsLink, setWhatsLink] = useState("");
  const [lastOpened, setLastOpened] = useState(""); // evita abrir várias vezes

  // Atualização quando o OCR envia um número REAL
  useEffect(() => {
    if (detectedNumber && detectedNumber.length >= 8) {
      setNumber(detectedNumber);
      setStatus("pronto para conectar");

      // Limpa caracteres que o WhatsApp não aceita
      const cleaned = detectedNumber.replace(/\D/g, "");
      const link = `https://wa.me/${cleaned}`;
      setWhatsLink(link);

      // Evita abrir WhatsApp mais de uma vez para o mesmo número
      if (cleaned !== lastOpened) {
        setLastOpened(cleaned);

        // Delay curto para garantir que a UI atualize antes de abrir
        setTimeout(() => {
          window.open(link, "_blank");
        }, 600);
      }
    }
  }, [detectedNumber]);

  return (
    <main className="v-main">
      <div className="v-main-inner">

        {/* =============================== */}
        {/* HERO PRINCIPAL */}
        {/* =============================== */}
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

        {/* =============================== */}
        {/* VISOR SCANNER — DINÂMICO */}
        {/* =============================== */}
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

                  <div className="v-scanner-chip">modo demonstração • v1.0</div>
                </div>

                {/* BOTÃO MANUAL PARA WHATSAPP (mantido) */}
                {whatsLink && (
                  <a
                    className="v-btn-primary"
                    href={whatsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: "1rem", display: "inline-flex" }}
                  >
                    💬 abrir conversa no whatsapp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* =============================== */}
      {/*   SESSÕES INFORMATIVAS */}
      {/* =============================== */}

      <section className="v-extra-section">
        <div className="v-extra-title">Por que a VisionlinkIA é tão inovadora?</div>
        <p className="v-extra-sub">
          A tecnologia embarcada na VisionlinkIA não é apenas inteligente —
          ela redefine a forma como humanos se conectam a partir do mundo físico.
        </p>

        <div className="v-extra-grid">
          <div className="v-extra-card">
            <h3>📡 Leitura instantânea</h3>
            <p>A IA identifica números em outdoors, cartões, telas, embalagens, veículos…</p>
          </div>

          <div className="v-extra-card">
            <h3>🌎 Inteligência Global</h3>
            <p>Compatível com padrões internacionais: +1, +33, +44, +55 e muito mais.</p>
          </div>

          <div className="v-extra-card">
            <h3>🤖 IA de Visão Avançada</h3>
            <p>OCR neural avançado para máxima precisão em ambientes reais.</p>
          </div>

          <div className="v-extra-card">
            <h3>⚡ Conexão Automática</h3>
            <p>A VisionlinkIA converte números em links diretos para WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* OUTRAS SESSÕES (sem alterações) */}
      <section className="v-extra-section-alt">
        <div className="v-extra-title">Aplicações Reais da VisionlinkIA</div>

        <div className="v-applications-grid">
          <div className="v-app-card">
            <h3>🏢 Cartões Empresariais</h3>
            <p>Abra conversas instantâneas com clientes.</p>
          </div>

          <div className="v-app-card">
            <h3>🚐 Veículos e Outdoors</h3>
            <p>Escaneie números de anúncios e fale imediatamente.</p>
          </div>

          <div className="v-app-card">
            <h3>🛍️ Etiquetas e Embalagens</h3>
            <p>Transforme qualquer embalagem em um contato direto.</p>
          </div>

          <div className="v-app-card">
            <h3>📱 Telas e prints</h3>
            <p>Detecta números até em capturas de tela.</p>
          </div>
        </div>
      </section>

      <section className="v-future-section">
        <div className="v-extra-title">Tecnologia que evolui todos os dias</div>
        <p className="v-extra-sub">
          Em breve: identificação de nomes, empresas, QR codes e muito mais.
        </p>

        <button className="v-btn-primary" onClick={onStartScan}>
          🌐 experimentar o futuro agora
        </button>
      </section>
    </main>
  );
}
