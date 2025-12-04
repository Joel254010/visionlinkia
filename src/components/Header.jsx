export default function Header({ onStartScan }) {
  return (
    <header className="v-header">
      <div className="v-header-inner">

        {/* LOGO + IDENTIDADE */}
        <div className="v-header-brand">
          <div className="v-logo-mark">VL</div>

          <div className="v-logo-text">
            <div className="v-logo-main">
              <span className="vision">VISION</span>
              <span className="link">link</span>
              <span className="ia">IA</span>
            </div>
            <div className="v-logo-sub">câmera inteligente de conexão</div>
          </div>
        </div>

        {/* CTA DO HEADER */}
        <div className="v-header-cta">
          <div className="v-pill">
            alimentado por <span>IA</span>
          </div>

          <button className="v-header-btn" onClick={onStartScan}>
            <span className="icon">⚡</span>
            <span>iniciar leitura</span>
          </button>
        </div>
      </div>
    </header>
  );
}
