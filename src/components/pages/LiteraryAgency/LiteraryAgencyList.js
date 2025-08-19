import {Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input} from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button} from "reactstrap";
import Admin from '../../../models/AdminModel'
import {Link, useHistory} from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import Palette from 'utils/Palette';
import {InputGroup, Form, Col,} from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import swal from "../../reusable/CustomSweetAlert";
import EditliteraryAgencyModal from './EditTranslatorModal';
import CreateLiteraryAgencyModal from './CreateLiteraryAgencyModal';

const LiteraryAgencyList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)

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
            id: 'username', label: 'Username', filter: true,
        },
        // {
        //   id: 'created_at', label: 'Created At', filter: false,
        // },
        {
            id: '', label: '', filter: false,
            render: ((value) => {
                return (
                    <>
                        <Space size="small">
                            <Tooltip title="Detail">
                                <AntButton
                                    onClick={() => {
                                        setSelectedAdmin(value)
                                        setIsEditModalOpen(true)

                                    }}
                                    type={'link'}
                                    style={{color: Palette.MAIN_THEME}}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"}/>}>Ubah</AntButton>

                            </Tooltip>
                            <Tooltip title="Hapus">
                                <AntButton
                                    type={'link'}
                                    style={{color: Palette.MAIN_THEME}}
                                    onClick={() => {
                                        onDelete(value.id)
                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:delete-outline"}/>}>Hapus</AntButton>

                            </Tooltip>
                        </Space>
                    </>
                )

            })
        },
    ]

    const deleteItem = async (id) => {
        try {
            await Admin.delete(id)
            message.success('Admin telah dihapus')
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
            let result = await Admin.getAll()
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
            <Container fluid style={{minHeight: "90vh"}}>
                <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
                      className="card-stats mb-4 mb-xl-0">
                    <CardBody>

                        <Row>
                            <Col className='mb-3' md={6}>
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Literary Agency</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                                <AntButton 
                                    onClick={() => {
                                        setIsCreateOpen(true)
                                    }} 
                                    size={'middle'} 
                                    type={'primary'}
                                >
                                    Tambah Admin
                                </AntButton>
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
            <CreateLiteraryAgencyModal
                isOpen={isCreateOpen}
                literaryAgencyList={dataSource}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setIsCreateOpen(false)
                }}
            />
            {isEditModalOpen ? <EditliteraryAgencyModal
                isOpen={isEditModalOpen}
                literaryAgencyData={selectedAdmin}
                close={(refresh) => {
                    if (refresh) {
                        initializeData()
                    }
                    setIsEditModalOpen(false)
                    setSelectedAdmin(null)
                }}
            /> : ''}
        </>
    )
}

export default LiteraryAgencyList;















