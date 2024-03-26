import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button, FormGroup, Label, Input} from "reactstrap";
import {useHistory} from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import {Col, Dropdown,} from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import TopUp from "../../../models/TopUpModel";
import TopUpFormModal from "./TopUpFormModal";
import Helper from "../../../utils/Helper";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import TopUpTitleBar from "./TopUpTitleBar";
import TopUpHistoryModel from "../../../models/TopUpHistoryModel";
import moment from "moment/moment";

const TopUpHistory = () => {

    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [openTopUpModal, setOpenTopUpModal] = useState(false)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [selectedTopUp, setSelectedTopUp] = useState(null)
    const columns = [
        {
            id: 'created_at', label: 'Tanggal & jam', filter: true,
            render: (row => {
                return row?.created_at ? moment(row?.created_at).format('DD MMM YYYY, HH:mm') : '-'
            })
        },
        {
            id: 'transaction_id', label: 'ID Transaksi', filter: true,
            render: (row => {
                return row?.transactions?.order_id
            })
        },
        {
            id: 'currency', label: 'Tipe Paket', filter: true,
        },
        {
            id: 'price', label: 'Harga Paket', filter: true,
            render: (row => {
                return row?.price ? 'Rp.' + Helper.formatNumber(row.price) : 0
            })
        },
        {
            id: 'amount', label: 'Amount', filter: true,
            render: (row => {
                return row?.amount ? Helper.formatNumber(row.amount) : 0
            })
        },
        {
            id: 'payment_method', label: 'Metode Pembayaran', filter: true,
            render: (row => {
                return row?.transactions?.payment_method
            })
        },
        {
            id: 'status', label: 'Status', filter: true,
            render: (row => {
                return row?.transactions?.paid_status === 'SETTLEMENT' || 'CAPTURE' || 'APPROVED' ?
                    <span style={{color: Palette.THEME_GREEN}}><Iconify
                        icon={'icons8:checked'}></Iconify> {row?.transactions?.paid_status}</span> :
                    <span style={{color: Palette.THEME_RED}}><Iconify
                        icon={'carbon:close-filled'}></Iconify> {row?.transactions?.paid_status}</span>
            })
        },
    ]


    const initializeData = async () => {
        setLoading(true)
        try {
            console.log('masuk sinih')
            let result = await TopUpHistoryModel.getAll()
            console.log('isi res', result)
            setDataSource(result)
            setLoading(false)
        } catch (e) {
            console.log('masuk sinih', e)
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
                        <TopUpTitleBar/>
                        <Row style={{position: "relative", top: 65}}>
                            <Col className='mb-3 text-right' md={12}>
                                <Dropdown>
                                    <Dropdown.Toggle style={{zIndex: 1000}} variant="outline-secondary"
                                                     id="dropdown-basic">
                                        Minggu Ini
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu style={{color: '#fff'}}>
                                        <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
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
            <TopUpFormModal
                isOpen={openTopUpModal}
                isNewRecord={isNewRecord}
                topUpData={selectedTopUp}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData()
                    }
                    setOpenTopUpModal(false)
                }}
            />
        </>
    )
}

export default TopUpHistory















