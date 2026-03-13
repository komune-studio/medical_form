import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import AdminService from 'models/AdminModel';

const { Option } = Select;

/**
 * Modal untuk:
 * - Buat user baru (isNewRecord=true) — ADMIN only
 * - (Edit username bisa ditambah nanti)
 */
const UserFormModal = ({ isOpen, isNewRecord, userData, isAdmin, close }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isNewRecord) {
                form.resetFields();
            } else if (userData) {
                form.setFieldsValue({
                    username: userData.username,
                    role: userData.role,
                });
            }
        }
    }, [isOpen, isNewRecord, userData]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (isNewRecord) {
                await AdminService.adminCreateUser({
                    username: values.username,
                    password: values.password,
                    role: values.role,
                });
                message.success(`User "${values.username}" created as ${values.role}`);
            }
            close(true);
        } catch (e) {
            const errMsg = e?.error_message || e?.message || 'Failed to save user';
            message.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isNewRecord ? 'Add New User' : 'Edit User'}
            open={isOpen}
            onCancel={() => close(false)}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ role: 'DOCTOR' }}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Username is required' }]}
                >
                    <Input placeholder="Enter username" />
                </Form.Item>

                {isNewRecord && (
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Password is required' },
                            { min: 6, message: 'Minimum 6 characters' }
                        ]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>
                )}

                {/* Role hanya bisa dipilih oleh ADMIN */}
                {isAdmin && (
                    <Form.Item
                        label="Role"
                        name="role"
                        rules={[{ required: true, message: 'Role is required' }]}
                    >
                        <Select placeholder="Select role">
                            <Option value="DOCTOR">🩺 Doctor</Option>
                            <Option value="ADMIN">🛡️ Admin</Option>
                        </Select>
                    </Form.Item>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                    <Button onClick={() => close(false)}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {isNewRecord ? 'Create User' : 'Save Changes'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UserFormModal;