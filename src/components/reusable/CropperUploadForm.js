import { Flex, Form, Space, Typography } from "antd";
import CropperUpload from "./CropperUpload";
import { useEffect, useRef, useState } from "react";

export default function CropperUploadForm({ label, name, imageAspect, onImageChange, imagePreview, required = false, ...props }) {
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
      label={label}
      name={name}
      {...(required ?
        {
          required: true,
          rules: [
            {
              validator: (rule, value) => {
                const fileList = uploadRef.current.fileList;

                if (Array.isArray(fileList) && fileList.length <= 0 && !initialPreview) {
                  return Promise.reject(new Error(`${name} is required`));
                }

                return Promise.resolve();
              }

            },
          ]
        } : {}
      )}
    >
      <CropperUpload
        key={imagePreview ? imagePreview : initialPreview}
        uploadRef={uploadRef}
        initialPreview={imagePreview ? imagePreview : initialPreview}
        onImageChange={onImageChange}
        isOpen={isOpenCropper}
        handleOpen={() => setIsOpenCropper(true)}
        handleClose={() => setIsOpenCropper(false)}
        imageAspect={imageAspect}
      />
      <Flex justify='start' style={{ marginTop: "4px" }}>
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