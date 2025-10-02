import { Flex, Form, Space, Typography } from "antd";
import CropperUpload from "./CropperUpload";
import { useEffect, useRef, useState } from "react";

export default function CropperUploadForm({ label, name, imageAspect, onImageChange, ...props }) {
  const [isOpenCropper, setIsOpenCropper] = useState(false);

  const uploadRef = useRef(null);
  const form = Form.useFormInstance()
  const initialPreview = Form.useWatch(name, form)

  const handleEditCropper = async () => {
    if (!uploadRef.current) return


    if (!initialPreview) {
      return uploadRef.current.upload.uploader.fileInput.click();
    }
    setIsOpenCropper(true);
  }

  return (
    <Form.Item
      label={""}
      name={name}
      noStyle
    >
      <Flex style={{ width: "100%", paddingBottom: "8px", justifyContent: "space-between", alignItems: "end" }}>
        {label}

        {/* <span className='label-link' onClick={handleEditCropper}>
          Edit
        </span> */}
      </Flex>
      <CropperUpload
        key={initialPreview}
        uploadRef={uploadRef}
        initialPreview={initialPreview}
        onImageChange={onImageChange}
        isOpen={isOpenCropper}
        handleOpen={() => setIsOpenCropper(true)}
        handleClose={() => setIsOpenCropper(false)}
        imageAspect={imageAspect}
      />
      <Flex justify='start' style={{ marginTop: "4px", marginBottom: "24px" }}>
        <Space wrap size={[8, 1]}>
          <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
            Max image size 5MB
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
            -
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
            JPG, JPEG, PNG, WEBP supported
          </Typography.Text>
        </Space>
      </Flex>
    </Form.Item>
  )
}