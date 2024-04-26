import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { CloseOutlined } from '@ant-design/icons';
import { Flex, Button as AntButton, Spin } from 'antd';
import moment from 'moment';
import Iconify from 'components/reusable/Iconify';
import swal from 'components/reusable/CustomSweetAlert';
import TournamentModel from 'models/TournamentModel';
import Palette from 'utils/Palette';
import Helper from 'utils/Helper';
import CustomTable from 'components/reusable/CustomTable';

export default function TournamentDetail() {
	const [detail, setDetail] = useState({});
	const [loading, setLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const history = useHistory();
	const { id } = useParams();

	const getTournamentDetail = async () => {
		setLoading(true);

		try {
			let result = await TournamentModel.getById(id);
			setDetail(result);
			setLoading(false);
			console.log(result);
		} catch (e) {
			setLoading(false);
			console.log(e);
		}
	};

	const columns = [
		{
			id: 'username',
			label: 'DRIVER',
			render: (row) => (
				<Flex align={'center'} gap={12}>
					<img
						src={row?.user_avatar_url}
						alt="driver-avatar"
						style={{ height: 32, width: 32 }}
					/>
					<div>{row?.username}</div>
				</Flex>
			),
		},
		{
			id: 'laps',
			label: 'LAPS',
		},
		{
			id: 'time_in_millisecond',
			label: 'WAKTU',
			render: (row) => <>{`${row.time_in_millisecond} ms`}</>,
		},
	];

	useEffect(() => {
		getTournamentDetail();
	}, []);

	return (
		<>
			<Container fluid>
				<div
					style={{
						backgroundColor: Palette.BACKGROUND_DARK_GRAY,
						color: 'white',
					}}
					className="card-stats mb-4 mb-xl-0 px-4 py-3"
				>
					<Flex
						className="mb-1"
						justify={'space-between'}
						align={'center'}
					>
						{/* Page title & navigation back button */}
						<Flex
							gap={8}
							className="mb-3"
							style={{ fontWeight: 'bold', fontSize: '1.1em' }}
						>
							<div
								onClick={() => history.push('/tournament')}
								style={{ cursor: 'pointer' }}
							>
								<Iconify
									icon={'material-symbols:arrow-back'}
								></Iconify>
							</div>
							<div>Detail Turnamen</div>
						</Flex>

						{/* Add new drivers button */}
						<AntButton
							size={'middle'}
							type={'primary'}
							onClick={() => setShowModal(true)}
						>
							Tambah Driver
						</AntButton>
					</Flex>

					{loading ? (
						<Flex
							justify={'center'}
							align={'center'}
							className="mt-5"
						>
							<Spin />
						</Flex>
					) : (
						<div className="mt-5">
							{/* Tournament detail */}
							<Flex vertical gap={16} className="w-75">
								<TournamentDetailItem
									title={'Nama Turnamen'}
									value={detail?.tournament?.name || ''}
								/>
								<TournamentDetailItem
									title={'Status'}
									value={detail?.tournament?.active ? 'Aktif' : 'Tidak Aktif'}
								/>
								<TournamentDetailItem
									title={'Lokasi'}
									value={detail?.tournament?.location || ''}
								/>
								<TournamentDetailItem
									title={'Model'}
									value={detail?.tournament?.model || ''}
								/>
								<TournamentDetailItem
									title={'Kategori'}
									value={Helper.toTitleCase(
										detail?.tournament?.type || ''
									)}
								/>
								<TournamentDetailItem
									title={'Tanggal Mulai'}
									value={moment(
										detail?.tournament?.start_date || ''
									).format('dddd, DD MMMM YYYY')}
								/>
								<TournamentDetailItem
									title={'Tanggal Selesai'}
									value={moment(
										detail?.tournament?.end_date || ''
									).format('dddd, DD MMMM YYYY')}
								/>
								<TournamentDetailItem
									title={'Deskripsi'}
									value={Helper.toTitleCase(
										detail?.tournament?.detail || ''
									)}
								/>
							</Flex>

							{/* Tournament result */}
							<div className="mt-5">
								<div className="mb-2">Hasil Turnamen</div>
								{detail?.drivers?.length > 0 ? (
									<div>
										<CustomTable
											data={detail?.drivers || []}
											columns={columns}
										/>
									</div>
								) : (
									<div style={{ color: '#404040' }}>
										Data tidak tersedia
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</Container>
			<CreateTournamentDetailModalForm
				isOpen={showModal}
				closeModal={() => setShowModal(false)}
				tournamentData={detail ? detail : {}}
				updateDetailData={() => getTournamentDetail()}
			/>
		</>
	);
}

function TournamentDetailItem({ title, value }) {
	return (
		<Flex justify={'start'} align={'center'}>
			<div style={{ flex: '1 1 0', alignSelf: 'start' }}>{title}</div>
			<div style={{ fontWeight: 600, flex: '2 2 0' }}>{value}</div>
		</Flex>
	);
}

function CreateTournamentDetailModalForm({
	isOpen,
	closeModal,
	tournamentData,
	updateDetailData,
}) {
	const [formData, setFormData] = useState({
		tournament_id: tournamentData?.tournament?.id,
		username: '',
		laps: 0,
		time_in_millisecond: 0,
	});

	const updateFormData = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	const resetForm = () => {
		setFormData({
			tournament_id: tournamentData?.tournament?.id,
			username: '',
			laps: 0,
			time_in_millisecond: 0,
		});
	};

	const handleClose = () => {
		resetForm();
		closeModal();
	};

	const handleSubmit = async () => {
		if (Object.values(formData).indexOf('') > -1) {
			return swal.fireError({
				text: 'Mohon lengkapi semua kolom terlebih dahulu!',
			});
		}

		try {
			let result = await TournamentModel.createDetail({
				id: tournamentData?.tournament?.id,
				body: formData,
			});
			swal.fire({ text: 'Hasil berhasil ditambahkan!', icon: 'success' });
			updateDetailData();
			resetForm();
		} catch (e) {
			swal.fireError({
				text: e?.error_message || 'Gagal membuat turnamen',
			});
		}
	};

	return (
		<Modal size={'lg'} show={isOpen} backdrop="static" keyboard={false}>
			<Modal.Header>
				<Flex justify="space-between" align="center" className="w-100">
					<Modal.Title>Buat Turnamen</Modal.Title>
					<div onClick={handleClose} style={{ cursor: 'pointer' }}>
						<CloseOutlined style={{ color: '#FFF' }} />
					</div>
				</Flex>
			</Modal.Header>
			<Modal.Body>
				<Flex className="w-100 mb-3" gap={32}>
					<Flex vertical gap={12} className="flex-grow-1">
						<Flex vertical gap={8}>
							<label>Nama Turnamen</label>
							<div
								style={{
									color: '#404040',
									fontWeight: 'bold',
									backgroundColor:
										Palette.BACKGROUND_DARK_GRAY,
									padding: '10px 12px',
									borderRadius: '0.375rem',
								}}
							>
								{tournamentData?.tournament?.name}
							</div>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Username Driver</Form.Label>
							<Form.Control
								placeholder={'...'}
								value={formData.username}
								onChange={(e) =>
									updateFormData('username', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Laps</Form.Label>
							<Form.Control
								placeholder={'...'}
								type={'number'}
								value={formData.laps}
								onChange={(e) =>
									updateFormData('laps', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Waktu (ms)</Form.Label>
							<Form.Control
								placeholder={'...'}
								type={'number'}
								step={0.01}
								value={formData.time_in_millisecond}
								onChange={(e) =>
									updateFormData(
										'time_in_millisecond',
										e.target.value
									)
								}
							/>
						</Flex>
					</Flex>
				</Flex>
				<Flex gap={8} justify={'end'}>
					<AntButton
						className={'text-white'}
						type={'link'}
						size="sm"
						variant="outline-danger"
						onClick={handleClose}
					>
						Batal
					</AntButton>
					<AntButton
						type={'primary'}
						size="sm"
						variant="primary"
						onClick={handleSubmit}
					>
						Simpan
					</AntButton>
				</Flex>
			</Modal.Body>
		</Modal>
	);
}
