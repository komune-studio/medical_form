import Modal from "react-bootstrap/Modal"
import {Button} from "antd"
import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import CustomTable from "components/reusable/CustomTable"
import User from "../../../models/UserModel"
import dayjs from "dayjs";

ReferralUsageModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    referralData: PropTypes.object
}

export default function ReferralUsageModal({isOpen, close, referralData}) {

    const [dataSource, setDataSource] = useState([])
    const columns = [
        {
            id: "username",
            label: "Username",
            filter: true
        },
        {
            id: "count",
            label: "Used Times",
            filter: true,
            render: (row) => {
                const topUp = row?.topup_history
                if (Array.isArray(topUp)) {
                    return topUp?.length > 0 ? dayjs(topUp[0].created_at).format('DD MMMM YYYY HH:mm') : '-'
                }
                return '-'
            }
        }
    ]

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initForm = async () => {
        let tmp = await User.getByReferralId(referralData.id)
        setDataSource(tmp)
        console.log(tmp)
    }

    useEffect(() => {
        if (isOpen) initForm()
    }, [isOpen])

    return (
        <Modal
            show={isOpen}
            backdrop="static"
            keyboard={false}
            onExit={handleClose}
            size="lg"
        >
            <Modal.Header>
                <Modal.Title>Referral {referralData?.code}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CustomTable
                    showFilter={true}
                    pagination={true}
                    searchText={""}
                    data={dataSource}
                    columns={columns}
                />
                <div className={"d-flex flex-row justify-content-end"}>
                    <Button
                        className={"text-white"}
                        type={"link"}
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleClose()}
                        //style={{ marginRight: "5px" }}
                    >
                        Close
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    )
}
