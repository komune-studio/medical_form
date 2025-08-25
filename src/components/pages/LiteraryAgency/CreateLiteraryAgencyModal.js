import Modal from 'react-bootstrap/Modal';
import { Button, Form, Input, message } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import LiteraryAgencies from '../../../models/LiteraryAgenciesModel'
import { useEffect, useState } from "react";
import AdminModel from "../../../models/AdminModel";
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";

CreateLiteraryAgencyModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
};


export default function CreateLiteraryAgencyModal({ isOpen, close }) {
    const [form] = Form.useForm();
    const onSubmit = async (values) => {
        try {
            let result = await LiteraryAgencies.create({
                name: values.name,
            })
            // console.log("Result: ", result)
            message.success('Successfully added new Literary Agency')
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
        form.resetFields();
        close(refresh)
    }


    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header style={{ paddingBottom: "0" }}>
            <Modal.Title>Add Literary Agency</Modal.Title>
            <Button 
                onClick={handleClose} 
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
                    label="Name"
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
                            message: 'Please enter a valid email.',
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
                            Add
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal.Body>
    </Modal>
}