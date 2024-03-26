import {Space, Button as AntButton, Tooltip, Modal, message, Switch, Image} from 'antd';
import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button} from "reactstrap";
import {useHistory} from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import {Col,} from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import Referral from "../../../models/ReferralModel";
import Helper from "../../../utils/Helper";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ReferralModalForm from "./ReferralModalForm";

const ReferralList = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [openReferralModal, setOpenReferralModal] = useState(false)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [selectedReferral, setSelectedReferral] = useState(null)
    const columns = [

        {
            id: 'code', label: 'Kode Referral', filter: true,
        },
        {
            id: 'type', label: 'Tipe Referral', filter: true,
        },
        {
            id: 'price', label: 'Nilai Hadiah', filter: true,
            render: (row => {
                return row?.type === "percentage" ? row.value + '%' : 'Rp.' + Helper.formatNumber(row.value)
            })
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
                                        setSelectedReferral(value)
                                        setOpenReferralModal(true)
                                        setIsNewRecord(false)
                                    }}
                                    className={"d-flex align-items-center justify-content-center"}
                                    shape="circle"
                                    icon={<Iconify icon={"material-symbols:edit"}/>}/>
                            </Tooltip>
                            <Tooltip title={value?.active ? 'Aktif' : 'Tidak Aktif'}>
                                {
                                    value?.active ?
                                        <AntButton
                                            onClick={() => {
                                                onDelete(value.id)
                                            }}
                                            danger
                                            className={"d-flex align-items-center justify-content-center"}
                                            shape="circle"
                                            icon={<Iconify icon={"material-symbols:delete-outline"}/>}/>
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
            await Referral.delete(id)
            message.success('Referral berhasil dinonaktifkan')
            initializeData();
            window.location.reload()
        } catch (e) {
            message.error('There was error from server')
            setLoading(true)
        }
    }

    const restoreItem = async (id) => {
        try {
            await Referral.restore(id)
            message.success('Referral berhasil diaktifkan')
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
            let result = await Referral.getAll()
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
                                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Referral</div>
                            </Col>
                            <Col className='mb-3 text-right' md={6}>
                                <AntButton onClick={() => {
                                    setOpenReferralModal(true)
                                    setIsNewRecord(true)
                                }} size={'middle'} type={'primary'}>Tambah Kode Referral</AntButton>
                            </Col>
                        </Row>
                        <Row>

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
            <ReferralModalForm
                isOpen={openReferralModal}
                isNewRecord={isNewRecord}
                referralData={selectedReferral}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setOpenReferralModal(false)
                }}
            />
        </>
    )
}

export default ReferralList















