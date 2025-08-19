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
import CreateIlustratorModal from './CreateIlustratorModal';
import EditIlustratorModal from './EditIlustratorModal';

const IlustratorList = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedAdmin, setSelectedAdmin] = useState(null)

    const columns = [
        {
            id: 'id', label: 'ID', filter: false,
        },
        {
            id: 'name', label: 'Name', filter: true,
        },
        {
            id: 'email', label: 'Email At', filter: false,
        },
        {
            id: 'phone_number', label: 'Phone No.', filter: false,
        },
        {
            id: 'created_at', label: 'Created At', filter: false,
        },
        {
            id: 'modified_at', label: 'Modified At', filter: false,
        },
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
                                    icon={<Iconify icon={"material-symbols:edit"}/>}
                                >
                                    Ubah
                                </AntButton>
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
                                    icon={<Iconify icon={"material-symbols:delete-outline"}/>}
                                >
                                    Hapus
                                </AntButton>
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
            // Need to fetch real data later
            // let result = await Admin.getAll()
            let result = [
                {
                "id": 1,
                "name": "Budi kreatfi",
                "email": "budikreatfi@gmail.com",
                "phone_number": "321 Pine Rd, Ogdenville",
                "created_at": "today",
                "modified_at": "today",
                },
                {
                "id": 2,
                "name": "Susi kreatfi",
                "email": "susikreatfi@gmail.com",
                "phone_number": "123 Pine Rd, Ogdenville",
                "created_at": "today",
                "modified_at": "today",
                },
            ]
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
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Ilustrator</div>
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
                        <CustomTable
                            pagination={false}
                            searchText={''}
                            data={dataSource}
                            columns={columns}
                        />
                    </CardBody>
                </Card>

            </Container>
            <CreateIlustratorModal
                isOpen={isCreateOpen}
                ilustratorList={dataSource}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setIsCreateOpen(false)
                }}
            />
            {isEditModalOpen ? <EditIlustratorModal
                isOpen={isEditModalOpen}
                ilustratorData={selectedAdmin}
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

export default IlustratorList;















