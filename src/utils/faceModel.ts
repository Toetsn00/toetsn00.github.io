import * as faceapi from "face-api.js";

/* 모델 로딩 */
let modelsLoaded = false;
export const loadModels = async () => {
  if (!modelsLoaded) {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    modelsLoaded = true;
  }
};

/**
 * 이미지를 바탕으로 박스화된 전체 이미지와 랜덤 얼굴 확대 transform 반환
 *
 * @param imageUrl 원본 이미지 URL
 * @returns resultImg 박스화된 전체 이미지 URL, 뽑힌 얼굴 확대 transform
 */
export const detectFaces = async (imageUrl: string) => {
  try {
    await loadModels();
    const originImg = await faceapi.fetchImage(imageUrl);
    const detections = await faceapi.detectAllFaces(
      originImg,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.45 }),
    );
    if (!detections || detections.length === 0) return null;

    /* 랜덤 얼굴 선정 */
    const selectedFace =
      detections[Math.floor(Math.random() * detections.length)].box;

    const canvas = document.createElement("canvas");
    canvas.width = originImg.width;
    canvas.height = originImg.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(originImg, 0, 0, originImg.width, originImg.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.95;

    detections.forEach((det) => {
      const { x, y, width, height } = det.box;

      /* scale만큼 박스 크기 확대 */
      const scale = 1.2;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const scaledX = x - (scaledWidth - width) / 2;
      const scaledY = y - (scaledHeight - height) / 2;

      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
    });

    const zoomStyle = getFaceTransform(
      selectedFace,
      originImg.width,
      originImg.height,
    );

    return {
      resultImg: canvas.toDataURL("image/jpeg"),
      selectedFaceInfo: selectedFace,
      zoomStyle,
    };
  } catch (err) {
    console.error("faceModel.ts/detectFaces error: ", err);
    throw err;
  }
};

/**
 * 무작위의 얼굴을 선정해 이미지 확대에 사용되는 transform을 반환
 *
 * @param detection 감지된 얼굴 (x, y, width, height)
 * @param imageWidth 원본 이미지 width
 * @param imageHeight 원본 이미지 height
 * @returns 뽑힌 얼굴 확대 transform
 */
const getFaceTransform = (
  detection: { x: number; y: number; width: number; height: number },
  imageWidth: number,
  imageHeight: number,
) => {
  const { x, y, width, height } = detection;

  /* 이미지 비율 계산 */
  const imgRatio = imageWidth / imageHeight;
  const imgBoxRatio = 16 / 9;

  let offsetX = 0;
  let offsetY = 0;
  let displayScaleX = 1;
  let displayScaleY = 1;

  if (imgRatio > imgBoxRatio) {
    displayScaleY = imgBoxRatio / imgRatio;
    offsetY = (1 - displayScaleY) / 2;
  } else {
    displayScaleX = imgRatio / imgBoxRatio;
    offsetX = (1 - displayScaleX) / 2;
  }

  const centerX = offsetX + ((x + width / 2) / imageWidth) * displayScaleX;
  const centerY = offsetY + ((y + height / 2) / imageHeight) * displayScaleY;

  const originXPercent = centerX * 100;
  const originYPercent = centerY * 100;

  const scale = 1 + 600 / Math.max(width, height);

  return {
    transformOrigin: `${originXPercent}% ${originYPercent}%`,
    transform: `scale(${scale})`,
    transition: "transform 3.0s ease",
  };
};
