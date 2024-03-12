import Modal from 'react-bootstrap/Modal';
import { Col, Button} from "react-bootstrap";
import FileUpload from "../../reusable/FileUpload";
import Swal from "sweetalert2";
import {Form, Input, Switch, Upload, message, Image, Select, Space} from "antd";
import { Card, Row, CardBody, Container} from "reactstrap";
import HeaderNav from "components/Headers/HeaderNav.js";
import { useEffect, useMemo, useState } from "react";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import UploadModel from "../../../models/UploadModel";
import Admin from "../../../models/AdminModel";
import { useHistory } from "react-router-dom";

import PropTypes from "prop-types";
import Iconify from "../../reusable/Iconify";
import swal from "../../reusable/CustomSweetAlert";
import LoadingButton from "../../reusable/LoadingButton";

export default function EditPasswordAdminPage({
    match: {
        params: { id }
    }
}){
    const [form] = Form.useForm();
    const history = useHistory();
    const [adminName, setAdminName] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        initializeData()
    }, [])

    const initializeData = async () => {
        try {
            let result = await Admin.getById(id);
            console.log("result is ", result)
            setAdminName(result.username)
        } catch (e) {
        }
    }

    const onSubmit = async () => {

        if (!confirmPassword) {
            message.error({ text: "Konfirmasi Password Wajib diisi", })
            return
        }

        if (newPassword !== confirmPassword) {
            message.error({ text: "Password Baru dan Konfirmasi Password tidak sesuai", })
            return
        }

        try {
            let body = {
                new_password: newPassword,
            };
            let result2 = await Admin.edit_password(id, body)
            if (result2?.id) {
                message.success('Berhasil merubah password Admin')
                history.push('/admins')
            } else {
                message.error('Gagal menyimpan Admin')
            }
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : errorMessage,
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    return (
    <>
            <HeaderNav />
            <Container fluid>
                    <>
                        <Card className="card-stats mb-4 mb-xl-0">
                            <CardBody>
                                <Row>
                                    <Col className='mb-3' md={12}>
                                        <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Perbarui Admin {adminName}</div>
                                    </Col>
                                </Row>
                                <Form
                                    form={form}
                                    name="basic"
                                    layout={'vertical'}
                                    onFinish={onSubmit}
                                    autoComplete="off"
                                >
                                {/* New password */}
                                <Form.Item
                                label="Kata sandi baru"
                                name="newPassword"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Mohon memasukkan kata sandi baru!',
                                    },
                                ]}
                                    >
                                <Input value={newPassword} onChange={(e) => { setNewPassword(e.target.value) }} placeholder='Masukkan kata sandi baru disini' type="password" />
                                </Form.Item>

                                {/* New password confirmation */}
                                <Form.Item
                                label="Konfirmasi kata sandi baru"
                                name="newPasswordConfirmation"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Mohon memasukkan konfirmasi kata sandi baru!',
                                    },
                                ]}
                                    >
                                <Input value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }} placeholder='Masukkan konfirmasi kata sandi baru disini' type="password" />
                                </Form.Item>

                                    <Form.Item className='d-flex justify-content-end'>
                                        <Button size="sm" variant="outline-danger" style={{marginRight: 10}} onClick={() => {
                                            history.push('/admins/')
                                        }} >
                                            Batal
                                        </Button>
                                        <Button size="sm" variant="primary" type="submit">
                                            Simpan
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </CardBody>
                        </Card>
                    </>
            </Container>
        </>
    )
}
