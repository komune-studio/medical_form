import Modal from 'react-bootstrap/Modal';
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";

CreateTranslatorModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
};


export default function CreateTranslatorModal({ isOpen, close }) {
    const [form] = Form.useForm();
    const onSubmit = async (values) => {
        try {
            // Still using Admin Model, need to be changed later
            // let result2 = await AdminModel.create({
            //     password,
            //     username: username,
            // })
            let body = {
                name: values.name,
                email: values.email,
                phone: values.phoneNumber,
                languages: values.languages,
            }
            // console.log("Body's body: ", body)
            message.success('Berhasil menambahkan Admin')
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
        form.resetFields();
        close(refresh)
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>Create Translator</Modal.Title>
            <Button 
                onClick={handleClose} 
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
                            Add
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal.Body>
    </Modal>
}