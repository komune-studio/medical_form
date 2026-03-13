import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import AdminService from 'models/AdminModel';

/**
 * Modal reset password:
 * - ADMIN: bisa reset password user lain (hanya butuh newPassword)
 * - DOCTOR (diri sendiri): butuh currentPassword + newPassword
 */
const UserResetPasswordModal = ({ isOpen, userData, isAdmin, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const currentUserId = parseInt(localStorage.getItem('user_id'));
    const isSelf = userData?.id === currentUserId;

    // ADMIN reset orang lain: hanya newPassword
    // Reset diri sendiri (siapapun): butuh currentPassword juga
    const needCurrentPassword = isSelf;

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (isSelf) {
                // Reset password sendiri
                await AdminService.resetPasswordSelf({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                });
            } else if (isAdmin && userData?.id) {
                // Admin reset password orang lain
                await AdminService.resetPassword(userData.id, {
                    newPassword: values.newPassword,
                });
            }
            message.success('Password reset successfully');
            form.resetFields();
            onClose(true);
        } catch (e) {
            const errMsg = e?.error_message || e?.message || 'Failed to reset password';
            message.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Reset Password${userData ? ` — ${userData.username}` : ''}`}
            open={isOpen}
            onCancel={() => {
                form.resetFields();
                onClose(false);
            }}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>

                {/* Current password hanya diminta kalau reset diri sendiri */}
                {needCurrentPassword && (
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Current password is required' }]}
                    >
                        <Input.Password placeholder="Enter current password" />
                    </Form.Item>
                )}

                <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'New password is required' },
                        { min: 6, message: 'Minimum 6 characters' }
                    ]}
                >
                    <Input.Password placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                    label="Confirm New Password"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Please confirm new password' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm new password" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                    <Button onClick={() => { form.resetFields(); onClose(false); }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Reset Password
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UserResetPasswordModal;