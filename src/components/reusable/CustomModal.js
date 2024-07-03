import Modal from 'react-bootstrap/Modal';
import {Button} from "antd";
import Iconify from "./Iconify";
import React, {useEffect, useState} from "react";

export default function UserFormModal({onClose, title, children, onSubmit, isOpen}) {
    const [isOpenTemp, setIsOpenTemp] = useState(false)

    useEffect(() => {
        setIsOpenTemp(isOpen)
    }, [isOpen]);

    return <Modal
        show={isOpenTemp}
        backdrop="static"
        keyboard={isOpenTemp}
    >
        <Modal.Header>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{title}</Modal.Title>
                <Button onClick={() => {
                    onClose()
                    setIsOpenTemp(false)
                }} style={{position: 'relative', top: -5, color: '#fff', fontWeight: 800}} type="link" shape="circle" />
            </div>
        </Modal.Header>
        <Modal.Body>
            {children}
            <div className={"d-flex flex-row justify-content-end"}>
                <Button onClick={()=> {
                    onClose()
                    setIsOpenTemp(false)
                }} className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                        style={{marginRight: '5px'}}>
                    Batal
                </Button>
                <Button type={'primary'} size="sm" variant="primary" onClick={() => {
                    onSubmit()
                }}>
                    Simpan
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}