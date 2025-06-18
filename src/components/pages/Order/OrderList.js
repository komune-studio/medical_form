import { Button as AntButton, Flex } from 'antd';
import dayjs from "dayjs";
import OrderModel from 'models/OrderModel';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { CSVLink } from "react-csv";
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import Helper from '../../../utils/Helper';
import Palette from '../../../utils/Palette';
import CustomTable from '../../reusable/CustomTable';
import Iconify from '../../reusable/Iconify';

export default function OrderList() {
    const [barcoinUsages, setBarcoinUsages] = useState([]);
    const [ridesUsages, setRidesUsages] = useState([]);
    const [openTopUpModal, setOpenTopUpModal] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTopUp, setSelectedTopUp] = useState(null);

    const barcoinUsagesTableColumns = [
        {
            id: 'created_at',
            label: 'Tanggal & jam',
            filter: true,
            render: (row) => {
                return row?.created_at ? moment(row?.created_at).format('DD MMM YYYY, HH:mm') : '-';
            },
        },
        {
            id: 'user_id',
            label: 'User',
            filter: true,
            render: (row) => {
                return row?.users?.username;
            },
        },
        {
            id: 'total_coins',
            label: 'Koin Dipakai',
            filter: true,
            render: (row) => {
                return (
                    <>
                        <Iconify icon={'fluent-emoji-flat:coin'}></Iconify>
                        {Helper.formatNumber(row.total_coins || 0)}
                    </>
                );
            },
        },
        {
            id: 'notes',
            label: 'Catatan',
            filter: true,
            render: (row) => {
                return (
                    <>
                        {row.notes}
                    </>
                );
            },
        },
    ];

    const [filterDateStart, setFilterDateStart] = useState(null)
    const [filterDateEnd, setFilterDateEnd] = useState(null)

    useEffect(() => {
        let d = new Date()
        let dLastWeek = new Date()
        dLastWeek.setDate(d.getDate() - 7);
        setFilterDateStart(dayjs(dLastWeek).format("YYYY-MM-DD"))
        setFilterDateEnd(dayjs(d).format("YYYY-MM-DD"))
    }, [])

    const ridesUsagesTableColumns = [
        {
            id: 'created_at',
            label: 'Tanggal & jam',
            filter: true,
            render: (row) => {
                return row?.created_at ? moment(row?.created_at).format('DD MMM YYYY, HH:mm') : '-';
            },
        },
        {
            id: 'user_id',
            label: 'User',
            filter: true,
            render: (row) => {
                return row?.users?.username;
            },
        },
        {
            id: 'currency',
            label: 'Jenis',
            filter: true,
            render: (row) => {
                return row.currency ? row.currency.replace('_', ' ') : '-';
            },
        },
        {
            id: 'total_rides',
            label: 'Rides Digunakan',
            filter: true,
            render: (row) => {
                return (
                    <>
                        {row.total_rides}
                    </>
                );
            },
        },
        {
            id: 'notes',
            label: 'Catatan',
            filter: true,
            render: (row) => {
                return (
                    <>
                        {row.notes}
                    </>
                );
            },
        },
    ];

    const initializeData = async () => {
        setLoading(true);
        try {
            let barcoinUsagesData = await OrderModel.getAllBarcoinUsages(filterDateStart, filterDateEnd);
            let ridesUsagesData = await OrderModel.getAllRidesUsages(filterDateStart, filterDateEnd);

            setRidesUsages(ridesUsagesData);
            setBarcoinUsages(barcoinUsagesData);
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (filterDateStart && filterDateEnd) {
            initializeData()
        }
    }, [filterDateEnd, filterDateStart])

    return (
        <>
            <Container fluid>
                <Row>
                    <Col md={12} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>

                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <small style={{marginRight: 10}}>
                                Filter Tanggal
                            </small>
                            <Flex>
                                {/*<Form.Label><small>Filter Mulai</small></Form.Label>*/}
                                <Form.Control
                                    placeholder={'DD/MM/YYYY'}
                                    type="date"
                                    value={filterDateStart}
                                    onChange={(e) => setFilterDateStart(e.target.value)}
                                />
                            </Flex>

                            <Flex>
                                {/*<Form.Label><small>Filter Selesai</small></Form.Label>*/}
                                <Form.Control
                                    placeholder={'DD/MM/YYYY'}
                                    type="date"
                                    value={filterDateEnd}
                                    onChange={(e) => setFilterDateEnd(e.target.value)}
                                />
                            </Flex>
                            <Link to="/orders/create">
                                <AntButton
                                    style={{
                                        top: '10px',
                                        width: 200,
                                        marginBottom: 20,
                                    }}
                                    onClick={() => {
                                    }}
                                    size={'middle'}
                                    type={'primary'}
                                >
                                    Tambah Order
                                </AntButton>
                            </Link>
                            {/* <Button className={'ml-3 bg-transparent text-white'}><Iconify
                                icon={'mdi:filter'}></Iconify> Export</Button> */}
                        </div>

                        <Card
                            style={{background: Palette.BACKGROUND_DARK_GRAY, color: 'white', width: '100%'}}
                            className="card-stats mb-4 mb-xl-0"
                        >
                            <CardHeader style={{display : "flex", paddingBottom : 0, flexDirection : "row", background: Palette.BACKGROUND_DARK_GRAY, fontWeight: 700}}>
                                <div style={{marginRight : "auto"}}>Riwayat Order Barcoins</div>
                                <CSVLink
                                    headers={[
                                        {label : "Tanggal Transaksi", key : "created_at"},
                                        {label : "Nama", key : "name"},
                                        {label : "Jumlah", key : "total_coins"},
                                        {label : "Catatan", key : "notes"},
                                    ]}
                                    filename={
                                        "Order History - " +
                                        new moment().format("dddd, MMMM Do YYYY, HH:mm") +
                                        ".csv"
                                    }
                                    data={barcoinUsages.map(obj => {
                                        // console.log("DDSS", dataSource)
                                        return {
                                            ...obj,
                                            name : obj?.users?.username,
                                            "Waktu Transaksi": new moment(obj.created_at).format("dddd, MMMM Do YYYY, HH:mm")
                                        }
                                    })}
                                >
                                    <Button className={"ml-1 bg-transparent text-white"}>
                                        <Iconify icon={"mdi:download"}></Iconify> Export
                                    </Button>
                                </CSVLink>
                            </CardHeader>
                            <CardBody>

                                <CustomTable
                                    showFilter={true}
                                    pagination={true}
                                    searchText={''}
                                    data={barcoinUsages}
                                    columns={barcoinUsagesTableColumns}
                                />
                            </CardBody>
                        </Card>
                        <Card
                            style={{background: Palette.BACKGROUND_DARK_GRAY, color: 'white', width: '100%'}}
                            className="card-stats mb-4 mb-xl-0"
                        >
                            <CardHeader style={{display : "flex", paddingBottom : 0,flexDirection : "row", background: Palette.BACKGROUND_DARK_GRAY, fontWeight: 700}}>
                                <div style={{marginRight : "auto"}}>Riwayat Order Rides</div>
                                <CSVLink
                                    headers={[
                                        {label : "Tanggal Transaksi", key : "created_at"},
                                        {label : "Nama", key : "name"},
                                        {label : "Jumlah", key : "total_rides"},
                                        {label : "Jenis", key : "currency"},
                                        {label : "Catatan", key : "notes"},
                                    ]}
                                    filename={
                                        "Rides History - " +
                                        new moment().format("dddd, MMMM Do YYYY, HH:mm") +
                                        ".csv"
                                    }
                                    data={ridesUsages.map(obj => {
                                        // console.log("DDSS", dataSource)
                                        return {
                                            ...obj,
                                            name : obj?.users?.username,
                                            "Waktu Transaksi": new moment(obj.created_at).format("dddd, MMMM Do YYYY, HH:mm")
                                        }
                                    })}
                                >
                                    <Button className={"ml-1 bg-transparent text-white"}>
                                        <Iconify icon={"mdi:download"}></Iconify> Export
                                    </Button>
                                </CSVLink>
                            </CardHeader>
                            <CardBody>
                                <CustomTable
                                    showFilter={true}
                                    pagination={true}
                                    searchText={''}
                                    data={ridesUsages}
                                    columns={ridesUsagesTableColumns}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
