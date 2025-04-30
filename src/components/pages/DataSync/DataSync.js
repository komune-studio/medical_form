import { Card, Container, Row, CardBody, Col } from "reactstrap"
import {
	Table,
	Image,
	Space,
	Button as AntButton,
	Tooltip,
	Modal,
	message,
	Input,
	Upload as AntUpload,
	Spin
} from "antd"
import { CloseOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons"
import Palette from "utils/Palette"
import { useState } from "react"
import Upload from "models/UploadModel"
const DataSync = () => {
	const [fileToUpload, setFileToUpload] = useState(null)
	const [uploading, setUploading] = useState(false)

	const onUpload = async () => {
		console.log("Masuk", fileToUpload)
		setUploading(true)
		try {
			let res
			if (!fileToUpload) throw "File kosong"
			res = await Upload.uploadApex(fileToUpload.file.originFileObj);
			console.log(res)
			setFileToUpload(null)
			// onOpenMessage({ type: 'success', message: 'Upload success!' });
			// onClose(true);
		} catch (error) {
			// onOpenMessage({ type: 'error', message: error.error_message ?? error });
			console.log(error)
		}
		setUploading(false)
	}

	return (
		<>
			<Container fluid style={{ minHeight: "90vh" }}>
				<Card
					style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
					className="card-stats mb-4 mb-xl-0"
				>
					<CardBody>
						<Row>
							<Col className="mb-3" md={6}>
								<div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
									Data Sync
								</div>
							</Col>
							{/* <Col className="mb-3 text-right" md={6}>
								<AntButton
									 onClick={() => {
                setIsCreateAdminOpen(true)
            }} 
									size={"middle"}
									type={"primary"}
								>
									Upload Apex Data
								</AntButton>
							</Col> */}
						</Row>
						<Col className="mb-3 text-center w-full" sm={12}>
							<AntUpload
								rootClassName={"upload-background"}
								name={fileToUpload?.file?.name}
								listType="picture-card"
								fileList={[]}
								className="avatar-uploader"
								customRequest={({ onSuccess }) => setTimeout(() => { onSuccess("ok", null); }, 0) }
								showUploadList={false}
								onChange={(file) => {
									console.log(file)
									setFileToUpload(file)
									// onUpload(file)
								}}
							>
								{fileToUpload ? (
									<>
										{!uploading ? (
											<div style={{ color: "white" }}>
												{fileToUpload?.file?.name}
											</div>
										) : (
											<Spin style={{ zIndex: 100000 }} size="large" />
										)}
									</>
								) : (
									<button
										style={{
											border: 0,
											background: "none"
										}}
										type="button"
									>
										{uploading ? (
											<Spin style={{ zIndex: 100000 }} size="large" />
										) : (
											<PlusOutlined />
										)}
										<div
											style={{
												marginTop: 8
											}}
										>
											Upload
										</div>
									</button>
								)}
							</AntUpload>
						</Col>
						{fileToUpload && (
							<Row>
								<Col className="mb-3" md={6}>
									{/* <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
									Data Sync
								</div> */}
								</Col>
								<Col className="mb-3 text-right" md={6}>
									<AntButton
										onClick={() => {
											console.log("klik")
											onUpload()
										}}
										size={"middle"}
										type={"primary"}
									>
										Upload Apex Data
									</AntButton>
								</Col>
							</Row>
						)}
					</CardBody>
				</Card>
			</Container>
		</>
	)
}

export default DataSync
