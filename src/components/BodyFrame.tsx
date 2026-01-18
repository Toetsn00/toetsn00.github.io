import React from "react";
import {
  CaptureImgButton,
  ReloadButton,
  ResetButton,
  SelectImgButton,
} from "./Buttons";
import { detectFaces } from "../utils/faceModel";
import { resizeImage } from "../utils/imageUtil";

const BodyFrame: React.FC = () => {
  const [userImgFile, setUserImgFile] = React.useState<File | null>(null);
  const [selectedImgUrl, setselectedImgUrl] = React.useState<string | null>(
    null,
  );
  const [resultImgUrl, setResultImgUrl] = React.useState<string | null>(null);
  const [showFrame, setShowFrame] = React.useState<
    "upload" | "loading" | "result" | "reload"
  >("upload");
  const [showReloadFrame, setShowReloadFrame] = React.useState<boolean>(false);
  const [zoomStyle, setZoomStyle] = React.useState<React.CSSProperties | null>(
    null,
  );
  const [finalResultImg, setFinalResultImg] = React.useState<string | null>(
    null,
  );

  /* 초기화 */
  const resetAll = () => {
    setselectedImgUrl(null);
    setResultImgUrl(null);
    setZoomStyle(null);
    setFinalResultImg(null);
    setShowFrame("upload");
  };

  /* 이미지 url 형태로 변환 */
  const handleSelectImg = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const imgUrl = reader.result as string;
      const resizedImgUrl = await resizeImage(imgUrl);

      setselectedImgUrl(resizedImgUrl);
      setShowFrame("loading");

      const result = await detectFaces(resizedImgUrl);
      if (!result) return;
      const { resultImg, zoomStyle, selectedFaceInfo } = result;

      setResultImgUrl(resultImg);
      setShowFrame("result");

      setTimeout(() => {
        setZoomStyle({
          transformOrigin: zoomStyle?.transformOrigin,
          transform: zoomStyle?.transform,
          transition: zoomStyle?.transition,
        });
      }, 2000);

      /* 애니메이션 끝난 후 빨간색 박스 추가 */
      setTimeout(() => {
        const canvas = document.createElement("canvas");
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          const { x, y, width, height } = selectedFaceInfo;
          const scale = 1.2;
          const scaledWidth = width * scale;
          const scaledHeight = height * scale;
          const scaledX = x - (scaledWidth - width) / 2;
          const scaledY = y - (scaledHeight - height) / 2;

          ctx.strokeStyle = "red";
          ctx.lineWidth = 6;
          ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

          setFinalResultImg(canvas.toDataURL("image/jpeg"));
        };
        img.src = resultImg;
        setShowReloadFrame(true);
      }, 4500);
    };
    reader.readAsDataURL(file);
  };

  /* 현재 보여줄 UI 결정 (업로드/로딩/결과) */
  let currentFrame = null;
  if (showFrame === "upload") {
    currentFrame = (
      <UploadFrame
        onFileSelect={(file) => {
          handleSelectImg(file);
          setUserImgFile(file);
        }}
      />
    );
  } else if (showFrame === "loading" && selectedImgUrl) {
    currentFrame = <LoadingFrame backgroundImg={selectedImgUrl} />;
  } else if (showFrame == "result" && resultImgUrl) {
    currentFrame = (
      <ResultFrame
        resultImg={finalResultImg || resultImgUrl}
        zoomStyle={zoomStyle}
        showReloadFrame={showReloadFrame}
        onReset={() => {
          resetAll();
          setShowReloadFrame(false);
        }}
        onReroll={() => {
          setZoomStyle(null);
          setFinalResultImg(null);
          handleSelectImg(userImgFile!);
          setShowReloadFrame(false);
        }}
      />
    );
  }

  return <div className="bodyFrame">{currentFrame}</div>;
};

// #region UploadFrame
interface UploadFrameProps {
  onFileSelect: (file: File) => void;
}

const UploadFrame: React.FC<UploadFrameProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onFileSelect(file);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className="imgBox"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isDragging && <DraggingFrame />}
      <div className="imgBox-elementStack">
        <div className="imgBox-textStack">
          <p className="imgBox-titleText">이미지 업로드</p>
          <p className="imgBox-titleText-description">
            이미지를 여기에 드래그하거나 아래 버튼으로 업로드
          </p>
        </div>
        <div className="imgBox-buttonStack">
          <SelectImgButton onFileSelect={onFileSelect} />
          <CaptureImgButton onFileSelect={onFileSelect} />
        </div>
      </div>
    </div>
  );
};
// #endregion

// #region LoadingFrame

interface LoadingFrameProps {
  backgroundImg: string;
}

const LoadingFrame: React.FC<LoadingFrameProps> = ({ backgroundImg }) => {
  return (
    <div
      className="imgBox"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="dim" />
      <div className="imgBox-elementStack">
        <div className="imgBox-textStack">
          <p className="imgBox-titleText">이미지 처리중...</p>
        </div>
      </div>
    </div>
  );
};
// #endregion

// #region ResultFrame
interface ResultFrameProps {
  resultImg: string;
  zoomStyle?: React.CSSProperties | null;
  showReloadFrame?: boolean;
  onReset?: () => void;
  onReroll?: () => void;
}

const ResultFrame: React.FC<ResultFrameProps> = ({
  resultImg,
  zoomStyle,
  showReloadFrame,
  onReset,
  onReroll,
}) => (
  <div className="imgBox">
    <img
      src={resultImg}
      alt="result"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        ...zoomStyle,
      }}
    />
    {showReloadFrame && onReset && onReroll && (
      <ReloadFrame onReset={onReset} onReroll={onReroll} />
    )}
  </div>
);
// #endregion

// #region DraggingFrame
const DraggingFrame: React.FC = () => {
  return (
    <div className="dim" style={{ zIndex: 3 }}>
      <div className="imgBox-titleText" style={{ zIndex: 4 }}>
        여기에 이미지를 드래그하세요!
      </div>
    </div>
  );
};
// #endregion

// #region ReloadFrame
interface ReloadFrameProps {
  onReset: () => void;
  onReroll: () => void;
}

const ReloadFrame: React.FC<ReloadFrameProps> = ({ onReset, onReroll }) => {
  return (
    <div className="dim-reloadUI" style={{ zIndex: 3 }}>
      <div className="reloadUI-buttonStack" style={{ zIndex: 4 }}>
        <ReloadButton onReroll={onReroll} />
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
};
// #endregion

export default BodyFrame;
