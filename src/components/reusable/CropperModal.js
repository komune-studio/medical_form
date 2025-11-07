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
  const currentAspect = (imageAspect ? imageAspect[aspectCount] : undefined);

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
    
    const nextAspectRatio = imageAspect[nextAspect];
    let newCrop = {
      x: 0,
      y: 0,
    }
    if (nextAspectRatio >= 1) {
      newCrop = {
        ...newCrop,
        width: 50 * imageAspect[nextAspect],
        height: 50,
      }
    } else {
      newCrop = {
        ...newCrop,
        width: 50,
        height: 50 / imageAspect[nextAspect],
      }
    }
    setCrop(c => ({
      ...c,
      ...newCrop
    }))
  }

  async function onFinalizeCrop() {
    setLoading(true);
    try {
      const image = imgRef.current;
      if (!image) {
        throw new Error('Image does not exist');
      }

      const imageCompressQuality = 0.8 // 80% of original quality
      let finalCrop = {
        unit: 'px',
        x: (crop.x / 100) * image.naturalWidth,
        y: (crop.y / 100) * image.naturalHeight,
        width: (crop.width / 100) * image.naturalWidth,
        height: (crop.height / 100) * image.naturalHeight,
      }

      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.setAttribute('crossorigin', "anonymous")
      offscreenCanvas.width = finalCrop.width;
      offscreenCanvas.height = finalCrop.height;
      const offscreenCtx = offscreenCanvas.getContext('2d');

      if (!offscreenCtx) {
        throw new Error('Failed to create offscreen context');
      }

      offscreenCtx.drawImage(
        image,
        finalCrop.x,
        finalCrop.y,
        finalCrop.width,
        finalCrop.height,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height,
      );


      const dataUrl = offscreenCanvas.toDataURL('image/jpeg', imageCompressQuality); // Get data url and also compress image
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

    setCrop(centerAspectCrop(width, height, Array.isArray(imageAspect) ? currentAspect : imageAspect ?? 1))
  }

  return (
    <>
      <Modal
        title="Crop Image"
        onCancel={handleCancel}
        maskClosable={false}
        open={isOpen ? isOpen : isModalOpen}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          {
            ...(Array.isArray(imageAspect) ?
              (<Button key="aspect" loading={loading} onClick={onChangeAspect}>
                Change Aspect
              </Button>
              ) : (
                <></>
              ))
          },
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
          keepSelection
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