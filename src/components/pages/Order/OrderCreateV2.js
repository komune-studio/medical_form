import Modal from 'react-bootstrap/Modal';
import { Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import { CloseOutlined } from '@ant-design/icons';
import Palette from '../../../utils/Palette';
import Helper from 'utils/Helper';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import React, { useEffect, useState } from 'react';
import { Button as AntButton, Checkbox } from 'antd';
import OrderModel from 'models/OrderModel';
import UserModel from 'models/UserModel';
import OrderCreateModel from 'models/OrderCreateModel';
import { useHistory } from 'react-router-dom';

let contentTimer;

const ORDER_NOMINALS = [50000, 100000, 150000, 200000, 250000, 300000];

export default function OrderCreateV2() {
	const history = useHistory();

	let [quantity, setQuantity] = useState([0, 0, 0]);
	const [scanValue, setScanValue] = useState('');
	const [scannedUser, setScannedUser] = useState(null);
	const [orderItems, setOrderItems] = useState([]);
	const [total, setTotal] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleNominalClick = (value) => {
		setTotal(value);
	};

	const updateScanValue = (value) => {
		setScanValue(value);

		clearTimeout(contentTimer);

		contentTimer = setTimeout(async () => {
			if (value.length > 100) {
				findUserByQR(value);
			}
		}, 300);
	};

	const findUserByQR = async (value) => {
		try {
			let qr = await UserModel.processUserQR({
				token: value,
			});
			console.log(qr);
			setScannedUser(qr);
			setIsModalOpen(false);
		} catch (e) {
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Invalid QR, please try again.',
			});
		}

		resetValue();
	};

	const resetValue = () => {
		setScanValue('');
	};

	const onSubmit = async () => {
		try {
			let details = [];
			for (let qIndex in quantity) {
				let q = quantity[qIndex];
				if (q > 0) {
					details.push({ id: orderItems[qIndex].id, quantity: q });
				}
			}
			let result = await OrderModel.create({
				user_id: scannedUser.id,
				details,
			});
			swal.fire({
				title: `Success`,
				icon: 'success',
				text: 'QR payment success!',
			});
			history.push('/orders');
		} catch (e) {
			console.log('QR PAYMENT FAILED', e);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Invalid request, please try again.',
			});
		}
	};

	useEffect(() => {
		let sum = 0;

		if (orderItems.length > 0) {
			quantity.forEach((num, index) => {
				sum += orderItems[index].price * num;
			});
		}

		setTotal(sum);
	}, [quantity, orderItems]);

	return (
		<>
			<Container fluid style={{ color: 'white' }}>
				<Row>
					{/* Navigation back button & page title */}
					<Col
						md={12}
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
						}}
					>
						<div onClick={() => history.push('/orders')}>
							<Iconify
								icon={'material-symbols:arrow-back'}
							></Iconify>
						</div>
						<div style={{ flex: 1 }}>&nbsp;Pembayaran Baru</div>
					</Col>

					{/* Page content */}
					<Col>
						<div
							className="d-flex flex-column"
							style={{ marginTop: 48, width: '60%', gap: 48 }}
						>
							{/* Scanned user information */}
							{scannedUser && (
								<div>
									<div>
										<div>Username / Email Pembayar</div>
										<div
											className="d-flex justify-content-between align-items-center"
											style={{ gap: 8, marginTop: 8 }}
										>
											<div
												style={{
													backgroundColor: '#2F2F2F',
													flex: 1,
													padding: '8px 12px',
													borderRadius: 4,
												}}
											>
												{scannedUser?.username}
											</div>
											<div>
												<AntButton type={'primary'}>
													Verifikasi
												</AntButton>
											</div>
										</div>
									</div>
									<div
										className="d-flex align-items-center"
										style={{
											marginTop: 12,
											backgroundColor: '#2F2F2F',
											borderRadius: 6,
											padding: 12,
											gap: 12,
										}}
									>
										<div>
											<img
												src={scannedUser.avatar_url}
												height={32}
												width={32}
												style={{ borderRadius: 999 }}
											/>
										</div>
										<div>
											<div
												style={{
													fontWeight: 700,
													fontSize: 14,
												}}
											>
												{scannedUser.username}
											</div>
											<div
												style={{
													color: Palette.INACTIVE_GRAY,
													fontSize: 12,
												}}
											>
												{scannedUser.email}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Barcoin withdrawal form & action button */}
							<div>
								<div>
									<div style={{ fontSize: 14 }}>
										Nominal penarikan Barcoin
									</div>
									<div
										style={{
											marginTop: 8,
											borderBottom: '1px solid #616161',
											fontSize: 16,
										}}
									>
										{Helper.formatNumber(total)}
									</div>
								</div>
								<div style={{ marginTop: 24 }}>
									<div
										style={{
											display: 'grid',
											columnGap: 8,
											rowGap: 12,
											gridTemplateColumns: '1fr 1fr 1fr',
										}}
									>
										{ORDER_NOMINALS.map((value, index) => (
											<OrderNominalContainer
												key={index}
												value={value}
												onClick={() =>
													handleNominalClick(value)
												}
											/>
										))}
									</div>
								</div>
								<div style={{ marginTop: 48 }}>
									<AntButton
										type={'primary'}
										style={{ width: '100%' }}
										onClick={() => setIsModalOpen(true)}
									>
										ScanQR
									</AntButton>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
			<CreateOrderModal
				isOpen={isModalOpen}
				handleClose={() => setIsModalOpen(false)}
				scanValue={scanValue}
				updateScanValue={(value) => updateScanValue(value)}
			/>
		</>
	);
}

function OrderNominalContainer({ value, onClick }) {
	return (
		<AntButton
			style={{
				flex: 1,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 4,
				paddingBottom: 4,
				borderRadius: 6,
				border: `1px solid ${Palette.WHITE_GRAY}`,
				backgroundColor: 'transparent',
				color: '#FFF',
			}}
			onClick={onClick}
		>
			{Helper.formatNumber(value)}
		</AntButton>
	);
}

function CreateOrderModal(props) {
	const { isOpen, handleClose, scanValue, updateScanValue } = props;
	const [checkboxValue, setCheckboxValue] = useState(false);
	const [currentContent, setCurrentContent] = useState(0);

	const FirstContent = () => (
		<>
			<div style={{ fontWeight: 600 }}>
				Silahkan minta pelanggan untuk menunjukkan QR code dari aplikasi
				Barcode
			</div>
			<div
				className="d-flex w-100 justify-content-between align-items-center"
				style={{ marginTop: 24 }}
			>
				<div
					className="d-flex align-items-center"
					style={{ gap: 6, color: '#C2C2C2', fontSize: 12 }}
				>
					<div>
						<Checkbox
							checked={checkboxValue}
							onChange={() => setCheckboxValue(!checkboxValue)}
						/>
					</div>
					<div>Jangan tampilkan pesan ini lagi</div>
				</div>
				<AntButton
					type={'primary'}
					onClick={() => setCurrentContent(currentContent + 1)}
				>
					Oke
				</AntButton>
			</div>
		</>
	);

	const SecondContent = () => (
		<>
			<div>
				<div
					className="d-flex flex-column align-items-center justify-content-center"
					style={{ gap: 8 }}
				>
					<div
						style={{
							padding: 20,
							color: '#FFFFFF14',
							backgroundColor: '#FFFFFF14',
							borderRadius: 16,
							width: 'fit-content',
						}}
					>
						<Iconify icon={'bi:qr-code'} height={60} width={60} />
					</div>
					<div>
						<input
							type="text"
							value={scanValue}
							autoFocus
							onChange={(e) => {
								updateScanValue(e.target.value);
							}}
							style={{
								backgroundColor: 'transparent',
								borderWidth: 0,
								borderBottom: '1px solid #FFF',
								color: '#FFF',
							}}
						/>
					</div>
				</div>
				<div
					className="text-center"
					style={{ fontWeight: 600, marginTop: 24 }}
				>
					Scan QR code pelanggan untuk melakukan penarikan koin
				</div>
			</div>
			<div
				className="w-full text-right"
				style={{ marginTop: 24, cursor: 'pointer' }}
			>
				<div
					onClick={() => {
						handleClose();
						setCurrentContent(0);
					}}
				>
					Batal
				</div>
			</div>
		</>
	);

	return (
		<Modal
			size={'sm'}
			show={isOpen}
			onBackdropClick={'static'}
			keyboard={false}
			style={{ color: '#FFF', fontSize: 14 }}
		>
			<Modal.Body>
				{currentContent === 0 && <FirstContent />}
				{currentContent === 1 && <SecondContent />}
			</Modal.Body>
		</Modal>
	);
}
