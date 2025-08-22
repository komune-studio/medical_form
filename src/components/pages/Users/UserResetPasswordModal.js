import Modal from "react-bootstrap/Modal";
import LoadingButton from "../../reusable/LoadingButton";
import { useEffect, useState } from "react";
import { message, Form, Button, Input } from "antd";
import swal from "../../reusable/CustomSweetAlert";
import User from "../../../models/UserModel";
import PropTypes from "prop-types";
import Admin from "models/AdminModel";

UserResetPasswordModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    userData: PropTypes.object,
    isSuperAdmin: PropTypes.bool
};
export default function UserResetPasswordModal({ isOpen, onClose, userData, isSuperAdmin }) {
    const [form] = Form.useForm();

    const onSubmit = async () => {

        try {
            let body = {
                newPassword: form.getFieldValue("new_password"),
            }
            if (isSuperAdmin) {
                await Admin.resetPassword(userData.id, body)
            } else {
                Object.assign(body, {
                    currentPassword: form.getFieldValue("current_password"),
                })
                await Admin.resetPasswordSelf(body);
            }
            message.success('Successfully reset password')
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
        onClose(refresh);
        form.resetFields();
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
                        {!isSuperAdmin ? (
                            <Form.Item
                                label={"Current Password"}
                                name={"current_password"}
                                rules={[{
                                    required: true,
                                }]}
                            >
                                <Input.Password variant='filled' />
                            </Form.Item>
                        ) : (
                            <></>
                        )}
                        <Form.Item
                            label={"New Password"}
                            name={"new_password"}
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
                                        if (!isSuperAdmin && !form.getFieldValue("current_password")) return Promise.reject("Please enter Current Password");
                                        if (!form.getFieldValue("new_password")) return Promise.reject("Please enter your New Password");
                                        if (!value) return Promise.reject("Please confirm your password");
                                        if (value !== form.getFieldValue("new_password")) {
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
                                    onClick={() => handleClose()} style={{ marginRight: '5px' }}>
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