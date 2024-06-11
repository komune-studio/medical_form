import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button as AntButton, Checkbox, Spin } from 'antd';
import Modal from 'react-bootstrap/Modal';
import { Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Helper from 'utils/Helper';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import UserModel from 'models/UserModel';
import OrderModel from 'models/OrderModel';

let contentTimer;

const ORDER_NOMINALS = [50000, 100000, 150000, 200000, 250000, 300000];

export default function OrderCreateV2() {
	const history = useHistory();

	const [scanInputValue, setScanInputValue] = useState('');
	const [scannedUser, setScannedUser] = useState(null);
	const [orderValue, setOrderValue] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentModalContent, setCurrentModalContent] = useState(0);
	const [loading, setLoading] = useState(false);

	const handleNominalClick = (value) => {
		setOrderValue(value);
	};

	const updateScanInputValue = (value) => {
		setScanInputValue(value);

		clearTimeout(contentTimer);

		contentTimer = setTimeout(async () => {
			if (value.length > 100) {
				searchUserByQr(value);
			}
		}, 300);
	};

	const searchUserByUsernameOrEmail = async (value) => {
		setLoading(true);

		try {
			let user = null;
			if (Helper.isValidEmail(value)) {
				user = await UserModel.getByEmail(value);
			} else {
				user = await UserModel.getByUsername(value);
			}

			setScannedUser(user);
			setCurrentModalContent(2);
		} catch (e) {
			console.log(e);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Gagal untuk menemukan user, silahkan coba lagi',
			});
		}
	};

	const searchUserByQr = async (value) => {
		setLoading(true);

		try {
			let user = await UserModel.processUserQR({
				token: value,
			});
			setScannedUser(user);
			setCurrentModalContent(2);
		} catch (e) {
			setLoading(false);
			setCurrentModalContent(1);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Invalid QR, please try again.',
			});
		}

		setScanInputValue('');
	};

	const handleCreateOrder = async () => {
		try {
			await OrderModel.createV2({
				user_id: parseInt(scannedUser.id),
				total_coins: parseInt(orderValue),
			});
			setCurrentModalContent(3);
		} catch (e) {
			setCurrentModalContent(1);
			console.log(e);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Gagal untuk memproses pembayaran, silahkan coba lagi',
			});
		}

		setLoading(false);
	};

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
						<div
							onClick={() => history.push('/orders')}
							style={{ cursor: 'pointer' }}
						>
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
							{/* Barcoin withdrawal form & action button */}
							<div>
								<div>
									<div style={{ fontSize: 14 }}>
										Nominal penarikan Barcoin
									</div>
									<input
										className="order-input"
										value={orderValue}
										onChange={(e) =>
											setOrderValue(e.target.value)
										}
										type="number"
									/>
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
										onClick={() => {
											setIsModalOpen(true);
										}}
										disabled={orderValue <= 0}
									>
										Scan QR atau masukkan username/email
										user
									</AntButton>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
			<CreateOrderModal
				isOpen={isModalOpen}
				handleClose={() => {
					setIsModalOpen(false);
					setScanInputValue('');
				}}
				scanValue={scanInputValue}
				currentModalContent={currentModalContent}
				loading={loading}
				orderValue={orderValue}
				scannedUser={scannedUser}
				updateScanInputValue={(value) => updateScanInputValue(value)}
				searchUserByUsernameOrEmail={searchUserByUsernameOrEmail}
				handleCreateOrder={handleCreateOrder}
				setOrderValue={setOrderValue}
				setCurrentModalContent={setCurrentModalContent}
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

function CreateOrderModal({
	isOpen,
	handleClose,
	scanValue,
	updateScanInputValue,
	currentModalContent,
	setCurrentModalContent,
	loading,
	orderValue,
	setOrderValue,
	scannedUser,
	searchUserByUsernameOrEmail,
	handleCreateOrder,
}) {
	const [checkboxValue, setCheckboxValue] = useState(false);

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
					onClick={() =>
						setCurrentModalContent(currentModalContent + 1)
					}
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
							flex: 1,
						}}
					>
						<Iconify icon={'bi:qr-code'} height={60} width={60} />
					</div>
					<div
						className="d-flex justify-content-center align-items-center"
						style={{ gap: 8, marginTop: 12, flex: 1 }}
					>
						<input
							type="text"
							value={scanValue}
							autoFocus
							onChange={(e) => {
								updateScanInputValue(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									searchUserByUsernameOrEmail(e.target.value);
								}
							}}
							style={{
								backgroundColor: '#2F2F2F',
								flex: 1,
								padding: '8px 12px',
								borderRadius: 4,
								border: 'none',
								color: '#FFF',
								width: '100%',
							}}
						/>
						<AntButton
							type={'primary'}
							onClick={() =>
								searchUserByUsernameOrEmail(scanValue)
							}
						>
							Verifikasi
						</AntButton>
					</div>
				</div>
				<div
					className="text-center"
					style={{ fontWeight: 600, marginTop: 24 }}
				>
					Scan QR code atau masukkan email/username pelanggan untuk
					melakukan penarikan barcoin
				</div>
			</div>
			<div
				className="w-full text-right"
				style={{ marginTop: 24, cursor: 'pointer' }}
			>
				<div
					onClick={() => {
						handleClose();
						setCurrentModalContent(0);
					}}
				>
					Batal
				</div>
			</div>
		</>
	);

	const ThirdContent = () => (
		<>
			<div style={{ textAlign: 'center', fontWeight: 500 }}>
				Apakah anda yakin ingin melakukan penarikan barcoin sebesar{' '}
				<b>{Helper.formatNumber(orderValue)}</b> dari{' '}
				<b>{scannedUser?.username}</b>?
			</div>
			<div className="d-flex justify-content-center mt-4">
				<AntButton
					type="primary"
					onClick={() => {
						setCurrentModalContent(3);
						handleCreateOrder();
					}}
					autoFocus
				>
					Tarik Barcoins
				</AntButton>
			</div>
		</>
	);

	const FourthContent = () => (
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
					{loading ? (
						<Spin size={'large'} />
					) : (
						<div
							className="d-flex justify-content-center align-items-center"
							style={{
								backgroundColor: Palette.BARCODE_ORANGE,
								borderRadius: 999,
								padding: 4,
								height: 44,
								width: 44,
							}}
						>
							<Iconify
								icon={'mdi:check-bold'}
								height={28}
								width={28}
								style={{ color: Palette.BACKGROUND_BLACK }}
							/>
						</div>
					)}
				</div>
			</div>
			<div
				className="d-flex flex-column justify-content-center align-items-center"
				style={{ fontWeight: 600, marginTop: 16 }}
			>
				{loading ? (
					'Memproses Kode QR...'
				) : (
					<>
						<div style={{ fontWeight: 600 }}>
							Penarikan koin berhasil
						</div>
						<div
							style={{
								fontSize: 12,
								color: Palette.INACTIVE_GRAY,
								marginTop: 6,
							}}
						>
							Barcoins sebesar {Helper.formatNumber(orderValue)}{' '}
							ditarik dari {scannedUser.username}
						</div>
					</>
				)}
			</div>
			<div
				className="text-right"
				style={{ marginTop: 32, cursor: 'pointer' }}
			>
				<AntButton
					type="primary"
					style={{ fontSize: 12 }}
					onClick={() => {
						handleClose();
						setCurrentModalContent(0);
						setOrderValue(0);
					}}
					autoFocus
				>
					Tutup
				</AntButton>
			</div>
		</div>
	);

	return (
		<Modal
			size={currentModalContent === 1 ? 'lg' : 'sm'}
			show={isOpen}
			onBackdropClick={'static'}
			keyboard={false}
			style={{ color: '#FFF', fontSize: 14 }}
		>
			<Modal.Body>
				{currentModalContent === 0 && <FirstContent />}
				{currentModalContent === 1 && <SecondContent />}
				{currentModalContent === 2 && <ThirdContent />}
				{currentModalContent === 3 && <FourthContent />}
			</Modal.Body>
		</Modal>
	);
}
