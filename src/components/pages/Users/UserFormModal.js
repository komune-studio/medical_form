import Modal from 'react-bootstrap/Modal';
import { Button, DatePicker, message, Spin, Flex, Form, Input, Select } from "antd";
import { useEffect, useState } from "react";
import UserModel from "../../../models/UserModel";
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import moment from "moment/moment";
import UploadModel from "../../../models/UploadModel"

UserFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    userData: PropTypes.object,
};


export default function UserFormModal({ isOpen, close, isNewRecord, userData }) {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [email, setEmail] = useState(null)
    const [birthDate, setBirthDate] = useState(null)
    const [fullName, setFullName] = useState("")
    const [gender, setGender] = useState()
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [avatarImage, setAvatarImage] = useState(null)
    const [form] = Form.useForm()

    const userRoles = [
        { label: "Admin", value: "ADMIN" },
        { label: "Super Admin", value: "SUPERADMIN" },
    ];

    const [loadingUpload, setLoadingUpload] = useState(false)


    const handleUpload = async (file) => {
        try {
            setLoadingUpload(true)
            let result = await UploadModel.uploadPicutre(file.file?.originFileObj)

            if (result?.location) {
                setAvatarImage(result?.location)
                message.success('Successfully upload user')
            }
            setLoadingUpload(false)
        } catch (e) {
            console.log('isi e', e)
            message.error("Failed to upload user")
            setLoadingUpload(false)
        }
    }
    const onSubmit = async () => {
        try {
            let result;
            let body = form.getFieldsValue();
            let msg = ''
                console.log(body)
            if (isNewRecord) {
                // Object.assign(body, {
                //     password: password
                // })
                // await UserModel.create(body)
                msg = "Successfully created User"
            } else {
                // await UserModel.edit(userData?.id, body)
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
                <Form.Item
                    label={"Role"}
                    name={"role"}
                    rules={[{
                        required: true,
                    }]}
                >
                    <Select variant='filled' options={userRoles} />
                </Form.Item>
                {isNewRecord ? (
                    <>
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
                                        if(!form.getFieldValue("password")) return Promise.reject("Please enter Password");
                                        if(!value) return Promise.reject("Please confirm your password");
                                        if(value !== form.getFieldValue("password")) {
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