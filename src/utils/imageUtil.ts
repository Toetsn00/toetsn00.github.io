/**
 * 이미지를 특정 높이로 리사이즈
 *
 * @param imgUrl 원본 이미지 URL
 * @returns 리사이즈된 이미지 URL
 */
export const resizeImage = (imgUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const targetHeight = 4000;
      const ratio = img.width / img.height;
      const newWidth = targetHeight * ratio;

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, newWidth, targetHeight);

      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.src = imgUrl;
  });
};
