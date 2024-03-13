import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import FileUpload from "../../reusable/FileUpload";
import Swal from "sweetalert2";
import { Upload, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import UploadModel from "../../../models/UploadModel";
import Admin from "../../../models/AdminModel";

import PropTypes from "prop-types";
import Iconify from "../../reusable/Iconify";
import swal from "../../reusable/CustomSweetAlert";
import LoadingButton from "../../reusable/LoadingButton";


export default function EditPasswordAdminPage({ isOpen, itemId, close, admin_data }) {

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
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
            let result2 = await Admin.edit_password(admin_data?.id, body)
            if (result2?.id) {
                message.success('Berhasil merubah password Admin')
                handleClose(true)
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

    const handleClose = (refresh) => {
        close(refresh)
    }


    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>Edit Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>New Password</Form.Label>
                <Form.Control
                    autoComplete={"new-password"}
                    onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Confirm Password</Form.Label>
                <Form.Control
                    autoComplete={"confirm-new-password"}
                    onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Password" />
            </Form.Group>

            <div className={"d-flex flex-row justify-content-end"}>
                <Button size="sm" onClick={() => handleClose(false)} variant="outlined">
                    Cancel
                </Button>
                <LoadingButton size="sm" onClick={onSubmit} variant="primary">
                    Update
                </LoadingButton>
            </div>
        </Modal.Body>
    </Modal>
}
