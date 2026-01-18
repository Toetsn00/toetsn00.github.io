import React, { useRef } from "react";

interface SelectImgButtonProps {
  onFileSelect: (file: File) => void;
}

/* 이미지 선택 버튼 */
export const SelectImgButton: React.FC<SelectImgButtonProps> = ({
  onFileSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  /* 선택한 파일 onFileSelect에 저장 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <>
      <button className="imgBox-button" onClick={handleButtonClick}>
        <p className="imgBox-button-text">이미지 선택</p>
      </button>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

/* 사진 촬영 버튼 */
export const CaptureImgButton: React.FC<SelectImgButtonProps> = ({
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleButtonClick = () => {
    if (!isMobile) {
      alert("사진 촬영은 모바일에서만 지원됩니다 :/");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <>
      <button className="imgBox-button" onClick={handleButtonClick}>
        <p className="imgBox-button-text">사진 찍기</p>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </>
  );
};

interface ReloadButtonProps {
  onReroll: () => void;
}

/* 다시 뽑기 버튼 */
export const ReloadButton: React.FC<ReloadButtonProps> = ({ onReroll }) => {
  const handleButtonClick = () => {
    onReroll();
  };

  return (
    <>
      <button className="imgBox-button" onClick={handleButtonClick}>
        <p className="imgBox-button-text">다시 뽑기</p>
      </button>
    </>
  );
};

interface ResetButtonProps {
  onReset: () => void;
}

/* 초기화 버튼 */
export const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
  const handleButtonClick = () => {
    onReset();
  };

  return (
    <>
      <button className="imgBox-button" onClick={handleButtonClick}>
        <p className="imgBox-button-text">초기화</p>
      </button>
    </>
  );
};
