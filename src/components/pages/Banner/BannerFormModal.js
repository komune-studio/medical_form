import Modal from 'react-bootstrap/Modal';
import { Button, message, Flex, Form, Input, Tag, Segmented, Switch } from "antd";
import { useEffect, useState } from "react";
import Palette from '../../../utils/Palette';
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import Category from 'models/CategoryModel';
import Placeholder from 'utils/Placeholder';
import CropperUploadForm from 'components/reusable/CropperUploadForm';
import Upload from 'models/UploadModel';
import Banner from 'models/BannerModel';

BannerFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    bannerData: PropTypes.object,
};


export default function BannerFormModal({ isOpen, close, isNewRecord, bannerData }) {
    const [form] = Form.useForm();
    const [language, setLanguage] = useState("ID");

    const imagePreview = Form.useWatch("image_url", form)

    const [imageFile, setImageFile] = useState(null);

    const uploadImage = async () => {
        try {
            let result = await Upload.uploadPicutre(imageFile);
            console.log(result)

            form.setFieldValue("image_url", result?.location);
            message.success("Image uploaded successfully");
        } catch (e) {
            console.log("isi e", e);
            message.error("Failed to upload image");
        }
    }

    const onSubmit = async () => {

        try {
            await uploadImage();
            let body = form.getFieldsValue();
            let msg = ''
            if (isNewRecord) {
                await Banner.create(body)
                msg = "Successfully added new banner"
            } else {
                await Banner.edit(bannerData?.id, body)
                msg = "Successfully updated banner"
            }

            message.success(msg)
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : "An Error Occured",
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initForm = () => {
        if (!isNewRecord) {
            form.setFieldsValue({
                id: bannerData?.id,
                image_url: bannerData?.image_url,
                show_banner: bannerData?.show_banner
            })
        }

    }

    useEffect(() => {
        if (isNewRecord) {
            console.log("ASDOIJASD")
            reset()
        } else {
            initForm()
        }
        setLanguage("ID");

    }, [isOpen])

    const reset = () => {
        form.resetFields();
        form.resetFields();
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header style={{ paddingBottom: "0" }}>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{isNewRecord ? 'Add Banner' : `Update Banner`}</Modal.Title>
                <Button onClick={() => {
                    close()
                }} style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                    icon={<CloseOutlined />} />
            </div>
        </Modal.Header>
        <Modal.Body style={{ paddingTop: "0" }}>
            <Form
                layout='vertical'
                form={form}
                onFinish={onSubmit}
                validateTrigger="onSubmit"
                autoComplete='off'
            >
                <CropperUploadForm
                    key={imagePreview}
                    label={"Banner Image"}
                    name={"image_url"}
                    imagePreview={imagePreview}
                    onImageChange={(file) => setImageFile(file)}
                />

                <Form.Item
                    label={"Show Banner"}
                    name={"show_banner"}
                    rules={[{
                        required: true,
                    }]}
                    hidden={language !== "ID"}
                >
                    <Switch />
                </Form.Item>

                <div className={"d-flex flex-row justify-content-end"}>
                    <Form.Item>
                        <Button className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                            onClick={() => handleClose()} style={{ marginRight: '5px' }}>
                            Cancel
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button size="sm" type='primary' variant="primary" htmlType='submit'>
                            {isNewRecord ? 'Add' : 'Save'}
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </Modal.Body>
    </Modal>
}