import {Col, Form} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {Card, CardBody, Container, FormGroup, Row} from "reactstrap";
import Palette from "../../../utils/Palette";
import {Button as AntButton, Space} from "antd";
import CustomModal from '../../reusable/CustomModal'
import CustomTable from "../../reusable/CustomTable";
import moment from "moment";
import NotificationHistoryModel from '../../../models/NotificationHistoryModel'


const columns = [
    {id: 'id', label: 'ID', filter: true, width: '15%'},
    {id: 'title', label: 'Title', filter: true, width: '15%'},
    {id: 'body', label: 'Body', filter: true, width: '15%'},
    {id: 'created_by', label: 'Created By', filter: true, width: '15%', render: ((row) => {
        return row.created_by_admin?.username
    })},
    {
        id: 'created_at', label: 'Tanggal Dibuat', filter: true, width: '15%',
        render: (row => {
            console.log(row)
            return moment(row.created_at).format('DD MMM YYYY HH:mm')
        })
    },
    {
        id: '', label: '', filter: false,
        render: ((value) => {
            return (
                <>
                    <Space size="small">
                        {/*<Tooltip title="Edit">*/}
                        {/*    <AntButton*/}
                        {/*        type={'link'}*/}
                        {/*        style={{color: Palette.MAIN_THEME}}*/}
                        {/*        className={"d-flex align-items-center justify-content-center"}*/}
                        {/*        shape="circle"*/}
                        {/*        icon={<Iconify icon={"material-symbols:edit"}/>}*/}

                        {/*    >Edit</AntButton>*/}
                        {/*</Tooltip>*/}
                        {/*<Tooltip title={value?.active ? 'Hapus' : 'Restore'}>*/}
                        {/*    {*/}
                        {/*        value?.active ?*/}
                        {/*            <AntButton type={'link'} style={{color: Palette.MAIN_THEME}} className={"d-flex align-items-center justify-content-center"} shape="circle" icon={<Iconify icon={"material-symbols:delete-outline"}/>}>Hapus</AntButton>*/}
                        {/*            : <AntButton type={'link'} style={{color: Palette.MAIN_THEME}} className={"d-flex align-items-center justify-content-center"} shape="circle" icon={<Iconify icon={"mdi:restore"}/>}>Restore</AntButton>*/}
                        {/*    }*/}

                        {/*</Tooltip>*/}
                    </Space>
                </>
            )

        })
    },

]

export default function Notification() {
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [dataSource, setDataSource] = useState([])
    const [test, setTest] = useState('')

    const getData = async () => {
        try {
            let result = await NotificationHistoryModel.getAll()
            setDataSource(result)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        getData()
    }, []);

    const onSubmit = async () => {
        try {
            let result = await NotificationHistoryModel.create({title, body})
            setIsCreateModalOpen(false)
            getData()
            console.log('created row: ', result)
        } catch (e) {
            console.log(e)
        }
    }


    return (
        <Container fluid>
            <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
                  className="card-stats mb-4 mb-xl-0">
                <CardBody>
                    <Row>
                        <Col className='mb-3' md={6}>
                            <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Notification</div>
                        </Col>
                        <Col className='mb-3 text-right' md={6}>
                            <AntButton onClick={() => {setIsCreateModalOpen(true)}} size={'middle'} type={'primary'}>Buat Notifikasi</AntButton>
                        </Col>
                    </Row>
                    <CustomTable showFilter={true} pagination={true} searchText={''} data={dataSource} columns={columns}/>
                </CardBody>
            </Card>
            <CustomModal isOpen={isCreateModalOpen} title={'Buat Notifikasi Baru'} onClose={() => setIsCreateModalOpen(false)} onSubmit={onSubmit}>
                <FormGroup>
                    <Form.Label style={{ fontSize: '0.8em', marginBottom: 8 }}>Judul</Form.Label>
                    <Form.Control value={title} autoComplete={"referralCode"} onChange={(e) => setTitle(e.target.value)} type="text" />
                </FormGroup>
                <FormGroup>
                    <Form.Label style={{ fontSize: '0.8em', marginBottom: 8 }}>Pesan</Form.Label>
                    <Form.Control value={body} autoComplete={"referralCode"} onChange={(e) => setBody(e.target.value)} type="text" rows={4} as='textarea' />
                </FormGroup>

            </CustomModal>
        </Container>
    )
}