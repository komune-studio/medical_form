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
import EditTranslatorModal from './EditTranslatorModal';
import CreateTranslatorModal from './CreateTranslatorModal';

const TranslatorList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedTranslator, setselectedTranslator] = useState(null)

    const columns = [
        {
            id: 'id', label: 'ID', filter: false,
        },
        {
            id: 'name', label: 'Name', filter: true,
        },
        {
            id: 'email', label: 'Email', filter: false,
        },
        {
            id: 'phone', label: 'Phone No.', filter: false,
        },
        {
            id: 'languages', label: 'Languages', filter: false,
        },
        {
            id: 'created_at', label: 'Created At', filter: false,
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
                                        setselectedTranslator(value)
                                        setIsEditModalOpen(true)

                                    }}
                                    type={'link'}
                                    style={{color: Palette.MAIN_THEME}}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"}/>}>
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
                                    icon={<Iconify icon={"material-symbols:delete-outline"}/>}>
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
                "name": "Budi Inggris",
                "email": "budikraetif@gmail.com",
                "phone": "0811112222",
                "languages": "English, Indonesia",
                "created_at": "today",
                },
                {
                "id": 2,
                "name": "Budi Chung",
                "email": "budichungf@gmail.com",
                "phone": "0811112223",
                "languages": "Mandarin, Indonesia",
                "created_at": "today",
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
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Translator</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                                <AntButton 
                                    onClick={() => {
                                        setIsCreateOpen(true)
                                    }} 
                                    size={'middle'} 
                                    type={'primary'}
                                >
                                    Add Translator
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
            <CreateTranslatorModal
                isOpen={isCreateOpen}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setIsCreateOpen(false)
                }}
            />
            {isEditModalOpen ? <EditTranslatorModal
                isOpen={isEditModalOpen}
                translatorData={selectedTranslator}
                close={(refresh) => {
                    if (refresh) {
                        initializeData()
                    }
                    setIsEditModalOpen(false)
                    setselectedTranslator(null)
                }}
            /> : ''}
        </>
    )
}

export default TranslatorList;















