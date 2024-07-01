import {Form} from "react-bootstrap";
import React, {useState} from "react";
import {Card, CardBody, Container} from "reactstrap";
import Palette from "../../../utils/Palette";
import {Button as AntButton, Button, Space, Tooltip} from "antd";
import CustomModal from '../../reusable/CustomModal'
import CustomTable from "../../reusable/CustomTable";
import moment from "moment";
import Iconify from "../../reusable/Iconify";


const columns = [
    {id: 'id', label: 'ID', filter: true, width: '15%'},
    {id: 'title', label: 'Judul', filter: true, width: '15%'},
    {id: 'body', label: 'Deskripsi', filter: true, width: '15%'},
    {id: 'created_by', label: 'Pengirim', filter: true, width: '15%'},
    {id: 'sent_to', label: 'Penerima', filter: true, width: '15%'},
    {
        id: 'created_at', label: 'Tanggal Dibuat', filter: true, width: '15%',
        render: (row => {
            return moment(row.created_at).format('DD MMM YYYY HH:mm')
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
                                type={'link'}
                                style={{color: Palette.MAIN_THEME}}
                                className={"d-flex align-items-center justify-content-center"}
                                shape="circle"
                                icon={<Iconify icon={"material-symbols:edit"}/>}

                            >Edit</AntButton>
                        </Tooltip>
                        <Tooltip title={value?.active ? 'Hapus' : 'Restore'}>
                            {
                                value?.active ?
                                    <AntButton type={'link'} style={{color: Palette.MAIN_THEME}} className={"d-flex align-items-center justify-content-center"} shape="circle" icon={<Iconify icon={"material-symbols:delete-outline"}/>}>Hapus</AntButton>
                                    : <AntButton type={'link'} style={{color: Palette.MAIN_THEME}} className={"d-flex align-items-center justify-content-center"} shape="circle" icon={<Iconify icon={"mdi:restore"}/>}>Restore</AntButton>
                            }

                        </Tooltip>
                    </Space>
                </>
            )

        })
    },

]

export default function Messaging() {
    const [form, setForm] = useState({title: '', body: ''})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [dataSource, setDataSource] = useState([])

    const CustomField = ({title, onChange, rows}) => {
        return (
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>{title}</Form.Label>
                <Form.Control as={rows && 'textarea'} rows={rows} onChange={(e) => onChange(e.target.value)} type="text" placeholder="Title"/>
            </Form.Group>
        )
    }

    const onSubmit = () => {

    }

    return (
        <Container fluid>
            <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
                  className="card-stats mb-4 mb-xl-0">
                <CardBody>
                    <div style={{display: 'flex', justifyContent: 'right'}}>
                        <Button type={'primary'} size="sm" variant="primary" onClick={onSubmit}>
                            {'Buat Notifikasi'}
                        </Button>
                    </div>
                </CardBody>
            </Card>
            <CustomTable showFilter={true} pagination={true} searchText={''} data={dataSource} columns={columns}/>
            <CustomModal isOpen={false} title={'Create new Notification'} onClose={() => console.log('closed')}>
                <CustomField title={'Title'} onChange={(e) => setForm({...form, title: e.target.value})}/>
                <CustomField title={'Body'} rows={4} as={'textarea'} value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} type="text" placeholder="Body"/>
            </CustomModal>
        </Container>
    )
}