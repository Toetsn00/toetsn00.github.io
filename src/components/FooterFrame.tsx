import React from "react";

const FooterFrame: React.FC = () => {
  return (
    <div className="footerFrame">
      <p className="info">
        <span style={{ fontWeight: 300 }}>by </span>
        <span style={{ fontWeight: 500 }}>EUNGYEOM ∙ </span>
        <span style={{ fontWeight: 300 }}>github </span>
        <span style={{ fontWeight: 500 }}>@Toetsn00</span>
      </p>
      <p className="copyright">© 2026 by Eungyeom. All rights reserved.</p>
    </div>
  );
};

export default FooterFrame;
