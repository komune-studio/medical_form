import { Button, Card, CardBody, Container, Row, Col } from "reactstrap";
import Palette from "../../../utils/Palette";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import { Dropdown } from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import React, { useEffect, useState } from "react";
import moment from "moment";
import Helper from "../../../utils/Helper";
import TopUpHistoryModel from "../../../models/TopUpHistoryModel";
import { Space, Button as AntButton, } from "antd";
import OrderModel from "models/OrderModel";
import { Link } from "react-router-dom";

export default function OrderList() {
    const [dataSource, setDataSource] = useState([]);
    const [openTopUpModal, setOpenTopUpModal] = useState(false)
    const [isNewRecord, setIsNewRecord] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedTopUp, setSelectedTopUp] = useState(null)

    const columns = [
        {
            id: 'created_at', label: 'Tanggal & jam', filter: true,
            render: (row => {
                return row?.created_at ? moment(row?.created_at).format('DD MMM YYYY, HH:mm') : '-'
            })
        },
        {
            id: 'user_id', label: 'User', filter: true,
            render: (row => {
                return row?.users?.username
            })
        },
        {
            id: 'quantity', label: 'Jumlah tiket dibeli', filter: true,
            render: (row => {
                let total = 0
                for(let bd of row.barcoins_usage_detail){
                    total+=bd.quantity
                }
                return total
            })
        },
        {
            id: 'total_coins', label: 'Koin Dipakai', filter: true,
            render: (row => {
                return <>
                    <Iconify icon={'fluent-emoji-flat:coin'}></Iconify>
                    {Helper.formatNumber(row.total_coins || 0)}
                </>
            })
        },
        {
            id: 'action', label: '',
            render: (row => {
                return (
                    <Dropdown
                        menu={{
                            items,
                        }}
                        trigger={['click']}
                    >
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                ...
                            </Space>
                        </a>
                    </Dropdown>
                )
            })
        }
    ]


    const initializeData = async () => {
        setLoading(true)
        try {
            console.log('masuk sinih')
            let result = await OrderModel.getAll()
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

    const items = [
        {
            label: <a href="https://www.antgroup.com">1st menu item</a>,
            key: '0',
        },
        {
            label: <a href="https://www.aliyun.com">2nd menu item</a>,
            key: '1',
        },
        {
            type: 'divider',
        },
        {
            label: '3rd menu item',
            key: '3',
        },
    ];
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md={12} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <Link to="/orders/create">
                            <AntButton style={{
                                top: '10px', width: 200, marginBottom: 20
                            }} onClick={() => {

                            }} size={'middle'} type={'primary'}>Tambah Order</AntButton>
                        </Link>

                        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white", width: "100%" }}
                            className="card-stats mb-4 mb-xl-0">

                            <CardBody>
                                <CustomTable
                                    showFilter={true}
                                    pagination={true}
                                    searchText={''}
                                    data={dataSource}
                                    columns={columns}
                                />
                            </CardBody>
                        </Card>

                    </Col>
                </Row>

            </Container>
        </>
    )
}