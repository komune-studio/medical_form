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
import LoyaltyShopModel from "../../../models/LoyaltyShopModel";

LoyaltyModalForm.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    selectedData: PropTypes.object,
};


export default function LoyaltyModalForm({isOpen, close, isNewRecord, selectedData}) {
    const [name, setName] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)
    const [description, setDescription] = useState(null)
    const [price, setPrice] = useState(null)
    const [loadingUpload, setLoadingUpload] = useState(false)

    const onSubmit = async () => {
        if (!name) {
            swal.fireError({text: "Nama  Wajib diisi",})
            return
        }
        if (!price) {
            swal.fireError({text: "Harga Wajib diisi",})
            return
        }
        if (!description) {
            swal.fireError({text: "Deskripsi Wajib diisi",})
            return
        }
        if (!imageUrl) {
            swal.fireError({text: "Gambar Wajib diisi",})
            return
        }
        try {
            let body = {
                name: name,
                description: description,
                image_url : imageUrl,
                price : price,
            }
            let msg = ''
            if (isNewRecord) {
                await LoyaltyShopModel.create(body)
                msg = "Berhasil membuat Loyalty Shop"
            } else {
                await LoyaltyShopModel.edit(selectedData?.id, body)
                msg = "Berhasil mengubah Loyalty Shop"
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
            setName(selectedData?.name)
            setDescription(selectedData?.description)
            setImageUrl(selectedData?.image_url)
            setPrice(selectedData?.price)
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
        setName("")
        setDescription("")
        setImageUrl(null)
        setPrice(null)
    }

    const handleUpload = async (file) => {
        try {
            setLoadingUpload(true)
            let result = await UploadModel.uploadPicutre(file.file?.originFileObj)

            if(result?.location){
                setImageUrl(result?.location)
                message.success('Successfully upload user')
            }
            setLoadingUpload(false)
        }catch (e) {
            console.log('isi e', e)
            message.error("Failed to upload user")
            setLoadingUpload(false)
        }
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>{isNewRecord ? 'Buat Loyalty Shop' : `Ubah Loyalty Shop`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Nama</Form.Label>
                <Form.Control
                    value={name}
                    autoComplete={"referralCode"}
                    onChange={(e) => setName(e.target.value)} type="text" placeholder="Masukan Nama Loyalty Shop"/>
            </Form.Group>
            <Form.Group>
                <Form.Label style={{ fontSize: "0.8em" }}>Gambar</Form.Label>
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
                    {imageUrl ? (
                        <>
                            {
                                !loadingUpload ? <img
                                    src={imageUrl}
                                    alt="avatar"
                                    style={{
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'cover'
                                    }}
                                /> : <Spin style={{zIndex:100000}} size="large" />
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
                            {loadingUpload ?  <Spin style={{zIndex:100000}} size="large" /> : <PlusOutlined/>}
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
                <Form.Label style={{fontSize: "0.8em"}}>Harga</Form.Label>
                <Form.Control

                    value={price}
                    autoComplete={"pricing"}
                    onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Masukan Harga"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{fontSize: "0.8em"}}>Deskripsi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    autoComplete={"description"}
                    onChange={(e) => setDescription(e.target.value)} type="text" placeholder="Masukan Deskripsi Promo"/>
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