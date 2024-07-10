import { Space, Button as AntButton, Tooltip, Modal, message, Switch, Image } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import Iconify from '../../reusable/Iconify';
import { Col } from 'react-bootstrap';
import CustomTable from '../../reusable/CustomTable';
import Palette from '../../../utils/Palette';
import TopUp from '../../../models/TopUpModel';
import TopUpFormModal from './TopUpFormModal';
import Helper from '../../../utils/Helper';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import TopUpTitleBar from './TopUpTitleBar';
import DefaultPackagePicture from 'assets/img/brand/barcode.png';

const TopUpList = () => {
	const history = useHistory();
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState([]);
	const [openTopUpModal, setOpenTopUpModal] = useState(false);
	const [isNewRecord, setIsNewRecord] = useState(false);
	const [selectedTopUp, setSelectedTopUp] = useState(null);
	const columns = [
		{
			id: 'image',
			label: 'Foto Paket',
			filter: true,
			width: '10%',
			render: (row) => (row.image ? <Image height={100} width={150} src={row.image}></Image> : <></>),
		},
		{
			id: 'package_name',
			label: 'Foto paket top up',
			filter: true,
			width: '15%',
		},
		{
			id: 'currency',
			label: 'Nama paket top up',
			filter: true,
			width: '15%',
		},
		{
			id: 'price',
			label: 'Harga Paket',
			filter: true,
			render: (row) => {
				return row?.price ? 'Rp.' + Helper.formatNumber(row.price) : 0;
			},
		},
		{
			id: 'amount',
			label: 'Jumlah',
			filter: true,
			render: (row) => {
				return row?.amount ? Helper.formatNumber(row.amount) : 0;
			},
		},
		{
			id: 'description',
			label: 'Deskripsi paket',
			filter: true,
		},

		{
			id: 'active',
			label: 'Status Paket',
			filter: false,
			width: '12%',
			render: (row) => {
				return (
					<Switch
						disabled={false}
						checked={row.active}
						onChange={() => {
							changeActive(row.id, row.active);
						}}
					/>
				);
			},
		},
		{
			id: '',
			label: '',
			filter: false,
			render: (value) => {
				return (
					<>
						<Space size="small">
							<Tooltip title="Edit">
								<AntButton
									type={'link'}
									style={{ color: Palette.MAIN_THEME }}
									onClick={() => {
										setSelectedTopUp(value);
										setOpenTopUpModal(true);
										setIsNewRecord(false);
									}}
									className={'d-flex align-items-center justify-content-center'}
									shape="circle"
									icon={<Iconify icon={'material-symbols:edit'} />}
								>
									Ubah
								</AntButton>
							</Tooltip>
							{/* <Tooltip title={value?.active ? 'Hapus' : 'Restore'}>
                                {
                                    value?.active ?
                                        <AntButton
                                            onClick={() => {
                                                onDelete(value.id)
                                            }}
                                            type={'link'}
                                            style={{color: Palette.MAIN_THEME}}
                                            className={"d-flex align-items-center justify-content-center"}
                                            shape="circle"
                                            icon={<Iconify icon={"material-symbols:delete-outline"}/>}
                                        >Hapus</AntButton>
                                        : <AntButton
                                            onClick={() => {
                                                onRestore(value.id)
                                            }}
                                            type={'link'}
                                            style={{color: Palette.MAIN_THEME}}
                                            className={"d-flex align-items-center justify-content-center"}
                                            shape="circle"
                                            icon={<Iconify icon={"mdi:restore"}/>}
                                        >Restore</AntButton>
                                }

                            </Tooltip> */}
						</Space>
					</>
				);
			},
		},
	];

	const changeActive = (id, currStatus) => {
		if (currStatus == true) onDelete(id);
		else onRestore(id);
	};

	const deleteItem = async (id) => {
		try {
			await TopUp.delete(id);
			message.success('Paket berhasil dinonaktifkan');
			initializeData();
			window.location.reload();
		} catch (e) {
			message.error('There was error from server');
			setLoading(true);
		}
	};

	const restoreItem = async (id) => {
		try {
			await TopUp.restore(id);
			message.success('Paket berhasil diaktifkan');
			initializeData();
			window.location.reload();
		} catch (e) {
			message.error('There was error from server');
			setLoading(true);
		}
	};

	const onDelete = (record) => {
		Modal.confirm({
			title: 'Apakah Anda yakin ingin nonaktifkan paket ini?',
			okText: 'Yes',
			okType: 'danger',
			onOk: () => {
				deleteItem(record);
			},
		});
	};

	const onRestore = (record) => {
		Modal.confirm({
			title: 'Apakah Anda yakin ingin mengaktifkan paket ini?',
			okText: 'Yes',
			okType: 'danger',
			onOk: () => {
				restoreItem(record);
			},
		});
	};

	const initializeData = async () => {
		setLoading(true);
		try {
			let result = await TopUp.getAll();
			console.log(result);
			setDataSource(result);
			setLoading(false);
		} catch (e) {
			setLoading(false);
		}
	};

	useEffect(() => {
		initializeData();
	}, []);

	return (
		<>
			<Container fluid>
				<Card
					style={{ background: Palette.BACKGROUND_DARK_GRAY, color: 'white' }}
					className="card-stats mb-4 mb-xl-0"
				>
					<CardBody>
						<TopUpTitleBar />

						<AntButton
							style={{
								float: 'right',
								position: 'relative',
								top: '10px',
							}}
							onClick={() => {
								setOpenTopUpModal(true);
								setIsNewRecord(true);
							}}
							size={'middle'}
							type={'primary'}
						>
							Tambah Top Up
						</AntButton>

						{/* <Row style={{position: "relative", top: 65}}>
                            <Col className='mb-3 text-right' md={12}>
                                <AntButton onClick={() => {
                                    setOpenTopUpModal(true)
                                    setIsNewRecord(true)
                                }} size={'middle'} type={'primary'}>Tambah Top Up</AntButton>
                            </Col>
                        </Row> */}
						<Row></Row>
						<CustomTable
							showFilter={true}
							pagination={true}
							searchText={''}
							data={dataSource}
							columns={columns}
						/>
					</CardBody>
				</Card>
			</Container>
			<TopUpFormModal
				isOpen={openTopUpModal}
				isNewRecord={isNewRecord}
				topUpData={selectedTopUp}
				close={async (refresh) => {
					if (refresh) {
						await initializeData();
					}
					setOpenTopUpModal(false);
				}}
			/>
		</>
	);
};

export default TopUpList;
