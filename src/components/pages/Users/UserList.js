import { Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input } from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import User from '../../../models/UserModel'
import { Link, useHistory } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { InputGroup, Form, Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import UserFormModal from "./UserFormModal";
import UserResetPasswordModal from "./UserResetPasswordModal";

const UserList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [openUserModal, setOpenUserModal] = useState(false)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [openUserResetModal, setOpenUserResetModal] = useState(false)
    const columns = [
        {
          id: 'id', label: 'ID', filter: false,
        },
        {
            id: 'username', label: 'Username', filter: true,
        },
        {
          id: 'full_name', label: 'Full Name', filter: false,
        },
        {
            id: 'email', label: 'Email', filter: false,
        },
        {
          id: 'gender', label: 'Gender', filter: false,
        },

        {
          id: 'phone_number', label: 'Phone Number', filter: false,
        },
        {
            id: '', label: '', filter: false,
            render: ((value) => {
                return (
                    <>
                        <Space size="small">
                            <Tooltip title="Edit">
                                <AntButton
                                    onClick={() => {
                                        setOpenUserResetModal(false)
                                        setOpenUserModal(true)
                                        setSelectedUser(value)
                                        setIsNewRecord(false)


                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"} />} />
                            </Tooltip>
                            <Tooltip title="Ubah kata sandi">
                                {/* <Link to={"/admin-edit-password/" + value?.id}> */}
                                <AntButton
                                    onClick={() => {
                                        setSelectedUser(value)
                                        setOpenUserResetModal(true)
                                        setOpenUserModal(false)
                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:lock"} />} />
                                {/* </Link> */}
                            </Tooltip>
                            <Tooltip title="Hapus">
                                <AntButton
                                    onClick={() => {
                                        onDelete(value.id)
                                    }}
                                    danger
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:delete-outline"} />} />
                            </Tooltip>
                        </Space>
                    </>
                )

            })
        },
        /* {
          id: '', label: '', filter: false,
          render: ((row) => {
            return (
              <>
                <Button variant={'text'}>Lihat Detail</Button>
              </>
              )
    
          })
        }, */
        ]

    const deleteItem = async (id) => {
        try {
            await User.delete(id)
            message.success('User telah dihapus')
            initializeData();
        } catch (e) {
            message.error('There was error from server')
            setLoading(true)
        }
    }

    const onDelete = (record) => {
        Modal.confirm({
            title: "Apakah Anda yakin ingin menghapus akun admin ini?",
            okText: "Yes",
            okType: "danger",
            onOk: () => {
                deleteItem(record)
            }
        });
    };

    const initializeData = async () => {
        setLoading(true)
        try {
            let result = await User.getAll()
            console.log(result)
            setDataSource(result)
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }

    useEffect(() => {
        initializeData()
    }, [])

    return (
        <>
            <Container fluid>
                <Card style={{background : Palette.BACKGROUND_DARK_GRAY, color: "white"}} className="card-stats mb-4 mb-xl-0">
                    <CardBody>

                        <Row>
                            <Col className='mb-3' md={6}>
                                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>User</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                              <AntButton onClick={() => {
                                  setIsNewRecord(true)
                                  setOpenUserModal(true)
                                  setOpenUserResetModal(false)
                              }} size={'middle'} type={'primary'}>Tambah User</AntButton>
                            </Col>
                        </Row>
                        <CustomTable 
                            pagination={false}
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
                onClose={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setOpenUserModal(false)
                    setOpenUserResetModal(false)
                }}
            />
            <UserFormModal
                isOpen={openUserModal}
                isNewRecord={isNewRecord}
                userData={selectedUser}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setOpenUserModal(false)
                    setOpenUserResetModal(false)
                }}
            />

        </>
    )
}

export default UserList;















