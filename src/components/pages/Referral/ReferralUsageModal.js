import Modal from "react-bootstrap/Modal"
import {
	Button,
	DatePicker,
	message,
	Spin,
	Switch,
	Upload as AntUpload,
	Space,
	Tooltip
} from "antd"
import { Col, Form, Row } from "react-bootstrap"
import React, { useEffect, useState } from "react"
import UserModel from "../../../models/UserModel"
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import PropTypes from "prop-types"
import swal from "../../reusable/CustomSweetAlert"
import moment from "moment/moment"
import UploadModel from "../../../models/UploadModel"
import Referral from "../../../models/ReferralModel"
import CustomTable from "components/reusable/CustomTable"
import Helper from "../../../utils/Helper"
import User from "../../../models/UserModel"

ReferralUsageModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	referralData: PropTypes.object
}

export default function ReferralUsageModal({ isOpen, close, referralData }) {
	const [code, setCode] = useState(null)
	const [type, setType] = useState(null)
	const [value, setValue] = useState(null)
	const [active, setActive] = useState(false)
	const [loadingUpload, setLoadingUpload] = useState(false)
	const [dataSource, setDataSource] = useState([])
	const columns = [
		{
			id: "username",
			label: "Username",
			filter: true
		},
		{
			id: "full_name",
			label: "Full name",
			filter: true
		},
		{
			id: "count",
			label: "Referral Usage",
			filter: true,
			render: (row) => {
				let noun = (row.count == 1? "time" : "times")
				return row.count + " " + noun
			}
		}
		/* {
            id: 'active', label: 'Status Paket', filter: false, width: '12%',
            render: (row => {
                return <Switch disabled={true} defaultChecked={row.active} checked={row.active} onChange={() => {
                    changeActive(row.id, row.active)
                }}/>
            })
        }, */
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
		/* if (isNewRecord) {
            reset()
        } else {
            initForm()
        } */
        if(isOpen) initForm()
	}, [isOpen])

	const reset = () => {
		setType("")
		setCode("")
		setValue("")
	}

	return (
		<Modal show={isOpen} backdrop="static" keyboard={false} onExit={handleClose} size="lg">
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
