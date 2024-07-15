import Modal from 'react-bootstrap/Modal';
import {Button, DatePicker, message, Spin, Switch, Upload as AntUpload} from "antd";
import {Col, Form, Row} from 'react-bootstrap';
import React, {useEffect, useState} from "react";
import UserModel from "../../../models/UserModel";
import {LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import moment from "moment/moment";
import UploadModel from "../../../models/UploadModel"
import Referral from "../../../models/ReferralModel";

ReferralModalForm.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    referralData: PropTypes.object,
};


export default function ReferralModalForm({isOpen, close, isNewRecord, referralData}) {
    const [code, setCode] = useState(null)
    const [type, setType] = useState(null)
    const [value, setValue] = useState(null)
    const [active, setActive] = useState(false)
    const [loadingUpload, setLoadingUpload] = useState(false)

    const onSubmit = async () => {
        if (!code) {
            swal.fireError({text: "Kode Referral Wajib diisi",})
            return
        }
        if (!type) {
            swal.fireError({text: "Type Referral Wajib diisi",})
            return
        }

        if (!value) {
            swal.fireError({text: "Nilai hadiah Wajib diisi",})
            return
        }

        if (parseInt(value) <= 0) {
            swal.fireError({text: "Nilai hadiah harus lebih dari 0",})
            return
        }

        try {
            let body = {
                code: code,
                type: type,
                value: value.toString(),
                active: active,
            }
            let msg = ''
            if (isNewRecord) {
                await Referral.create(body)
                msg = "Berhasil membuat Referral"
            } else {
                await Referral.edit(referralData?.id, body)
                msg = "Berhasil mengubah Referral"
            }
            message.success(msg)
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : "An Error Occured",
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initForm = () => {
        if (!isNewRecord) {
            setCode(referralData?.code)
            setValue(referralData?.value)
            setType(referralData?.type)
            setActive(referralData?.active)
        }

    }
    useEffect(() => {
        if (isNewRecord) {
            reset()
        } else {
            initForm()
        }


    }, [isOpen])

    const reset = () => {
        setType("")
        setCode("")
        setValue("")
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>{isNewRecord ? 'Buat Referral' : `Ubah Referral`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Kode Referral</Form.Label>
                <div className={'info-hint mb-2 mt-2'}>
                    <p>Teks ini merupakan instruksi untuk foto yang perlu diupload.</p>
                </div>
                <Form.Control
                    value={code}
                    autoComplete={"referralCode"}
                    onChange={(e) => setCode(e.target.value)} type="text" placeholder="Masukan Kode Referral"/>
            </Form.Group>
            <div className={'info-hint mb-2 mt-2'}>
                <p>
                    Tentukan tipe hadiah yang ingin anda berikan. Anda dapat memilih dari dua tipe hadiah:
                </p>
                <p>1. Percentage Discount - Misalnya: potongan 10% saat mereka menggunakan kode referral ketika membeli
                    item.</p>
                <p>

                    2.Fixed Discount - Misalnya: Diskon Rp 50.000 ketika mereka menggunakan kode referral ketika membeli
                    item.
                </p>
            </div>
            <Row>
                <Col md={6}>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label style={{fontSize: "0.8em"}}>Pilih tipe hadiah</Form.Label>
                        <Form.Control value={type} onChange={(e) => {
                            setType(e.target.value)
                        }} as="select">
                            <option value={""}>Pilih tipe Referral</option>
                            <option value={"fixed"}>Fixed</option>
                            <option value={"percentage"}>Percentage</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{fontSize: "0.8em"}}>Nilai hadiah</Form.Label>
                        <Form.Control
                            value={value}
                            autoComplete={"values"}
                            onChange={(e) => setValue(e.target.value)} type="number" placeholder="Masukan Nilai Hadiah"/>
                    </Form.Group>

                </Col>
            </Row>
            <div className={'d-flex'} style={{justifyContent: 'space-between'}}>
                <div className={'info-hint mb-2 mt-2'}>
                    <span className={'text-white'} style={{fontSize: 16}}>Aktifkan di Barcode Gokart App</span>
                    <p>Promo aktif akan muncul di Barcode Gokart App dan bisa dilihat oleh pelanggan.</p>
                </div>
                <Switch defaultChecked={true} checked={active} onChange={() => setActive(!active)}/>
            </div>

            <div className={"d-flex flex-row justify-content-end"}>
                <Button className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                        onClick={() => handleClose()} style={{marginRight: '5px'}}>
                    Batal
                </Button>
                <Button type={'primary'} size="sm" variant="primary" onClick={() => {
                    onSubmit()
                }}>
                    {isNewRecord ? 'Simpan' : 'Ubah'}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}