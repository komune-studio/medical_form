import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container } from 'reactstrap';
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { CloseOutlined } from '@ant-design/icons';
import {
	Flex,
	Button as AntButton,
	Spin,
	Tooltip,
	Modal as AntModal,
} from 'antd';
import moment from 'moment';
import Iconify from 'components/reusable/Iconify';
import swal from 'components/reusable/CustomSweetAlert';
import TournamentModel from 'models/TournamentModel';
import Palette from 'utils/Palette';
import Helper from 'utils/Helper';
import CustomTable from 'components/reusable/CustomTable';
import Avatar from 'assets/img/brand/avatar.png';

export default function TournamentDetail() {
	const [detail, setDetail] = useState({});
	const [loading, setLoading] = useState(false);
	const [modal, setModal] = useState({ show: false });
	const history = useHistory();
	const { id } = useParams();

	const getTournamentDetail = async () => {
		setLoading(true);

		try {
			let result = await TournamentModel.getById(id);
			setDetail(result);
			setLoading(false);
		} catch (e) {
			setLoading(false);
			console.log(e);
		}
	};

	const handleDelete = (id) => {
		AntModal.confirm({
			title: 'Apakah anda yakin ingin menghapus hasil ini?',
			okText: 'Ya',
			okButtonProps: {
				danger: false,
				type: 'primary',
			},
			cancelButtonProps: {
				danger: false,
				type: 'link',
				style: { color: '#FFF' },
			},
			okType: 'danger',
			onOk: () => {
				deleteData(id);
			},
		});
	};

	const deleteData = async (id) => {
		try {
			await TournamentModel.hardDeleteDetail(id);
			getTournamentDetail();
			swal.fire({text: 'Berhasil menghapus hasil!', icon: 'success'});
		} catch(e) {
			getTournamentDetail();
			swal.fireError({text: 'Gagal menghapus hasil!'});
		}
	};

	const columns = [
		{
			id: 'username',
			label: 'DRIVER',
			render: (row) => (
				<Flex align={'center'} gap={12}>
					<img
						src={row?.user_avatar_url || Avatar}
						alt="driver-avatar"
						style={{ height: 32, width: 32 }}
						className="rounded-circle"
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
		{
			id: '',
			label: '',
			filter: false,
			render: (row) => {
				return (
					<>
						<Flex align={'center'} justify={'start'}>
							<Tooltip title="Edit">
								<AntButton
									type={'link'}
									shape={'circle'}
									icon={
										<Iconify
											icon={'material-symbols:edit'}
										/>
									}
									style={{ color: Palette.MAIN_THEME }}
									onClick={() => {
										setModal({
											show: true,
											formType: 'edit',
											initialData: row,
										});
									}}
								/>
							</Tooltip>
							<Tooltip title="Hapus">
								<AntButton
									type={'link'}
									shape={'circle'}
									icon={
										<Iconify
											icon={'material-symbols:delete'}
										/>
									}
									style={{ color: Palette.MAIN_THEME }}
									onClick={() => {
										handleDelete(row.id);
									}}
								/>
							</Tooltip>
						</Flex>
					</>
				);
			},
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
							onClick={() =>
								setModal({ show: true, formType: 'create' })
							}
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
									value={
										detail?.tournament?.active
											? 'Aktif'
											: 'Tidak Aktif'
									}
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
			<TournamentDetailModalForm
				isOpen={modal?.show}
				formType={modal?.formType}
				closeModal={() => setModal({ show: false })}
				tournamentData={detail ? detail : {}}
				initialData={modal?.initialData}
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

function TournamentDetailModalForm({
	isOpen,
	formType,
	closeModal,
	tournamentData,
	initialData,
	updateDetailData,
}) {
	const [formData, setFormData] = useState({});

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
			if (formType === 'create') {
				await TournamentModel.createDetail({
					id: tournamentData?.tournament?.id,
					body: formData,
				});
				swal.fire({
					text: 'Hasil berhasil ditambahkan!',
					icon: 'success',
				});
			} else {
				await TournamentModel.editDetail({
					id: initialData?.id,
					body: {
						...initialData,
						...formData,
					},
				});
				swal.fire({ text: 'Hasil berhasil diubah!', icon: 'success' });
			}

			updateDetailData();
			resetForm();
			if (formType === 'edit') handleClose();
		} catch (e) {
			swal.fireError({
				text: e?.error_message || 'Gagal membuat turnamen',
			});
		}
	};

	useEffect(() => {
		if (formType === 'create') resetForm();
		else
			setFormData({
				tournament_id: tournamentData?.tournament?.id,
				username: initialData?.username || '',
				laps: initialData?.laps || '',
				time_in_millisecond: initialData?.time_in_millisecond || '',
			});
	}, [formType, initialData]);

	return (
		<Modal size={'lg'} show={isOpen} backdrop="static" keyboard={false}>
			<Modal.Header>
				<Flex justify="space-between" align="center" className="w-100">
					<Modal.Title>
						{formType === 'create'
							? 'Tambah Driver'
							: 'Edit Driver'}
					</Modal.Title>
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
