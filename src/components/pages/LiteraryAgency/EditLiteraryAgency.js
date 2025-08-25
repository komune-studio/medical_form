import Modal from 'react-bootstrap/Modal';
import { Button, Form, Input, message } from "antd";
import LiteraryAgencies from '../../../models/LiteraryAgenciesModel'
import { CloseOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
EditliteraryAgencyModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    literaryAgencyData: PropTypes.object
};


export default function EditliteraryAgencyModal({ isOpen, close, literaryAgencyData }) {
    const [form] = Form.useForm();
    const onSubmit = async (values) => {
        
        try {
            let result = await LiteraryAgencies.edit(literaryAgencyData?.id, {
                name: values.name,
            })

            // console.log("body: ", body)
            message.success('Successfully updated Literary Agency')
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
        if (literaryAgencyData) {
            form.setFieldsValue({
                id: literaryAgencyData?.id,
                name: literaryAgencyData?.name,
                email: literaryAgencyData?.email,
                phoneNumber: literaryAgencyData?.phone,
                website: literaryAgencyData?.website,
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
        <Modal.Header style={{ paddingBottom: "0" }}>
            <Modal.Title>Update Literary Agency</Modal.Title>
            <Button 
                onClick={() => {
                    close()
                }} 
                style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                icon={<CloseOutlined />} 
            />
        </Modal.Header>
        <Modal.Body style={{ paddingTop: "0" }}>
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
                            // message: 'Mohon memasukkan nama!',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                {/* <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            // message: 'Mohon memasukkan email!',
                        },
                        {
                            type: 'email',
                            message: 'Please enter a valid email',
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
                            // message: 'Mohon memasukkan Nomor HP.',
                        },
                        {
                            pattern: /^[0-9]+$/,
                            message: 'Phone Number can only include numbers',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Website Link"
                    name="website"
                    rules={[
                        {
                            required: true,
                            // message: 'Mohon memasukkan website link.',
                        },
                    ]}
                >
                    <Input />
                </Form.Item> */}
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
