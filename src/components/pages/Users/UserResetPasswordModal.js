import Modal from "react-bootstrap/Modal";
import LoadingButton from "../../reusable/LoadingButton";
import { useEffect, useState } from "react";
import { message, Form, Button, Input } from "antd";
import Admin from "../../../models/AdminModel";
import swal from "../../reusable/CustomSweetAlert";
import User from "../../../models/UserModel";
import PropTypes from "prop-types";

UserResetPasswordModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    userData: PropTypes.object
};
export default function UserResetPasswordModal({ isOpen, onClose, userData }) {
    const [form] = Form.useForm();

    const onSubmit = async () => {

        try {
            let body = {
                username: userData?.username,
                new_password: form.getFieldValue("password"),
            }
            // let result2 = await User.edit_password(userData?.id, body)
            console.log(body);
            if (true) {
                message.success('Successfully reset password')
            } else {
                message.error('Unable to reset password')
            }
            onClose(true)
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

    useEffect(() => {
        form.resetFields();
    }, [])

    return (
        <>
            <Modal
                show={isOpen}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Reset Password User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        layout='vertical'
                        form={form}
                        onFinish={onSubmit}
                        validateTrigger="onSubmit"
                        autoComplete="off"
                    >
                        <Form.Item
                            label={"Password"}
                            name={"password"}
                            rules={[{
                                required: true,
                            }]}
                        >
                            <Input.Password variant='filled' />
                        </Form.Item>
                        <Form.Item
                            label={"Confirm Password"}
                            name={"confirm_password"}
                            rules={[
                                {
                                    required: true,
                                    message: ""
                                },
                                {
                                    validator: async (_, value) => {
                                        if (!form.getFieldValue("password")) return Promise.reject("Please enter Password");
                                        if (!value) return Promise.reject("Please confirm your password");
                                        if (value !== form.getFieldValue("password")) {
                                            return Promise.reject("Password confirmation does not match")
                                        }
                                    }
                                }
                            ]}
                        >
                            <Input.Password variant='filled' />
                        </Form.Item>

                        <div className={"d-flex flex-row justify-content-end"}>
                            <Form.Item>
                                <Button className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                                    onClick={() => onClose()} style={{ marginRight: '5px' }}>
                                    Cancel
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button size="sm" type='primary' variant="primary" htmlType='submit'>
                                    Save
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

        </>
    )

}