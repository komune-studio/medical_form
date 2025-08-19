import Modal from 'react-bootstrap/Modal';
import { Button, message, Flex } from "antd";
import { Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";

CategoryFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    categoryData: PropTypes.object,
};


export default function CategoryFormModal({ isOpen, close, isNewRecord, categoryData }) {
    const [name, setName] = useState(null)
    const [description, setDescription] = useState(null)


    const onSubmit = async () => {
        if (!name) {
            swal.fireError({ text: "Nama Kategori Wajib diisi", })
            return
        }
        if (description) {
            swal.fireError({ text: "Deskripsi Wajib diisi", })
            return
        }

        try {
            let result;
            let body = {
                name: name,
                description: description,
            }
            let msg = ''
            if (isNewRecord) {
                // await UserModel.create(body)
                msg = "Berhasil membuat Kategori"
            } else {
                // await UserModel.edit(publisherData?.id, body)
                msg = "Berhasil update Kategori"
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
        console.log('isi categoryData', categoryData)
        if (!isNewRecord) {
            setName(categoryData?.name)
            setDescription(categoryData?.description)
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
                <Form.Label style={{ fontSize: "0.8em" }}>Nama Kategori</Form.Label>
                <Form.Control
                    value={name}
                    autoComplete={"name"}
                    onChange={(e) => setName(e.target.value)} type="text" placeholder="Nama Kategori" />
            </Flex>
            <Flex vertical gap={8} className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Deskripsi Kategori</Form.Label>
                <Form.Control
                    value={description}
                    autoComplete={"description"}
                    as="textarea" rows={2}
                    onChange={(e) => setName(e.target.value)} type="text" placeholder="Deskripsi Kategori" />
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