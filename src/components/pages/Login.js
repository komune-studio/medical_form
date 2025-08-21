    import {
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col
} from "reactstrap";
import { Button, Form, Input, message, Space } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Admin from "../../models/AdminModel"
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import logo from "../../assets/img/brand/read_indonesia_logo_4.png"
import Palette from "../../utils/Palette";
import swal from "../../components/reusable/CustomSweetAlert";

const Login = () => {
    const history = useHistory()
    const [form] = Form.useForm();
    const onSubmit = async (values) => {
        try {
            let result = await Admin.login({
                username: values.username, 
                password: values.password,
            })

            localStorage.super_token = result.token;
            localStorage.token = result.token;
            localStorage.admin_name = result.username;
            localStorage.role = result.role;
            sessionStorage.token = result.token;
            sessionStorage.admin_name = result.username;
            sessionStorage.id = result.id;
            history.push('/books')
            window.location.reload()

        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            if (e.error_message) {
                errorMessage = "Invalid Credential"
                // if (e.error_message === "USERNAME_NOT_FOUND" || e.error_message === "Wrong password") {
                //     errorMessage = "Invalid Credential"
                // } else {
                //     errorMessage = e.error_message
                // }
            }
            await swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }
    }
    return (
        <>
            <Col lg="5" md="7">
                <Card style={{background:Palette.BACKGROUND_BLACK, borderRadius:14}} >
                    <CardBody  className="px-5 py-5">
                        <div className="text-center text-muted mb-4">
                            <img
                                style={{
                                    width: "100%",
                                    objectFit: "contain"
                                }}
                                src={logo}
                            />
                        </div>
                        <Form
                            form={form}
                            name="basic"
                            layout={'vertical'}
                            onFinish={onSubmit}
                            autoComplete="off"
                            validateTrigger= "onSubmit"
                        >
                            <Form.Item
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Space.Compact block>
                                    <Input addonBefore={<UserOutlined />} placeholder="Username" />
                                </Space.Compact>
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Space.Compact block>
                                    <Input.Password addonBefore={<LockOutlined />} placeholder="Password" />
                                </Space.Compact>
                            </Form.Item>
                            <Form.Item style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Button 
                                    htmlType="submit" 
                                    type="primary"
                                    style={{
                                        marginTop: '10px',
                                    }}
                                >
                                    LOGIN
                                </Button>
                            </Form.Item>
                        </Form>
                    </CardBody>
                </Card>

            </Col>
        </>
    );
};

export default Login;