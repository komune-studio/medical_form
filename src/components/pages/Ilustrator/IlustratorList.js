import {Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input} from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button} from "reactstrap";
import Ilustrator from '../../../models/IlustratorModel'
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
    const [selectedIlustrator, setSelectedIlustrator] = useState(null)

    const columns = [
        {
            id: 'id', label: 'ID', filter: false, allowSort: false,
        },
        {
            id: 'name', label: 'Name', filter: true,
        },
        {
            id: 'email', label: 'Email', filter: true,
        },
        {
            id: 'phone_number', label: 'Phone', filter: false, allowSort: false,
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
                                        setSelectedIlustrator(value)
                                        setIsEditModalOpen(true)
                                    }}
                                    type={'link'}
                                    style={{color: Palette.MAIN_THEME}}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"}/>}
                                >
                                </AntButton>   
                            </Tooltip>
                            <Tooltip title="Delete">
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
            await Ilustrator.delete(id);
            message.success('Illustrator deleted')
            initializeData();
        } catch (e) {
            message.error('There was error from server')
            setLoading(true)
        }
    }

    const onDelete = (record) => {
        Modal.confirm({
            title: "Are you sure you want to delete this illustrator data?",
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
            let result = await Ilustrator.getAll()
            
            // console.log("Result: ", result)
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
                <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
                      className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                        <Row>
                            <Col className='mb-3' md={6}>
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Illustrators</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                                <AntButton 
                                    onClick={() => {
                                        setIsCreateOpen(true)
                                    }} 
                                    size={'middle'} 
                                    type={'primary'}
                                >
                                    Add Illustrator
                                </AntButton>
                            </Col>
                        </Row>
                        <CustomTable
                            showFilter={true}
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
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setIsCreateOpen(false)
                }}
            />
            {isEditModalOpen ? <EditIlustratorModal
                isOpen={isEditModalOpen}
                ilustratorData={selectedIlustrator}
                close={(refresh) => {
                    if (refresh) {
                        initializeData()
                    }
                    setIsEditModalOpen(false)
                    setSelectedIlustrator(null)
                }}
            /> : ''}
        </>
    )
}

export default IlustratorList;















