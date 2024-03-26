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
import TopUp from "../../../models/TopUpModel";

TopUpFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    topUpData: PropTypes.object,
};


export default function TopUpFormModal({isOpen, close, isNewRecord, topUpData}) {
    const [packageName, setPackageName] = useState(null)
    const [price, setPrice] = useState(null)
    const [description, setDescription] = useState(null)
    const [currency, setCurrency] = useState(null)
    const [topUpImage, setTopUpImage] = useState(null)
    const [promotionalText, setPromotionalText] = useState(null)
    const [loadingUpload, setLoadingUpload] = useState(false)
    const handleUpload = async (file) => {
        try {
            setLoadingUpload(true)
            let result = await UploadModel.uploadPicutre(file.file?.originFileObj)
            if (result?.location) {
                setTopUpImage(result?.location)
                message.success('Successfully upload image')
            }
            setLoadingUpload(false)
        } catch (e) {
            console.log('isi e', e)
            message.error("Failed to upload image")
            setLoadingUpload(false)
        }
    }
    const onSubmit = async () => {
        if (!packageName) {
            swal.fireError({text: "Nama Paket Wajib diisi",})
            return
        }
        if (!price) {
            swal.fireError({text: "Harga Pakat Wajib diisi",})
            return
        }

        try {
            let body = {
                package_name: packageName,
                price: parseFloat(price),
                description: description,
                promotional_text: promotionalText,
                image: topUpImage,
                currency : currency
            }
            let msg = ''
            if (isNewRecord) {
                await TopUp.create(body)
                msg = "Berhasil membuat Pakat Top Up"
            } else {
                await TopUp.edit(topUpData?.id, body)
                msg = "Berhasil ubah Pakat Top Up"
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
        console.log('datax', topUpData)
        if (!isNewRecord) {
            setPackageName(topUpData?.package_name)
            setPrice(topUpData?.price)
            setDescription(topUpData?.description)
            setTopUpImage(topUpData?.image)
            setCurrency(topUpData?.currency)
            setPromotionalText(topUpData?.promotional_texnp)
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
        setDescription("")
        setPackageName("")
        setPromotionalText("")
        setPrice(null)
        setTopUpImage(null)
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>{isNewRecord ? 'Buat Paket Top Up' : `Ubah Paket Top Up`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group>
                <Form.Label style={{fontSize: "0.8em"}}>Image</Form.Label>
                <AntUpload
                    rootClassName={'upload-background'}
                    name="avatar"
                    listType="picture-card"
                    fileList={[]}
                    className="avatar-uploader"
                    showUploadList={false}
                    onChange={(file) => {
                        handleUpload(file)
                    }}
                >
                    {topUpImage ? (
                        <>
                            {
                                !loadingUpload ? <img
                                    src={topUpImage}
                                    alt="avatar"
                                    style={{
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'cover'
                                    }}
                                /> : <Spin style={{zIndex: 100000}} size="large"/>
                            }

                        </>

                    ) : (
                        <button
                            style={{
                                border: 0,
                                background: 'none',
                            }}
                            type="button"
                        >
                            {loadingUpload ? <Spin style={{zIndex: 100000}} size="large"/> : <PlusOutlined/>}
                            <div
                                style={{
                                    marginTop: 8,
                                }}
                            >
                                Upload
                            </div>
                        </button>
                    )}
                </AntUpload>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Nama Paket</Form.Label>
                <Form.Control
                    value={packageName}
                    autoComplete={"packageName"}
                    onChange={(e) => setPackageName(e.target.value)} type="text" placeholder="Masukan Nama Paket"/>
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlSelect1">
                <Form.Label style={{fontSize: "0.8em"}}>Tipe Paket</Form.Label>
                <Form.Control value={currency} onChange={(e) => {
                    setCurrency(e.target.value)
                }} as="select">
                    <option>Pilih tipe paket</option>
                    <option value={"COIN"}>COIN</option>
                    <option value={"RIDES"}>RIDE</option>
                </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Harga Paket</Form.Label>
                <Form.Control

                    value={price}
                    autoComplete={"pricing"}
                    onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Masukan Harga Paket"/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Promotional Text</Form.Label>
                <Form.Control
                    value={promotionalText}
                    autoComplete={"promotionalText"}
                    onChange={(e) => setPromotionalText(e.target.value)} type="text" placeholder="Masukan Promotional Text"/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Deskripsi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    autoComplete={"email"}
                    onChange={(e) => setDescription(e.target.value)} type="text" placeholder="Masukan Deskripsi Paket"/>
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