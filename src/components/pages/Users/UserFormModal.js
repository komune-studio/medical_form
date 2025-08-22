import Modal from 'react-bootstrap/Modal';
import { Button, DatePicker, message, Spin, Flex, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import UserModel from "../../../models/UserModel";
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import Admin from 'models/AdminModel';
import { useHistory } from "react-router-dom";

UserFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    userData: PropTypes.object,
    isSuperAdmin: PropTypes.bool,
};


export default function UserFormModal({ isOpen, close, isNewRecord, userData, isSuperAdmin }) {
    const history = useHistory()
    const [form] = Form.useForm()

    const userRoles = [
        { label: "Admin", value: "ADMIN" },
        { label: "Super Admin", value: "SUPERADMIN" },
    ];

    const [loadingUpload, setLoadingUpload] = useState(false)


    const onSubmit = async () => {
        try {
            let result;
            let body = form.getFieldsValue();
            let msg = ''
            console.log(body)
            if (isNewRecord) {
                if(body.role == "ADMIN") {
                    await Admin.createAdmin(body);
                } else {
                    await Admin.createSuperAdmin(body);
                }
                msg = "Successfully created User"
            } else {
                if (isSuperAdmin) {
                    await Admin.edit(userData?.id, body)
                } else {
                    await Admin.editSelf(body);
                }
                msg = "Successfully updated User"
            }

            message.success(msg)
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

    const initForm = () => {
        console.log('isi userData', userData)
        if (!isNewRecord) {
            form.setFieldsValue({
                username: userData?.username,
                role: userData?.role,
            })
        }

    }
    useEffect(() => {
        if (isNewRecord) {
            reset()
        } else {
            initForm()
        }


    }, [isOpen])

    const reset = () => {
        form.resetFields();
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{isNewRecord ? 'Create User' : `Update User`}</Modal.Title>
                <Button onClick={() => {
                    close()
                }} style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                    icon={<CloseOutlined />} />
            </div>
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
                    label={"Username"}
                    name={"username"}
                    rules={[{
                        required: true,
                    }]}
                >
                    <Input variant='filled' />
                </Form.Item>
                {isNewRecord ? (
                    <>
                        <Form.Item
                            label={"Role"}
                            name={"role"}
                            rules={[{
                                required: true,
                            }]}
                        >
                            <Select variant='filled' options={userRoles} />
                        </Form.Item>
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
                    </>
                ) : (
                    <></>
                )}

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