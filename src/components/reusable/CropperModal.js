import { Button, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'
import swal from "./CustomSweetAlert";


function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function CropperModal({
  imgSrc,
  onImageCropped,
  isOpen,
  handleOpen,
  handleClose,
  modalProps,
  imageAspect,
  ...props
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  });
  const [loading, setLoading] = useState(false);
  const [aspectCount, setAspectCount] = useState(0)
  const [currentAspect, setCurrentAspect] = useState(imageAspect ? imageAspect[aspectCount] : undefined);

  const imgRef = useRef(null)

  const handleModalOpen = handleOpen ? handleOpen : () => setIsModalOpen(true);
  const handleModalClose = handleClose ? handleClose : () => setIsModalOpen(false);
  const handleCancel = () => {
    handleModalClose();
  };

  const onChangeAspect = () => {
    let nextAspect = aspectCount + 1
    if (nextAspect == imageAspect.length) nextAspect = 0
    setAspectCount(nextAspect);
    setCurrentAspect(imageAspect[nextAspect]);

    setCrop(c => ({
      ...c,
      x: c.y,
      y: c.x,
      width: c.height,
      height: c.width,
    }))
  }

  async function onFinalizeCrop() {
    setLoading(true);
    try {
      const image = imgRef.current;
      if (!image) {
        throw new Error('Image does not exist');
      }

      let finalCrop = {
        unit: 'px',
        x: (crop.x / 100) * image.width,
        y: (crop.y / 100) * image.height,
        width: (crop.width / 100) * image.width,
        height: (crop.height / 100) * image.height,
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.setAttribute('crossorigin', "anonymous")
      offscreenCanvas.width = finalCrop.width * scaleX;
      offscreenCanvas.height = finalCrop.height * scaleY;
      const offscreenCtx = offscreenCanvas.getContext('2d');

      if (!offscreenCtx) {
        throw new Error('Failed to create offscreen context');
      }

      offscreenCtx.drawImage(
        image,
        finalCrop.x * scaleX,
        finalCrop.y * scaleY,
        finalCrop.width * scaleX,
        finalCrop.height * scaleY,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height,
      );


      const dataUrl = offscreenCanvas.toDataURL('image/jpeg');
      onImageCropped(dataUrl);
      handleModalClose();
    } catch (error) {
      await swal.fire({
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Okay'
      })
    } finally {
      setLoading(false)
    }
  }

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;

    setCrop(centerAspectCrop(width, height, Array.isArray(imageAspect) ? currentAspect: imageAspect ?? 1))
  }

  return (
    <>
      <Modal
        title="Crop Image"
        onCancel={handleCancel}
        open={isOpen ? isOpen : isModalOpen}
        footer={[
          <Button key="back"  onClick={handleCancel}>
            Cancel
          </Button>,
          {...(Array.isArray(imageAspect) ?
            (<Button key="aspect" loading={loading} onClick={onChangeAspect}>
              Change Aspect
            </Button>
            ) : (
              <></>
            ))},
          < Button key="submit" type="primary" loading={loading} onClick={onFinalizeCrop} >
            Crop
          </Button >,
        ]
        }
        {...modalProps}
      >
        <ReactCrop
          crop={crop}
          aspect={(Array.isArray(imageAspect)) ? imageAspect[aspectCount] : imageAspect}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          style={{
            marginInline: "auto",
            display: 'block',
            width: "fit-content"
          }}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            onLoad={onImageLoad}
            style={{ maxHeight: '480px', width: 'auto', marginInline: "auto" }}
          />
        </ReactCrop>
      </Modal >
    </>
  )
}