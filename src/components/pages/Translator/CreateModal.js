import Modal from 'react-bootstrap/Modal';
import { Form, Input, message } from "antd";
import { Button } from 'react-bootstrap';
import FileUpload from "../../reusable/FileUpload";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import UploadModel from "../../../models/UploadModel";
import AdminModel from "../../../models/AdminModel";

import PropTypes from "prop-types";
import Iconify from "../../reusable/Iconify";
import swal from "../../reusable/CustomSweetAlert";
import LoadingButton from "../../reusable/LoadingButton";

CreateTranslatorModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    translatorList: PropTypes.object
};


export default function CreateTranslatorModal({ isOpen, itemId, close, translatorList }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    // const [email, setEmail] = useState("")

    const onSubmit = async () => {

        if (!username) {
            swal.fireError({ text: "Username Wajib diisi", })
            return
        }

        if (!password) {
            swal.fireError({ text: "Password Wajib diisi", })
            return
        }

        // if(!email){
        //     swal.fireError({text: "Username Wajib diisi",})
        //     return
        // }

        try {
            // Still using Admin Model, need to be changed later
            let result2 = await AdminModel.create({
                password,
                username: username,
            })

            message.success('Berhasil menambahkan Admin')
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

    useEffect(() => {
        reset()
    }, [isOpen])

    const reset = () => {
        setUsername("")
        setPassword("")
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>Buat Translator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form
                name="basic"
                layout={'vertical'}
                onFinish={onSubmit}
                autoComplete="off"
            >
                {/* Admin username */}
                <Form.Item
                    label="Nama admin"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Mohon memasukkan nama admin!',
                        },
                    ]}
                >
                    <Input value={username} onChange={(e) => { setUsername(e.target.value) }} />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    label="Kata sandi"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Mohon memasukkan kata sandi admin!',
                        },
                    ]}
                >
                    <Input value={password} onChange={(e) => { setPassword(e.target.value) }} type='password' />
                </Form.Item>
                <Form.Item>
                    <div className={"d-flex flex-row justify-content-end"}>
                        <Button size="sm" variant="outline-danger" onClick={() => handleClose()} style={{ marginRight: '5px' }}>
                            Batal
                        </Button>
                        <Button size="sm" variant="primary" type="submit">
                            Buat
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal.Body>
    </Modal>
}