import Modal from 'react-bootstrap/Modal';
import { Button, Form, Input, message } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
EditTranslatorModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    translatorData: PropTypes.object
};


export default function EditTranslatorModal({ isOpen, close, translatorData }) {
    const [form] = Form.useForm();
    const onSubmit = async (values) => {
        try {
            let body = {
                name: values.name,
                email: values.email,
                phone_number: values.phoneNumber,
                languages: values.languages,
            }
            // Still using Admin Model, need to be changed later
            // let result2 = await AdminModel.edit(translatorData?.id, {
            //     username: username,
            // })
            // console.log("body: ", body)
            message.success('Berhasil menyimpan')
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : errorMessage,
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initializeData = () => {
        if (translatorData) {
            form.setFieldsValue({
                id: translatorData?.id,
                name: translatorData?.name,
                email: translatorData?.email,
                phoneNumber: translatorData?.phone,
                languages: translatorData?.languages,
            })
        }
    }

    useEffect(() => {
        initializeData()
    }, [isOpen])

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>Update Translator</Modal.Title>
            <Button 
                onClick={() => {
                    close()
                }} 
                style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                icon={<CloseOutlined />} 
            />
        </Modal.Header>
        <Modal.Body>
                <Form
                    form={form}
                    name="basic"
                    layout={'vertical'}
                    onFinish={onSubmit}
                    autoComplete="off"
                    validateTrigger= "onSubmit"
                >
                    <Form.Item
                        label="Nama"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Mohon memasukkan nama!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'Mohon memasukkan email!',
                            },
                            {
                                type: 'email',
                                message: 'Email tidak valid.',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                            {
                                required: true,
                                message: 'Mohon memasukkan Nomor HP.',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Languages"
                        name="languages"
                        rules={[
                            {
                                required: true,
                                message: 'Mohon memasukkan bahasa.',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <div className={"d-flex flex-row justify-content-end"}>
                            <Button  variant="outline-danger" onClick={handleClose} style={{ marginRight: '5px' }}>
                                Cancel
                            </Button>
                            <Button  htmlType="submit" type="primary">
                                Save
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
        </Modal.Body>
    </Modal>
}
