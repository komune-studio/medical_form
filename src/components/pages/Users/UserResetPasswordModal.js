import Modal from "react-bootstrap/Modal";
import {Button, Form} from "react-bootstrap";
import LoadingButton from "../../reusable/LoadingButton";
import {useState} from "react";
import {message} from "antd";
import Admin from "../../../models/AdminModel";
import swal from "../../reusable/CustomSweetAlert";
import User from "../../../models/UserModel";
import PropTypes from "prop-types";
import EditAdminModal from "../Admins/EditAdminModal";

UserResetPasswordModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    userData: PropTypes.object
};
export default function UserResetPasswordModal({isOpen, onClose, userData}) {
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
            let result2 = await User.edit_password(userData?.id, body)
            if (result2?.id) {
                message.success('Berhasil merubah password User')
                onClose(true)
            } else {
                message.error('Gagal menyimpan User')
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
            <Modal
                show={isOpen}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Reset Password User</Modal.Title>
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
                        <Button size="sm" onClick={() => onClose(false)} variant="outlined">
                            Cancel
                        </Button>
                        <LoadingButton size="sm" onClick={onSubmit} variant="primary">
                            Update
                        </LoadingButton>
                    </div>
                </Modal.Body>
            </Modal>

        </>
    )

}