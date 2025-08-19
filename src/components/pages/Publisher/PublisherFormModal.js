import Modal from 'react-bootstrap/Modal';
import { Button, message, Flex } from "antd";
import { Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";

PublisherFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    publisherData: PropTypes.object,
};


export default function PublisherFormModal({ isOpen, close, isNewRecord, publisherData }) {
    const [name, setName] = useState(null)
    const [address, setAddress] = useState(null)
    const [website, setWebsite] = useState(null)


    const onSubmit = async () => {
        if (!name) {
            swal.fireError({ text: "Nama Penerbit Wajib diisi", })
            return
        }
        if (!address) {
            swal.fireError({ text: "Lokasi Wajib diisi", })
            return
        }
        if (!website) {
            swal.fireError({ text: "Website Wajib diisi", })
            return
        }

        try {
            let result;
            let body = {
                name: name,
                address: address,
                website: website
            }
            let msg = ''
            if (isNewRecord) {
                // await UserModel.create(body)
                msg = "Berhasil menambah Penerbit"
            } else {
                // await UserModel.edit(publisherData?.id, body)
                msg = "Berhasil update Penerbit"
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
        console.log('isi publisherData', publisherData)
        if (!isNewRecord) {
            setName(publisherData?.name)
            setAddress(publisherData?.address)
            setWebsite(publisherData?.website)
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
        setAddress("")
        setWebsite("")
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{isNewRecord ? 'Buat Penerbit' : `Ubah Penerbit`}</Modal.Title>
                <Button onClick={() => {
                    close()
                }} style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                    icon={<CloseOutlined />} />
            </div>
        </Modal.Header>
        <Modal.Body>
            <Flex vertical gap={8} className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Nama Penerbit</Form.Label>
                <Form.Control
                    value={name}
                    autoComplete={"name"}
                    onChange={(e) => setName(e.target.value)} type="text" placeholder="Nama Penerbit" />
            </Flex>
            <Flex vertical gap={8} className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Lokasi</Form.Label>
                <Form.Control
                    value={address}
                    autoComplete={"address"}
                    onChange={(e) => setAddress(e.target.value)} type="text" placeholder="Lokasi" />
            </Flex>
            <Flex vertical gap={8} className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Website</Form.Label>
                <Form.Control
                    value={website}
                    autoComplete={"website"}
                    pattern=''
                    onChange={(e) => setWebsite(e.target.value)} type="text" placeholder="Website" />
            </Flex>

            <div className={"d-flex flex-row justify-content-end"}>
                <Button className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                    onClick={() => handleClose()} style={{ marginRight: '5px' }}>
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