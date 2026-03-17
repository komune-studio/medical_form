import { Space, Button as AntButton, Tooltip, Modal, message, Tag, Input } from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Col } from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import UserFormModal from "./UserFormModal";
import UserResetPasswordModal from "./UserResetPasswordModal";
import AdminService from 'models/AdminModel';

const UserList = () => {

    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [allData, setAllData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [openUserResetModal, setOpenUserResetModal] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [search, setSearch] = useState('');

    const isAdmin = localStorage.getItem('role') === 'ADMIN';

    const columns = [
        {
            id: 'id',
            label: 'ID',
            filter: false,
        },
        {
            id: 'username',
            label: 'Username',
            filter: true,
        },
        {
            id: 'role',
            label: 'Role',
            filter: false,
            render: (row) => (
                <Tag color={row.role === 'ADMIN' ? 'gold' : 'blue'}>
                    {row.role === 'DOCTOR' ? 'THERAPIST' : row.role}
                </Tag>
            )
        },
        {
            id: 'active',
            label: 'Status',
            filter: false,
            render: (row) => {
                const isActive = row.active === 1 || row.active === true;
                return (
                    <Tag color={isActive ? 'green' : 'red'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Tag>
                );
            }
        },
        {
            id: '',
            label: 'Actions',
            filter: false,
            render: (row) => {
                const isSelf = row.id === currentUserId;
                return (
                    <Space size="small">
                        {(isAdmin || isSelf) && (
                            <Tooltip title="Reset Password">
                                <AntButton
                                    type={'link'}
                                    style={{ color: Palette.MAIN_THEME }}
                                    onClick={() => {
                                        setSelectedUser(row);
                                        setOpenUserResetModal(true);
                                        setOpenUserModal(false);
                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:lock"} />}
                                />
                            </Tooltip>
                        )}

                        {isAdmin && !isSelf && (
                            <Tooltip title={row.role === 'ADMIN' ? 'Set as Therapist' : 'Set as Admin'}>
                                <AntButton
                                    type={'link'}
                                    style={{ color: row.role === 'ADMIN' ? '#faad14' : '#1890ff' }}
                                    onClick={() => onChangeRole(row)}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={row.role === 'ADMIN' ? "mdi:medical-bag" : "mdi:shield-account"} />}
                                />
                            </Tooltip>
                        )}

                        {isAdmin && !isSelf && (
                            (row.active === 1 || row.active === true) ? (
                                <Tooltip title="Deactivate">
                                    <AntButton
                                        type={'link'}
                                        style={{ color: '#ff4d4f' }}
                                        onClick={() => onDelete(row.id)}
                                        className={"d-flex align-items-center justify-content-center"}
                                        shape="circle"
                                        icon={<Iconify icon={"material-symbols:delete-outline"} />}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Restore">
                                    <AntButton
                                        type={'link'}
                                        style={{ color: '#52c41a' }}
                                        onClick={() => onRestore(row.id)}
                                        className={"d-flex align-items-center justify-content-center"}
                                        shape="circle"
                                        icon={<Iconify icon={"material-symbols:restore"} />}
                                    />
                                </Tooltip>
                            )
                        )}
                    </Space>
                );
            }
        },
    ];

    const deleteItem = async (id) => {
        try {
            await AdminService.delete(id);
            message.success('User deactivated');
            initializeData();
        } catch (e) {
            message.error('Failed to deactivate user');
        }
    };

    const onDelete = (id) => {
        Modal.confirm({
            title: "Deactivate this user?",
            content: "User will be deactivated and cannot login.",
            okText: "Yes, Deactivate",
            okType: "danger",
            onOk: () => deleteItem(id)
        });
    };

    const onRestore = (id) => {
        Modal.confirm({
            title: "Restore this user?",
            okText: "Yes, Restore",
            onOk: async () => {
                try {
                    await AdminService.restore(id);
                    message.success('User restored');
                    initializeData();
                } catch (e) {
                    message.error('Failed to restore user');
                }
            }
        });
    };

    const onChangeRole = (row) => {
        const newRole = row.role === 'ADMIN' ? 'THERAPIST' : 'ADMIN';
        const newRoleLabel = newRole === 'THERAPIST' ? 'Therapist' : 'Admin';
        Modal.confirm({
            title: `Change role to ${newRoleLabel}?`,
            content: `User "${row.username}" will be set as ${newRoleLabel}.`,
            okText: `Yes, set as ${newRoleLabel}`,
            onOk: async () => {
                try {
                    await AdminService.updateRole(row.id, newRole);
                    message.success(`Role updated to ${newRoleLabel}`);
                    initializeData();
                } catch (e) {
                    message.error('Failed to update role');
                }
            }
        });
    };

    const initializeData = async () => {
        setLoading(true);
        try {
            const result = isAdmin
                ? await AdminService.getAllWithInactive()
                : await AdminService.getAll();
            const data = Array.isArray(result) ? result : result?.data || [];
            setAllData(data);
        } catch (e) {
            message.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!search || search.trim() === '') {
            setDataSource(allData);
        } else {
            const keyword = search.trim().toLowerCase();
            setDataSource(allData.filter(u =>
                u.username && u.username.toLowerCase().includes(keyword)
            ));
        }
    }, [allData, search]);

    useEffect(() => {
        initializeData();
        (async () => {
            try {
                const result = await AdminService.getSelf();
                setCurrentUserId(result?.id || result?.data?.id);
            } catch (e) {
                console.error('Failed to get self data');
            }
        })();
    }, []);

    return (
        <>
            <style>{`
                .user-search.ant-input-affix-wrapper {
                    background: white !important;
                    border: 1px solid #d9d9d9 !important;
                }
                .user-search .ant-input {
                    background: white !important;
                    color: #333 !important;
                }
                .user-search .ant-input::placeholder {
                    color: rgba(0, 0, 0, 0.25) !important;
                }
                .user-search .ant-input-prefix {
                    color: #666 !important;
                }
                .user-search.ant-input-affix-wrapper:hover,
                .user-search.ant-input-affix-wrapper:focus,
                .user-search.ant-input-affix-wrapper-focused {
                    border-color: #666 !important;
                    box-shadow: 0 0 0 2px rgba(102,102,102,0.1) !important;
                }
            `}</style>
            <Container fluid>
                <Card
                    style={{
                        background: '#ffffff',
                        color: '#333',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
                    }}
                    className="card-stats mb-4 mb-xl-0"
                >
                    <CardBody>
                        <Row>
                            <Col className='mb-3' md={6}>
                                <div style={{ fontWeight: "bold", fontSize: "1.1em", color: '#333' }}>
                                    User Management
                                </div>
                                <div style={{ fontSize: '0.85em', color: '#888', marginTop: 2 }}>
                                    Manage admin & therapist accounts
                                </div>
                            </Col>
                            {isAdmin && (
                                <Col className='mb-3 text-right' md={6}>
                                    <AntButton
                                        onClick={() => {
                                            setIsNewRecord(true);
                                            setSelectedUser(null);
                                            setOpenUserModal(true);
                                            setOpenUserResetModal(false);
                                        }}
                                        size={'middle'}
                                        type={'primary'}
                                        icon={<Iconify icon="mdi:plus" style={{ marginRight: 4 }} />}
                                    >
                                        Add User
                                    </AntButton>
                                </Col>
                            )}
                        </Row>

                        <Row style={{ marginBottom: 16 }}>
                            <Col md={6}>
                                <Input
                                    className="user-search"
                                    placeholder="Search by username"
                                    prefix={
                                        <Iconify
                                            icon="material-symbols:search"
                                            style={{ color: '#666', fontSize: '18px' }}
                                        />
                                    }
                                    allowClear
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Row>

                        <CustomTable
                            showFilter={false}
                            pagination={true}
                            loading={loading}
                            searchText={''}
                            data={dataSource}
                            columns={columns}
                        />
                    </CardBody>
                </Card>
            </Container>

            <UserResetPasswordModal
                isOpen={openUserResetModal}
                userData={selectedUser}
                isAdmin={isAdmin}
                onClose={async (refresh) => {
                    if (refresh) await initializeData();
                    setOpenUserResetModal(false);
                    setOpenUserModal(false);
                }}
            />

            <UserFormModal
                isOpen={openUserModal}
                isNewRecord={isNewRecord}
                userData={selectedUser}
                isAdmin={isAdmin}
                close={async (refresh) => {
                    if (refresh) await initializeData();
                    setOpenUserModal(false);
                    setOpenUserResetModal(false);
                }}
            />
        </>
    );
};

export default UserList;