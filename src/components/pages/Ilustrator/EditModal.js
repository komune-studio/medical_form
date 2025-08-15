import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import { message, Flex } from "antd";
import { useEffect, useMemo, useState } from "react";
import AdminModel from "../../../models/AdminModel";

import PropTypes from "prop-types";
import Iconify from "../../reusable/Iconify";
import swal from "../../reusable/CustomSweetAlert";
import LoadingButton from "../../reusable/LoadingButton";
EditModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    admin_data: PropTypes.object
};


export default function EditModal({ isOpen, itemId, close, admin_data }) {

    const [username, setUsername] = useState("")
    console.log('isi admin', admin_data)
    const onSubmit = async (event) => {
        event.preventDefault();
        if (!username) {
            message.error({ text: "Name Wajib diisi", })
            return
        }
        
        try {
            // Still using Admin Model, need to be changed later
            let result2 = await AdminModel.edit(admin_data?.id, {
                username: username,
            })
            if (result2?.success) {
                message.success('Berhasil menyimpan')
                handleClose(true)
            }else{
                message.error('Gagal menyimpan')
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
    useEffect(() => {
        initializeData()
    }, [])

    const initializeData = async () => {
        setUsername(admin_data?.username)
    }

    const reset = () => {
        setUsername("")
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>Perbarui Nama</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Form onSubmit={onSubmit}>
            <Flex className="mb-3" vertical gap={8}>
                <Form.Label style={{ fontSize: "0.8em" }}>Nama</Form.Label>
                <Form.Control
                    value={username ? username : ''}
                    onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Nama admin" style={{color: '#000000'}}/>
            </Flex>
            {/* <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Active</Form.Label>
                <Form.Check // prettier-ignore
                type="switch"
                id="custom-switch"
                label="Check this switch"
                /> */}
                {/* <Form.Check type='switch' onChange={(e) => setActive(!active)} checked={active}/> */}
            {/* </Form.Group> */}
            {/* <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Phone Number</Form.Label>
                <Form.Control
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} type="text" placeholder="Phone Number" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Domain</Form.Label>
                <Form.Control
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)} type="text" placeholder="Domain" />
            </Form.Group> */}

            <div className={"d-flex flex-row justify-content-end"}>
                <Button size="sm" variant="outline-danger" onClick={() => handleClose(false)}>
                    Batal
                </Button>
                <Button size="sm" variant="primary" type="submit">
                    Perbarui
                </Button>
            </div>
        </Form>
        </Modal.Body>
    </Modal>
}
