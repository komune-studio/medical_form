import { Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input } from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import User from '../../../models/UserModel'
import { Link, useHistory } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { InputGroup, Form, Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import CustomTableOld from "../../reusable/CustomTableOld";
import Palette from "../../../utils/Palette";
/* import CreateAdminModal from "./CreateAdminModal";
import EditAdminModal from "./EditAdminModal";
import EditPasswordAdminModal from "./EditPasswordAdminModal"; */
import swal from "../../reusable/CustomSweetAlert";

const UserList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
/*     const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isEditPaswordModalOpen, setIsEditPasswordModalOpen] = useState(false)
    const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null) */

    /* const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            filter: true,
            sorter: (a, b) => a.id.length - b.id.length,
        },
        {
            title: 'Nama admin',
            dataIndex: 'username',
            filter: true,
            sorter: (a, b) => a.username.length - b.username.length,
        },
        {
            title: '',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (value) => (
                <Space size="small">
                    <Tooltip title="Detail">
                        <AntButton
                            onClick={() => {
                                setSelectedAdmin(value)
                                setIsEditModalOpen(true)

                            }}
                            className={"d-flex align-items-center justify-content-center"}
                            shape="circle"
                            icon={<Iconify icon={"material-symbols:edit"} />} />
                    </Tooltip>
                    <Tooltip title="Ubah kata sandi">
                        <Link to={"/admin-edit-password/" + value?.id}>
                        <AntButton
                            onClick={() => {
                                setSelectedAdmin(value)
                                setIsEditPasswordModalOpen(true)
                            }}
                            className={"d-flex align-items-center justify-content-center"}
                            shape="circle"
                            icon={<Iconify icon={"material-symbols:lock"} />} />
                        </Link>
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
            ),
        },
    ] */

    const columns = [
        {
          id: 'id', label: 'ID', filter: false,
        },
        {
          id: 'username', label: 'Username', filter: false,
        },
        {
          id: 'email', label: 'Email', filter: false,
        },
        {
          id: 'phone_number', label: 'Phone Number', filter: false,
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
                            <Col className='mb-3' md={12}>
                                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>User</div>
                            </Col>
                        </Row>


                        {/* <CustomTableOld
                            toolBar={<Button size={'sm'} onClick={() => {
                                setIsCreateAdminOpen(true)
                            }} color="primary" style={{ float: 'right' }}>Buat baru</Button>}
                            loading={loading} columns={columns}
                            dataSource={dataSource}
                        /> */}

                        <CustomTable 
                            pagination={false}
                            searchText={''}
                            data={dataSource}
                            columns={columns}
                        />


                    </CardBody>
                </Card>

            </Container>
{/*             <CreateAdminModal
                isOpen={isCreateAdminOpen}
                adminList={dataSource}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setIsCreateAdminOpen(false)
                }}
            />
            {isEditModalOpen ? <EditAdminModal
                isOpen={isEditModalOpen}
                admin_data={selectedAdmin}
                close={(refresh) => {
                    if (refresh) {
                        initializeData()
                    }
                    setIsEditModalOpen(false)
                    setSelectedAdmin(null)
                }}
            /> : ''}
            {isEditPaswordModalOpen ? <EditPasswordAdminModal
                isOpen={isEditPaswordModalOpen}
                admin_data={selectedAdmin}
                close={(refresh) => {
                    if (refresh) {
                        initializeData()
                    }
                    setIsEditPasswordModalOpen(false)
                    setSelectedAdmin(null)
                }}
            /> : ''} */}


        </>
    )
}

export default UserList;















