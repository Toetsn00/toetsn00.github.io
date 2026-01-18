import React from "react";

const HeaderFrame: React.FC = () => {
  return (
    <div className="headerFrame">
      <h1 className="title">Pick A Face</h1>
      <p className="title-description">
        얼굴인식 모델을 이용해 사진에서 무작위로 사람을 뽑으세요!
      </p>
    </div>
  );
};

export default HeaderFrame;
