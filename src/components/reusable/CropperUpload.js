import { Flex, message, Typography, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import Iconify from "./Iconify";
import Helper from "utils/Helper";
import CropperModal from "./CropperModal";

export default function CropperUpload({
  uploadRef,
  initialPreview,
  onImageChange,
  isOpen = false,
  handleOpen,
  handleClose,
  imageAspect,
}) {
  const [originalImagePreviewURL, setOriginalImagePreviewURL] = useState(initialPreview)
  const [imagePreviewURL, setImagePreviewURL] = useState(initialPreview);

  const onUploadChange = ({ file }) => {
    const isImage = Helper.allowedImageType.includes(file.type);
    if (!isImage) {
      message.error("File must be image type " +
        Helper.allowedImageType.map((type) => type.slice(6).toUpperCase()).join(", "))
      return Upload.LIST_IGNORE;
    }
    const lessThan5MB = file.size / 1024 / 1024 < 5;
    if (!lessThan5MB) {
      message.error("Image must be smaller than 5MB.")
      return Upload.LIST_IGNORE;
    }

    const url = URL.createObjectURL(file);
    setOriginalImagePreviewURL(url);
    handleOpen()
  }

  const handleImageCropped = async (croppedImage) => {
    setImagePreviewURL(croppedImage);
    try {
      if (!onImageChange) message.error("Image file setter function is not defined!", 1)

      await fetch(croppedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'room-image.jpg', { type: 'image/jpeg' });
          onImageChange(file)
        });
    } catch (error) {
      await message.error("Failed to upload and crop image", 2)
    } finally {
      handleClose()
    }
  }

  return (
    <>
      <Upload.Dragger
        ref={uploadRef}
        name="avatar"
        listType="picture"
        className="avatar-uploader"
        showUploadList={false}
        multiple={false}
        accept={Helper.allowedImageType.join(",")}
        onChange={onUploadChange}
        beforeUpload={() => false}
      >
        <button
          type='button'
          style={{
            border: "none",
            background: "none",
            padding: "12px",
            minHeight: "200px",
            width: "100%",
          }} >
          <Flex vertical align='center'>
            {imagePreviewURL ? (
              <>
                <img src={imagePreviewURL} style={{ width: "100%", height: "auto" }} />
              </>
            ) : (
              <>
                <Iconify icon={"mdi:tray-upload"} style={{ fontSize: "48px" }} />
                <Typography.Text style={{ display: "inline-block", marginTop: "8px" }}>
                  Click or drag here to upload image.
                </Typography.Text>
              </>
            )}

          </Flex>
        </button>
      </Upload.Dragger>

      <CropperModal
        key={[initialPreview, imageAspect]}
        imgSrc={originalImagePreviewURL}
        onImageCropped={handleImageCropped}
        isOpen={isOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
        imageAspect={imageAspect}
      />
    </>
  )
}