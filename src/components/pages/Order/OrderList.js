import {Button, Card, CardBody, Container} from "reactstrap";
import Palette from "../../../utils/Palette";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import {Dropdown} from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import React, {useEffect, useState} from "react";
import moment from "moment";
import Helper from "../../../utils/Helper";
import TopUpHistoryModel from "../../../models/TopUpHistoryModel";
import {Space} from "antd";

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
            id: 'transaction_id', label: 'ID Transaksi', filter: true,
            render: (row => {
                return row?.transactions?.order_id
            })
        },
        {
            id: 'user_id', label: 'User', filter: true,
            render: (row => {
                return row?.user?.name
            })
        },
        {
            id: 'qty', label: 'Jumlah tiket dibeli', filter: true,
            render: (row => {
                return row?.qty
            })
        },

        {
            id: 'amount', label: 'Pendapatan', filter: true,
            render: (row => {
                return <>
                    <Iconify icon={'fluent-emoji-flat:coin'}></Iconify>
                    {Helper.formatNumber(row.amount || 0)}
                </>
            })
        },

        {
            id: 'status', label: 'Status', filter: true,
            render: (row => {
                return row?.transactions?.paid_status === 'SETTLEMENT' || 'CAPTURE' || 'APPROVED' ?
                    <span style={{color: Palette.THEME_GREEN}}><Iconify
                        icon={'lets-icons:check-fill'}></Iconify> {row?.transactions?.paid_status}</span> :
                    <span style={{color: Palette.THEME_RED}}><Iconify
                        icon={'carbon:close-filled'}></Iconify> {row?.transactions?.paid_status}</span>
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
                <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
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
            </Container>
        </>
    )
}