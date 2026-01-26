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
import { Button, Form, Input, message, Space, Typography } from "antd";
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Admin from "../../models/AdminModel"
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

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
            history.push('/visitors')
            window.location.reload()

        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            if (e.error_message) {
                errorMessage = "Invalid Credential"
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
            <style>{`
                /* ===== FIX PASSWORD HITAM (FINAL) ===== */
                
                /* wrapper group */
                .login-input.ant-input-group-wrapper .ant-input-affix-wrapper {
                    background: #fff !important;
                    border: 1px solid #d9d9d9 !important;
                    color: #333 !important;
                    border-radius: 0 6px 6px 0 !important;
                }
                
                /* input di dalamnya */
                .login-input.ant-input-group-wrapper .ant-input-affix-wrapper input {
                    background: transparent !important;
                    color: #333 !important;
                }
                
                /* hover */
                .login-input.ant-input-group-wrapper .ant-input-affix-wrapper:hover {
                    border-color: #666 !important;
                }
                
                /* focus */
                .login-input.ant-input-group-wrapper .ant-input-affix-wrapper-focused {
                    border-color: #666 !important;
                    box-shadow: 0 0 0 2px rgba(102,102,102,0.1) !important;
                }
                
                /* icon eye */
                .login-input.ant-input-group-wrapper .ant-input-password-icon {
                    color: #666 !important;
                }
                
                /* addon lock */
                .login-input.ant-input-group-wrapper .ant-input-group-addon {
                    background: #f5f5f5 !important;
                    border-color: #d9d9d9 !important;
                    color: #333 !important;
                    border-radius: 6px 0 0 6px !important;
                }
                
                /* ===== STYLING USERNAME INPUT ===== */
                .login-input .ant-input-group-addon {
                    background: #f5f5f5 !important;
                    border-color: #d9d9d9 !important;
                    color: #333 !important;
                    border-radius: 6px 0 0 6px !important;
                }
                
                .login-input .ant-input {
                    background: #fff !important;
                    border-color: #d9d9d9 !important;
                    color: #333 !important;
                    border-radius: 0 6px 6px 0 !important;
                }
                
                .login-input .ant-input:hover {
                    border-color: #666 !important;
                }
                
                .login-input .ant-input:focus {
                    border-color: #666 !important;
                    box-shadow: 0 0 0 2px rgba(102,102,102,0.1) !important;
                }
                
                /* icon user & lock */
                .anticon-user, .anticon-lock {
                    color: #333 !important;
                }
                
                /* placeholder text color */
                .login-input .ant-input::placeholder,
                .login-input.ant-input-group-wrapper .ant-input-affix-wrapper input::placeholder {
                    color: rgba(0, 0, 0, 0.25) !important;
                }
            `}</style>
            <Col lg="5" md="7">
                <Card style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
                }} >
                    <CardBody className="px-5 py-5">
                        <div className="text-center mb-4">
                            <Typography.Title 
                                level={2} 
                                style={{ 
                                    color: '#333',
                                    fontWeight: 600,
                                    marginBottom: '10px'
                                }}
                            >
                                Komune
                            </Typography.Title>
                            <Typography.Text 
                                style={{ 
                                    color: '#666',
                                    fontSize: '16px'
                                }}
                            >
                                Visitor Management System
                            </Typography.Text>
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
                                        message: 'Please input your username!'
                                    },
                                ]}
                            >
                                <Input 
                                    className="login-input"
                                    addonBefore={<UserOutlined style={{ color: '#333' }} />} 
                                    placeholder="Username"
                                />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!'
                                    },
                                ]}
                            >
                                <Input.Password 
                                    className="login-input"
                                    addonBefore={<LockOutlined style={{ color: '#333' }} />} 
                                    placeholder="Password"
                                />
                            </Form.Item>
                            <Form.Item style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Button 
                                    htmlType="submit" 
                                    type="primary"
                                    style={{
                                        marginTop: '10px',
                                        background: '#333',
                                        borderColor: '#333',
                                        width: '100%',
                                        height: '40px',
                                        fontWeight: 500,
                                        borderRadius: '6px'
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