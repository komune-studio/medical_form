import Modal from "react-bootstrap/Modal";
import {Button, Form, Row} from "react-bootstrap";
import { Tabs } from 'antd';
import {DatePicker, Spin, Upload as AntUpload} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import CustomTable from "../../reusable/CustomTable";
import React from "react";

export default function UserHistoryModal({isOpen, userData, onClose}){

    const dataHistoryTopUp = [
        {
            id : 1,
            name : 'Paket A',
            price : '10.000.000',
            description : '',
            top_up_method:'VA',
            top_up_at : '10/03/2024 11:20',
            top_up_status : 'SUCCESS'
        },
        {
            id : 2,
            name : 'Paket B',
            price : '10.000.000',
            top_up_method:'VA',
            description : '',
            top_up_at : '10/03/2024 13:32',
            top_up_status : 'PENDING'
        },
        {
            id : 3,
            name : 'Paket C',
            price : '12.000.000',
            top_up_method:'GOPAY',
            description : '',
            top_up_at : '10/03/2024 10:12',
            top_up_status : 'PENDING'
        }
    ]


    const columnsTopUp = [

        {
            id: 'name', label: 'Nama Paket', filter: true,
        },
        {
            id: 'price', label: 'Harga Paket', filter: false,
        },
        {
            id: 'description', label: 'Deskripsi', filter: false,
        },
        {
            id: 'top_up_at', label: 'Tanggal Top Up', filter: false,
        },
        {
            id: 'top_up_method', label: 'Top Up Method', filter: false,
        },
        {
            id: 'top_up_status', label: 'Status', filter: false,
        },
    ]

    const columnsOrder = [

        {
            id: 'date', label: 'Tanggal', filter: true,
        },
        {
            id: 'transaction_code', label: 'ID Transaksi', filter: false,
        },
        {
            id: 'qty', label: 'Jumlah Tiket', filter: false,
        },
        {
            id: 'coin', label: 'Pendapatan', filter: false,
        },
        {
            id: 'status', label: 'Status', filter: false,
        },
    ]


    const dataHistoryTransaction = [
        {
            id : 1,
            date : '10/03/2024 10:12',
            transaction_code : 'BC-120102102',
            qty : 10,
            coin : '500.0000',
            status : 'SETTLEMENT',
        },
        {
            id : 1,
            date : '10/03/2024 10:12',
            transaction_code : 'BC-120102103',
            qty : 10,
            coin : '500.0000',
            status : 'SETTLEMENT',
        },
        {
            id : 1,
            date : '10/03/2024 10:12',
            transaction_code : 'BC-120102104',
            qty : 10,
            coin : '500.0000',
            status : 'SETTLEMENT',
        },
        {
            id : 1,
            date : '10/03/2024 10:12',
            transaction_code : 'BC-120102105',
            qty : 10,
            coin : '500.0000',
            status : 'SETTLEMENT',
        },
    ]

    const items = [
        {
            key: '1',
            label: 'TopUp History',
            children: <CustomTable
                mode={'light'}
                pagination={false}
                searchText={''}
                data={dataHistoryTopUp}
                columns={columnsTopUp}
            />,
        },
        {
            key: '2',
            label: 'Purchase History',
            children: <CustomTable
                mode={'light'}
                pagination={false}
                searchText={''}
                data={dataHistoryTransaction}
                columns={columnsOrder}
            />,
        },
    ];
    const handleClose = (refresh) => {
        onClose(refresh)
    }



    return (
        <>
            <Modal
                size={'lg'}
                show={isOpen}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Riwayat Transaksi</Modal.Title>
                </Modal.Header>
                <Modal.Body className={'py-3'}>
                    <div className={'d-flex mb-4'}>
                        <p>Balance : <strong>10.999</strong></p>
                    </div>
                    <Tabs defaultActiveKey="1" items={items} onChange={() => {
                    }}/>

                    <div className={"d-flex mt-5 flex-row justify-content-end"}>
                        <Button size="sm" variant="outline-danger" onClick={() => handleClose()}
                                style={{marginRight: '5px'}}>
                            Tutup
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}