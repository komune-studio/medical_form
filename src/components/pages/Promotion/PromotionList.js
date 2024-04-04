import {Space, Button as AntButton, Tooltip, Modal, message, Switch, Image} from 'antd';
import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button} from "reactstrap";
import {useHistory} from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import {Col,} from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import PromotionModel from "../../../models/PromotionModel";
import Helper from "../../../utils/Helper";
import PromotionModalForm from "./PromotionModalForm";
import moment from "moment/moment";

const PromotionList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [openModal, setOpenModal] = useState(false)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [selectedData, setSelectedData] = useState(null)
    const columns = [
        {
            id: 'image_url', label: 'Banner promo', filter: true,
            render: (row => {
                return <Image height={100} width={150} src={row.image_url}></Image>
            })
        },
        {
            id: 'name', label: 'Nama Promo', filter: true,
        },

        {
            id: 'description', label: 'Deskripsi Promo', filter: true,
        },
        {
            id: 'active', label: 'Status Promo', filter: false, width: '12%',
            render: (row => {
                return <Switch disabled={true} defaultChecked={row.active} checked={row.active} onChange={() => {
                    changeActive(row.id, row.active)
                }}/>
            })
        },
        // {
        //     id: 'created_at', label: 'Tanggal Dibuat', filter: true,
        //     render: (row => {
        //         return moment(row.created_at).format('DD MMM YYYY HH:mm')
        //     })
        // },
        {
            id: '', label: '', filter: false,
            render: ((value) => {
                return (
                    <>
                        <Space size="small">
                            <Tooltip title="Edit">
                                <AntButton
                                    style={{color: Palette.MAIN_THEME}}
                                    type={'link'}
                                    onClick={() => {
                                        setSelectedData(value)
                                        setOpenModal(true)
                                        setIsNewRecord(false)
                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"}/>}>
                                    Ubah
                                </AntButton>
                            </Tooltip>
                            <Tooltip title={value?.active ? 'Hapus' : 'Restore'}>
                                {
                                    value?.active ?
                                        <AntButton
                                            onClick={() => {
                                                onDelete(value.id)
                                            }}
                                            type={'link'}
                                            style={{color: Palette.MAIN_THEME}}
                                            className={"d-flex align-items-center justify-content-center"}
                                            shape="circle"
                                            icon={<Iconify icon={"material-symbols:delete-outline"}/>}>
                                            Hapus
                                        </AntButton>
                                        : <AntButton
                                            onClick={() => {
                                                onRestore(value.id)
                                            }}
                                            danger
                                            className={"d-flex align-items-center justify-content-center"}
                                            shape="circle"
                                            icon={<Iconify icon={"mdi:restore"}/>}/>
                                }

                            </Tooltip>
                        </Space>
                    </>
                )

            })
        },

    ]

    const changeActive = (id, currStatus) => {

    }

    const deleteItem = async (id) => {
        try {
            await PromotionModel.delete(id)
            message.success('Promosi berhasil dinonaktifkan')
            initializeData();
            window.location.reload()
        } catch (e) {
            message.error('There was error from server')
            setLoading(true)
        }
    }

    const restoreItem = async (id) => {
        try {
            await PromotionModel.restore(id)
            message.success('Promosi berhasil diaktifkan')
            initializeData();
            window.location.reload()
        } catch (e) {
            message.error('There was error from server')
            setLoading(true)
        }
    }

    const onDelete = (record) => {
        Modal.confirm({
            title: "Apakah Anda yakin ingin nonaktifkan paket ini?",
            okText: "Yes",
            okType: "danger",
            onOk: () => {
                deleteItem(record)
            }
        });
    };

    const onRestore = (record) => {
        Modal.confirm({
            title: "Apakah Anda yakin ingin mengaktifkan paket ini?",
            okText: "Yes",
            okType: "danger",
            onOk: () => {
                restoreItem(record)
            }
        });
    };

    const initializeData = async () => {
        setLoading(true)
        try {
            let result = await PromotionModel.getAll()
            console.log('value of', result)
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
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Promosi</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                                <AntButton onClick={() => {
                                    setOpenModal(true)
                                    setIsNewRecord(true)
                                }} size={'middle'} type={'primary'}>Tambah Promosi</AntButton>
                            </Col>
                        </Row>
                        <CustomTable
                            showFilter={true}
                            pagination={true}
                            searchText={''}
                            data={dataSource}
                            columns={columns}
                        />
                    </CardBody>
                </Card>

            </Container>
            <PromotionModalForm
                isOpen={openModal}
                isNewRecord={isNewRecord}
                selectedData={selectedData}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setOpenModal(false)
                }}
            />
        </>
    )
}

export default PromotionList















