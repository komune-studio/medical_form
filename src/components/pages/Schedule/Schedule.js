import { useEffect, useState } from 'react';
import moment from 'moment';
import { Button as AntButton, Flex, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Datetime from 'react-datetime';
import Palette from 'utils/Palette';
import Iconify from 'components/reusable/Iconify';
import swal from 'components/reusable/CustomSweetAlert';
import UserModel from 'models/UserModel';
import TournamentModel from 'models/TournamentModel';
import ScheduleModel from 'models/ScheduleModel';
import Avatar from 'assets/img/brand/avatar.png';

// Data-data sementara (tunggu API)
const SCHEDULES = [
	{ backgroundColor: '#D1E7DD', color: '#0F5132' },
	{ backgroundColor: Palette.LIGHT_GRAY, color: Palette.WHITE_GRAY },
	{ backgroundColor: '#FFF3CD', color: '#664D03' },
	{ backgroundColor: '#F8D7DA', color: '#842029' },
	{ backgroundColor: '#D1E7DD', color: '#0F5132' },
	{ backgroundColor: Palette.LIGHT_GRAY, color: Palette.WHITE_GRAY },
];

const OPERATIONAL_HOURS = [
	'08:00',
	'09.00',
	'10.00',
	'11.00',
	'12.00',
	'13.00',
	'14.00',
	'15.00',
	'16.00',
	'17.00',
	'18.00',
	'19.00',
	'20.00',
	'21.00',
	'22.00',
];

const DATE_HEADER_HEIGHT = 25;

const SKILL_LEVEL = ['BEGINNER', 'ADVANCED', 'PRO', 'MAINTENANCE', 'EVENT'];

export default function Schedule() {
	const [modalSetting, setModalSetting] = useState({
		isOpen: false,
		isCreateMode: true,
	});

	const getThisWeekSchedule = async () => {
		try {
			let result = await ScheduleModel.getAllThisWeek();
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getThisWeekSchedule();
	}, []);

	return (
		<>
			<div
				className="container-fluid"
				style={{ color: '#FFF', fontFamily: 'Helixa', flex: 1 }}
			>
				{/* Schedule title & pagination */}
				<div className="d-flex justify-content-between align-items-center">
					{/* Schedule title */}
					<div style={{ fontSize: 20, fontWeight: 'bold' }}>
						Schedule
					</div>
					{/* Schedule pagination & create button */}
					<div
						className="d-flex font-weight-bold align-items-center justify-content-center"
						style={{ fontSize: 12, gap: 8 }}
					>
						<div>
							<AntButton
								type={'primary'}
								onClick={() =>
									setModalSetting({
										isOpen: true,
										isCreateMode: true,
									})
								}
							>
								Buat Sesi
							</AntButton>
						</div>
						<div
							className="d-flex align-items-center justify-content-center"
							style={{
								gap: 10,
								padding: '6px 8px 6px 12px',
								backgroundColor: Palette.LIGHT_GRAY,
								borderRadius: 4,
							}}
						>
							<div>Jan 2024</div>
							<div
								className="border"
								style={{ borderRadius: 4, padding: '2px 8px' }}
							>
								W5
							</div>
						</div>
						<div
							className="d-flex align-items-center justify-content-center"
							style={{ gap: 12 }}
						>
							<button className="btn p-0">
								<Iconify
									icon="mdi:chevron-left"
									size={16}
									color="#FFF"
								/>
							</button>
							<button className="btn p-0">
								<Iconify
									icon="mdi:chevron-right"
									size={16}
									color="#FFF"
								/>
							</button>
						</div>
					</div>
				</div>
				{/* Schedule table */}
				<div className="d-flex" style={{ marginTop: 34, flex: 1 }}>
					{/* Table y-axis header */}
					<div className="d-flex flex-column">
						<div
							style={{
								height: DATE_HEADER_HEIGHT,
								marginBottom: 8,
							}}
						></div>
						{/* Loop for getting the y-axis of the table (every hour in a day) */}
						{OPERATIONAL_HOURS.map((text, index) => (
							<div
								className="d-flex justify-content-center align-items-start font-weight-bold"
								style={{
									flex: 1,
									padding: '2px 4px',
									marginRight: 12,
									fontSize: 12,
									fontWeight: 700,
								}}
								key={index}
							>
								{text}
							</div>
						))}
					</div>
					{/* Loop through all dates in current section */}
					{getPastWeekDates().map((date, index) => (
						<div
							className="d-flex flex-column"
							style={{
								flex: 1,
							}}
							key={index}
						>
							{/* Table x-axis header || current date */}
							<div
								className="d-flex align-items-center justify-content-center"
								style={{
									fontSize: 14,
									fontWeight: 700,
									color: Palette.INACTIVE_GRAY,
									height: DATE_HEADER_HEIGHT,
									marginBottom: 8,
								}}
							>
								{moment(date).format('dddd, DD MMMM YYYY')}
							</div>
							{/* Loop for getting schedule data from each hour in current date  */}
							{OPERATIONAL_HOURS.map((text, index) => (
								<div
									className="d-flex flex-column"
									style={{
										gap: 8,
										padding: '4px 4px',
										border: '1px solid #404040',
										flex: 1,
									}}
									key={index}
								>
									{/* Loop for getting schedule data in current hour */}
									{SCHEDULES.map((item, index) => (
										<ScheduleItem
											key={index}
											backgroundColor={
												item.backgroundColor
											}
											color={item.color}
											setModalSetting={setModalSetting}
										/>
									))}
								</div>
							))}
						</div>
					))}
				</div>
			</div>
			<ScheduleActionModal
				isOpen={modalSetting.isOpen}
				isCreateMode={modalSetting.isCreateMode}
				scheduleId={modalSetting?.scheduleId || null}
				handleClose={() =>
					setModalSetting({ ...modalSetting, isOpen: false })
				}
			/>
		</>
	);
}

function ScheduleItem(props) {
	return (
		<div
			className="d-flex justify-content-between align-items-center"
			style={{
				padding: '4px 8px',
				backgroundColor: props.backgroundColor,
				color: props.color,
				borderRadius: 24,
				fontSize: 10,
				cursor: 'pointer',
			}}
			onClick={() =>
				props.setModalSetting({
					isOpen: true,
					isCreateMode: false,
					scheduleId: 1,
				})
			}
		>
			<div className="font-weight-bold">Beginner</div>
			<div>4 slot(s) available</div>
		</div>
	);
}

function ScheduleActionModal({
	isOpen,
	isCreateMode,
	scheduleId,
	handleClose,
}) {
	const [createFormData, setCreateFormData] = useState({
		start_time: new Date(),
		duration_minutes: 10,
		skill_level: '',
	});
	const [registerFormData, setRegisterFormData] = useState('');
	const [registeredDriversList, setRegisteredDriversList] = useState([]);
	const [driverSearchResult, setDriverSearchResult] = useState(null);

	const resetAllForms = () => {
		setCreateFormData({
			start_time: new Date(),
			duration_minutes: 10,
			skill_level: '',
		});
		setDriverSearchResult(null);
		setRegisterFormData('');
		setRegisteredDriversList([]);
	};

	const resetCreateForm = () => {
		setCreateFormData({
			start_time: new Date(),
			duration_minutes: 10,
			skill_level: '',
		});
	};

	const resetRegisterForm = () => {
		setRegisterFormData('');
		setDriverSearchResult(null);
	};

	const handleRegisterFormInputChange = async (value) => {
		try {
			setRegisterFormData(value);

			let getUserData;
			clearTimeout(getUserData);

			getUserData = setTimeout(async () => {
				if (value.length > 100) {
					let result = await UserModel.processUserQR({
						token: value,
					});
					setRegisteredDriversList([
						...registeredDriversList,
						result,
					]);
					setTimeout(() => setRegisterFormData(''), 300);
				}
			}, 300);
		} catch (e) {
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Invalid credential, please try again.',
			});
		}
	};

	const handleDriverSearch = async () => {
		try {
			let result = await UserModel.getByUsername(registerFormData);
			setDriverSearchResult(result);
		} catch (e) {
			if (e?.code === 'USER_NOT_FOUND') {
				setDriverSearchResult({ apex_nickname: registerFormData });
				return;
			}

			console.log(e);
			swal.fireError({
				title: 'Error',
				text: e.error_message
					? e.error_message
					: 'Unable to process search request!',
			});
		}
	};

	const handleSubmit = () => {
		if (isCreateMode) {
			handleCreateFormSubmit();
			return;
		}

		handleRegisterFormSubmit();
	};

	const handleCreateFormSubmit = async () => {
		try {
			let result = await ScheduleModel.create({
				...createFormData,
				duration_minutes: parseInt(createFormData.duration_minutes),
			});
			swal.fire({
				text: 'Sesi Balapan berhasil dibuat!',
				icon: 'success',
			});
			resetCreateForm();
		} catch (e) {
			console.log(e);
			swal.fireError({
				title: `Error`,
				text: e.error_message
					? e.error_message
					: 'Failed to create new session, please try again.',
			});
		}
	};

	const handleRegisterFormSubmit = async () => {
		registeredDriversList.forEach(async (driver) => {
			try {
				let result = await ScheduleModel.registerDriver({
					schedule_slot_id: scheduleId,
					apex_nickname: driver.apex_nickname,
					user_id: driver?.id || null,
				});
			} catch (e) {
				console.log(e);
			}
		});

		swal.fire({
			text: 'Driver berhasil ditambahkan!',
			icon: 'success',
		});
		setRegisteredDriversList([]);
		resetRegisterForm();
	};

	return (
		<Modal size={'lg'} show={isOpen} backdrop="static" keyboard={false}>
			<Modal.Header>
				<div className={'d-flex w-100 justify-content-between'}>
					<Modal.Title>
						{isCreateMode ? 'Buat Sesi' : `Daftarkan Driver`}
					</Modal.Title>
					<AntButton
						onClick={() => {
							resetAllForms();
							handleClose();
						}}
						style={{
							position: 'relative',
							top: -5,
							color: '#fff',
							fontWeight: 800,
						}}
						type="link"
						shape="circle"
						icon={<CloseOutlined />}
					/>
				</div>
			</Modal.Header>
			<Modal.Body>
				<Flex vertical gap={12}>
					{isCreateMode ? (
						// Create new race schedule form
						<>
							<Flex vertical gap={8}>
								<Form.Label>Waktu Mulai</Form.Label>
								<Datetime
									value={createFormData.start_time}
									onChange={(value) =>
										setCreateFormData({
											...createFormData,
											start_time: value.toDate(),
										})
									}
								/>
							</Flex>
							<Flex vertical gap={8}>
								<Form.Label>Durasi (menit)</Form.Label>
								<Form.Control
									placeholder={10}
									type="number"
									value={createFormData.duration_minutes}
									onChange={(e) =>
										setCreateFormData({
											...createFormData,
											duration_minutes: e.target.value,
										})
									}
								/>
							</Flex>
							<Flex vertical gap={8}>
								<Form.Label>Level Skill</Form.Label>
								<Form.Select
									className="form-control"
									value={createFormData.skill_level}
									onChange={(e) =>
										setCreateFormData({
											...createFormData,
											skill_level: e.target.value,
										})
									}
								>
									<option selected hidden></option>
									{SKILL_LEVEL.map((skill) => (
										<option key={skill} value={skill}>
											{skill}
										</option>
									))}
								</Form.Select>
							</Flex>
						</>
					) : (
						// Register Driver in Race Session Form
						<>
							{/* Driver Regisration Form - Action Buttons */}
							<Flex vertical gap={8}>
								<Form.Label style={{ fontWeight: 700 }}>
									SEARCH
								</Form.Label>
								<Flex gap={8}>
									<Form.Control
										value={registerFormData}
										placeholder={
											'Scan QR atau masukkan username user'
										}
										onChange={(e) =>
											handleRegisterFormInputChange(
												e.target.value
											)
										}
									/>
									<AntButton
										type={'primary'}
										onClick={handleDriverSearch}
									>
										Cari Driver
									</AntButton>
									<AntButton
										type={'primary'}
										disabled={!driverSearchResult}
										onClick={() => {
											if (!driverSearchResult) {
												swal.fireError({
													title: 'Error',
													text: 'Search value is empty!',
												});
											}

											setRegisteredDriversList([
												...registeredDriversList,
												driverSearchResult,
											]);
											resetRegisterForm();
										}}
									>
										Tambah Driver
									</AntButton>
								</Flex>
							</Flex>

							{/* Search Driver Result */}
							{driverSearchResult ? (
								<Flex
									style={{
										color: '#FFF',
										backgroundColor: '#FFFFFF14',
										padding: '8px 12px',
										borderRadius: 8,
									}}
									justify="space-between"
									align="center"
								>
									<Flex
										gap={8}
										justify="center"
										align="center"
									>
										<div>
											<img
												src={
													driverSearchResult?.avatar_url ||
													Avatar
												}
												style={{
													borderRadius: 99,
													height: 48,
													width: 48,
												}}
											/>
										</div>
										<Flex vertical>
											<div style={{ fontWeight: 700 }}>
												{
													driverSearchResult.apex_nickname
												}
											</div>
											<div
												style={{
													fontSize: 12,
													color: Palette.INACTIVE_GRAY,
												}}
											>
												{driverSearchResult?.email ||
													'E-mail tidak tersedia'}
											</div>
										</Flex>
									</Flex>
									<Flex>
										<div style={{ fontWeight: 700 }}>
											// TODO
										</div>
									</Flex>
								</Flex>
							) : null}

							{/* Registered Drivers List */}
							{registeredDriversList.length > 0 ? (
								<Flex vertical gap={8}>
									<div
										style={{
											color: '#FFF',
											fontWeight: 700,
											marginTop: 24,
										}}
									>
										REGISTERED DRIVERS
									</div>
									{registeredDriversList.map(
										(driver, index) => (
											<RegisteredDriversListItem
												key={driver.id}
												driver={driver}
												registeredDrivers={
													registeredDriversList
												}
												setRegisteredDrivers={
													setRegisteredDriversList
												}
											/>
										)
									)}
								</Flex>
							) : null}
						</>
					)}
				</Flex>

				{/* Discard & Submit Buttons */}
				<Flex className="mt-5" justify={'end'}>
					<AntButton
						className={'text-white'}
						type={'link'}
						size="sm"
						variant="outline-danger"
						onClick={() => {
							resetAllForms();
							handleClose();
						}}
						style={{ marginRight: '5px' }}
					>
						Batal
					</AntButton>
					<AntButton
						type={'primary'}
						size="sm"
						variant="primary"
						onClick={() => {
							handleSubmit();
						}}
					>
						{isCreateMode ? 'Buat Sesi' : 'Daftarkan Driver'}
					</AntButton>
				</Flex>
			</Modal.Body>
		</Modal>
	);
}

function RegisteredDriversListItem({
	driver,
	registeredDrivers,
	setRegisteredDrivers,
}) {
	return (
		<Flex
			style={{
				color: '#FFF',
				backgroundColor: Palette.BACKGROUND_DARK_GRAY,
				padding: '8px 12px',
				borderRadius: 8,
			}}
			justify={'space-between'}
			align={'center'}
			flex={1}
		>
			<Flex gap={8} justify="center" align="center">
				<div>
					<img
						src={driver?.avatar_url || Avatar}
						style={{ borderRadius: 99, height: 48, width: 48 }}
					/>
				</div>
				<Flex vertical>
					<div style={{ fontWeight: 700 }}>
						{driver.apex_nickname}
					</div>
					<div style={{ font: 10, color: Palette.INACTIVE_GRAY }}>
						{driver?.email || 'E-mail tidak tersedia'}
					</div>
				</Flex>
			</Flex>
			<div
				style={{
					color: Palette.THEME_RED,
					fontSize: 12,
					cursor: 'pointer',
				}}
				onClick={() => {
					setRegisteredDrivers(
						registeredDrivers.filter(
							(item) => item.id !== driver.id
						)
					);
				}}
			>
				Hapus
			</div>
		</Flex>
	);
}

function getPastWeekDates() {
	const result = [];

	for (let i = 0; i < 7; i++) {
		let date = new Date();
		date.setDate(date.getDate() - i);
		result.push(date);
	}

	return result;
}

// NOTE --> ini function buat create tournament, numpang taruh di file ini
const createTournament = async () => {
	try {
		const result = await TournamentModel.create({
			name: 'Pitstop Grand Finale',
			location: 'Mall of Indonesia',
			model: 'SODI SX9',
			start_date: moment().toISOString(),
			end_date: moment().toISOString(),
			detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sapien sapien, elementum et lacinia placerat, lobortis non justo. Maecenas consequat vel ante non mollis.',
			type: 'classic',
		});
		console.log(result);
		swal.fire({ text: 'Data berhasil dibuat', icon: 'success' });
	} catch (e) {
		swal.fireError(e);
	}
};

// NOTE --> ini function buat create tournament detail, numpang taruh di file ini
const createTournamentDetail = async (tournamentId) => {
	try {
		const result = await TournamentModel.createDetail({
			body: {
				username: 'michael',
				time_in_millisecond: 1200,
				laps: 20,
			},
			id: tournamentId,
		});
		console.log(result);
		swal.fire({ text: 'Data detail berhasil dibuat', icon: 'success' });
	} catch (e) {
		swal.fireError(e);
	}
};
