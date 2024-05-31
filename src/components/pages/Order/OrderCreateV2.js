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


let contentTimer;

const ORDER_NOMINALS = [50000, 100000, 150000, 200000, 250000, 300000];

export default function OrderCreateV2() {
	const history = useHistory();

	const [scanValue, setScanValue] = useState('');
	const [scannedUser, setScannedUser] = useState(null);
	const [total, setTotal] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentModalContent, setCurrentModalContent] = useState(0);
	const [loading, setLoading] = useState(false);

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
		setLoading(true);
		setCurrentModalContent(2);

		try {
			let qr = await UserModel.processUserQR({
				token: value,
			});
			setScannedUser(qr);
		} catch (e) {
			setCurrentModalContent(1);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Invalid QR, please try again.',
			});
		}

		setScanValue('');
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
										<div style={{ fontSize: 14 }}>
											Username / Email Pembayar
										</div>
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
										onClick={() => {
											setIsModalOpen(true);
										}}
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
				currentModalContent={currentModalContent}
				setCurrentModalContent={setCurrentModalContent}
				loading={loading}
				total={total}
				scannedUser={scannedUser}
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
	const [checkboxValue, setCheckboxValue] = useState(false);

	const {
		isOpen,
		handleClose,
		scanValue,
		updateScanValue,
		currentModalContent,
		setCurrentModalContent,
		loading,
		total,
		scannedUser,
	} = props;

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
						setCurrentModalContent(0);
					}}
				>
					Batal
				</div>
			</div>
		</>
	);

	const ThirdContent = () => (
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
							Barcoins sebesar {Helper.formatNumber(total)}{' '}
							ditarik dari {scannedUser.username}
						</div>
					</>
				)}
			</div>
			<div
				className="text-right"
				style={{ marginTop: 32, cursor: 'pointer' }}
			>
				<div
					style={{ fontSize: 12 }}
					onClick={() => {
						handleClose();
						setCurrentModalContent(0);
					}}
				>
					Tutup
				</div>
			</div>
		</div>
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
				{currentModalContent === 0 && <FirstContent />}
				{currentModalContent === 1 && <SecondContent />}
				{currentModalContent === 2 && <ThirdContent />}
			</Modal.Body>
		</Modal>
	);
}
