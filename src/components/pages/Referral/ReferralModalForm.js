import Modal from 'react-bootstrap/Modal';
import {DatePicker, message, Spin, Upload as AntUpload} from "antd";
import {Button, Form} from 'react-bootstrap';
import {useEffect, useState} from "react";
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
        try {
            let body = {
                code: code,
                type: type,
                value: value.toString()
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
                <Form.Label style={{fontSize: "0.8em"}}>Kode Referral;</Form.Label>
                <Form.Control
                    value={code}
                    autoComplete={"referralCode"}
                    onChange={(e) => setCode(e.target.value)} type="text" placeholder="Masukan Kode Referral"/>
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlSelect1">
                <Form.Label style={{fontSize: "0.8em"}}>Tipe Referral</Form.Label>
                <Form.Control value={type} onChange={(e) => {
                    setType(e.target.value)
                }} as="select">
                    <option value={""}>Pilih tipe Referral</option>
                    <option value={"fixed"}>Fixed</option>
                    <option value={"percentage"}>Percentage</option>
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Value</Form.Label>
                <Form.Control
                    value={value}
                    autoComplete={"values"}
                    onChange={(e) => setValue(e.target.value)} type="number" placeholder="Masukan Harga Paket"/>
            </Form.Group>

            <div className={"d-flex flex-row justify-content-end"}>
                <Button size="sm" variant="outline-danger" onClick={() => handleClose()} style={{marginRight: '5px'}}>
                    Batal
                </Button>
                <Button size="sm" variant="primary" onClick={() => {
                    onSubmit()
                }}>
                    {isNewRecord ? 'Buat' : 'Ubah'}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}