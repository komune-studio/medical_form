import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container } from 'reactstrap';
import { ButtonGroup, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import {
	Flex,
	Spin,
	Button as AntButton,
	Tooltip,
	Switch,
	Modal as AntModal,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import TournamentModel from 'models/TournamentModel';
import swal from 'components/reusable/CustomSweetAlert';
import CustomTable from 'components/reusable/CustomTable';
import Iconify from 'components/reusable/Iconify';
import Palette from 'utils/Palette';
import Helper from 'utils/Helper';

export default function TournamentList() {
	const [tournaments, setTournaments] = useState({});
	const [category, setCategory] = useState('');
	const [loading, setLoading] = useState(false);
	const [modal, setModal] = useState({ show: false });
	const history = useHistory();

	const tournamentsDataFormatter = (data) => {
		let formatted = {};

		data.map((item) => {
			if (item.type in formatted) {
				formatted[item.type].push(item);
			} else {
				formatted[item.type] = [item];
			}

			return item;
		});

		return formatted;
	};

	const getTournamentsData = async () => {
		setLoading(true);

		try {
			let result = await TournamentModel.getAll();
			let formattedResult = tournamentsDataFormatter(result);
			setTournaments(formattedResult);
			setCategory([...Object.keys(formattedResult)][0]);
			setLoading(false);
		} catch (e) {
			swal.fireError({
				text:
					e?.error_message || 'Error while fetching tournaments data',
			});
			setLoading(false);
		}
	};

	const tableColumnFormat = [
		{
			id: 'start_date',
			label: 'TANGGAL MULAI',
			filter: false,
			link: true,
			render: (row) => {
				return (
					<>{moment(row.start_date).format('dddd, DD MMMM YYYY')}</>
				);
			},
		},
		{
			id: 'end_date',
			label: 'TANGGAL SELESAI',
			filter: false,
			link: true,
			render: (row) => {
				return <>{moment(row.end_date).format('dddd, DD MMMM YYYY')}</>;
			},
		},
		{
			id: 'name',
			label: 'NAMA TURNAMEN',
			filter: true,
			link: true,
		},
		{
			id: 'model',
			label: 'MODEL',
			filter: true,
			link: true,
		},
		{
			id: 'type',
			label: 'KATEGORI',
			filter: false,
			link: true,
			render: (row) => <>{Helper.toTitleCase(row?.type || '')}</>,
		},
		{
			id: 'active',
			label: 'STATUS',
			filter: false,
			link: false,
			render: (row) => (
				<Switch
					defaultChecked={row.active}
					checked={row.active}
					onChange={() => {
						handleActiveStatusChange(row);
					}}
				/>
			),
		},
		{
			id: '',
			label: '',
			filter: false,
			link: false,
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
											initialData: {
												...row,
												start_date: moment(
													row.start_date
												).format('YYYY-MM-DD'),
												end_date: moment(
													row.end_date
												).format('YYYY-MM-DD'),
											},
										});
									}}
								/>
							</Tooltip>
						</Flex>
					</>
				);
			},
		},
	];

	const handleActiveStatusChange = (rowData) => {
		AntModal.confirm({
			title: rowData.active
				? 'Apakah anda yakin ingin menonaktifkan tournamen ini?'
				: 'Apakah anda yakin ingin mengaktifkan turnamen ini?',
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
				changeActiveStatus(rowData);
			},
		});
	};

	const changeActiveStatus = async (rowData) => {
		try {
			await TournamentModel.edit({
				id: rowData.id,
				body: { ...rowData, active: !rowData.active },
			});
			swal.fire({
				text: 'Berhasil mengubah status turnamen!',
				icon: 'success',
			});
			getTournamentsData();
		} catch (e) {
			swal.fireError({
				text: e?.error_message || 'Gagal mengubah status turnamen!',
			});
		}
	};

	useEffect(() => {
		getTournamentsData();
	}, []);

	return (
		<>
			<Container fluid>
				<div
					style={{
						background: Palette.BACKGROUND_DARK_GRAY,
						color: 'white',
					}}
					className="card-stats mb-4 mb-xl-0 px-4 py-3"
				>
					<Flex
						className="mb-1"
						justify={'space-between'}
						align={'center'}
					>
						{/* Page title */}
						<div
							className="mb-3"
							style={{ fontWeight: 'bold', fontSize: '1.1em' }}
						>
							List Turnamen
						</div>
						{/* Create new tournament button */}
						<AntButton
							size={'middle'}
							type={'primary'}
							onClick={() => {
								setModal({
									show: true,
									formType: 'create',
								});
							}}
						>
							Tambah Turnamen
						</AntButton>
					</Flex>

					{/* Page content */}
					<div>
						{/* Tournament category selector */}
						<div className="mb-5">
							<ButtonGroup aria-label="Basic example">
								{[...Object.keys(tournaments)].map(
									(item, index) => (
										<button
											key={index}
											className={`btn ${
												category === item
													? 'btn-primary-tab'
													: 'btn-default-tab'
											}`}
											onClick={() => setCategory(item)}
										>
											{Helper.toTitleCase(item)}
										</button>
									)
								)}
							</ButtonGroup>
						</div>

						{loading ? (
							<Flex justify="center" align="center">
								<Spin />
							</Flex>
						) : (
							<CustomTable
								data={
									tournaments[category]
										? tournaments[category]
										: []
								}
								columns={tableColumnFormat}
								showFilter={true}
								pagination={true}
								searchText={''}
								rowAction={{
									onClick: (rowData) =>
										history.push(
											`/tournament/${rowData.id}`
										),
								}}
							/>
						)}
					</div>
				</div>
			</Container>

			<TournamentListModal
				isOpen={modal?.show}
				closeModal={() => setModal({ show: false })}
				updateTournamentsData={getTournamentsData}
				tournamentData={modal?.initialData || {}}
				formType={modal?.formType}
			/>
		</>
	);
}

function TournamentListModal(props) {
	const [formData, setFormData] = useState({});

	const updateFormData = (name, value) => {
		setFormData({ ...formData, [name]: value });
	};

	const resetForm = () => {
		setFormData({
			name: '',
			location: '',
			model: '',
			type: '',
			start_date: '',
			end_date: '',
			detail: '',
		});
	};

	const preFillForm = (data) => {
		setFormData({
			name: data?.name || '',
			location: data?.location || '',
			model: data?.model || '',
			type: data?.type || '',
			start_date: data?.start_date || '',
			end_date: data?.end_date || '',
			detail: data?.detail || '',
		});
	};

	const handleClose = () => {
		resetForm();
		props.closeModal();
	};

	const handleSubmit = async () => {
		if (Object.values(formData).indexOf('') > -1) {
			return swal.fireError({
				text: 'Mohon lengkapi semua kolom terlebih dahulu!',
			});
		}

		try {
			if (props.formType === 'create') {
				await TournamentModel.create(formData);
				swal.fire({
					text: 'Turnamen berhasil dibuat!',
					icon: 'success',
				});
			} else {
				await TournamentModel.edit({
					id: props?.tournamentData?.id,
					body: formData,
				});
				swal.fire({
					text: 'Turnamen berhasil diubah!',
					icon: 'success',
				});
			}

			props.updateTournamentsData();
			handleClose();
		} catch (e) {
			swal.fireError({
				text: e?.error_message || 'Gagal membuat turnamen',
			});
		}
	};

	useEffect(() => {
		console.log(props.tournamentData);

		if (props.formType === 'edit') {
			preFillForm(props.tournamentData);
		} else {
			resetForm();
		}
	}, [props.tournamentData, props.formType]);

	return (
		<Modal
			size={'lg'}
			show={props.isOpen}
			backdrop="static"
			keyboard={false}
		>
			<Modal.Header>
				<Flex justify="space-between" align="center" className="w-100">
					<Modal.Title>
						{props.formType === 'create'
							? 'Buat Turnamen'
							: 'Ubah Turnamen'}
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
							<Form.Label>Nama Turnamen</Form.Label>
							<Form.Control
								placeholder={'...'}
								value={formData.name}
								onChange={(e) =>
									updateFormData('name', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Lokasi</Form.Label>
							<Form.Control
								placeholder={'...'}
								value={formData.location}
								onChange={(e) =>
									updateFormData('location', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Model</Form.Label>
							<Form.Control
								placeholder={'...'}
								value={formData.model}
								onChange={(e) =>
									updateFormData('model', e.target.value)
								}
							/>
						</Flex>
					</Flex>
					<Flex vertical gap={12} className="flex-grow-1">
						<Flex vertical gap={8}>
							<Form.Label>Kategori</Form.Label>
							<Form.Control
								placeholder={'...'}
								value={formData.type}
								onChange={(e) =>
									updateFormData('type', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Tanggal Mulai</Form.Label>
							<Form.Control
								placeholder={'DD/MM/YYYY'}
								type="date"
								value={formData.start_date}
								onChange={(e) =>
									updateFormData('start_date', e.target.value)
								}
							/>
						</Flex>
						<Flex vertical gap={8}>
							<Form.Label>Tanggal Selesai</Form.Label>
							<Form.Control
								placeholder={'DD/MM/YYYY'}
								type="date"
								value={formData.end_date}
								onChange={(e) =>
									updateFormData('end_date', e.target.value)
								}
							/>
						</Flex>
					</Flex>
				</Flex>
				<Flex className="mb-5" vertical gap={8}>
					<Form.Label>Deskripsi</Form.Label>
					<Form.Control
						placeholder={'...'}
						as="textarea"
						rows={7}
						value={formData.detail}
						onChange={(e) =>
							updateFormData('detail', e.target.value)
						}
					/>
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
