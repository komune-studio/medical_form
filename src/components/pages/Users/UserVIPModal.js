import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { message, Button as AntButton, Flex } from 'antd';
import swal from '../../reusable/CustomSweetAlert';
import User from '../../../models/UserModel';
import UserApex from '../../../models/UserApexModel';
import ChildrenModel from '../../../models/ChildrenAccountModel';
import Palette from 'utils/Palette';
import Avatar from '../../../assets/img/brand/avatar.png';
import LoyaltyHistory from '../LoyaltyShop/LoyaltyHistory';
import LoyaltyHistoryModel from 'models/LoyaltyHistoryModel';
import Datetime from 'react-datetime';
import moment from 'moment';

export default function UserVIPModal({ isOpen, handleClose, userData }) {

	const [inputValue, setInputValue] = useState('');

	const handleInputValueChange = (value) => {
		setInputValue(value);
	};

	const handleRemoveVIP = async () => {
		try {
			await User.removeVIP(userData.id)
			swal.fire({
				icon: "success",
				title: `Success`,
				text: "Perubahan Berhasil",
				focusConfirm: true,
			});
			handleClose(true)
		} catch (e) {
			console.log(e);
			swal.fireError({
				title: `Error`,
				text: e.error_message ? e.error_message : 'Gagal untuk menghubungkan akun, silahkan coba lagi!',
				focusConfirm: true,
			});
		}
	};
	
	const handleSubmit = async () => {
		try {
			await User.edit(userData.id, {
				vip_until: moment(inputValue).set({ hour: 23, minute: 59 }).toDate()
			})
			swal.fire({
				icon: "success",
				title: `Success`,
				text: "Penambahan Berhasil",
				focusConfirm: true,
			});
			handleClose(true)
		} catch (e) {
			console.log(e);
			swal.fireError({
				title: `Error`,
				text: e.error_message ? e.error_message : 'Terjadi Kesalahan',
				focusConfirm: true,
			});
		}
	};

	useEffect(() => {
		if (isOpen) {
			if (userData.vip_until) {
				setInputValue(userData.vip_until)
			}
		} else {
			setInputValue('');
		}
	}, [isOpen]);

	if (!userData) {
		return null;
	}

	return (
		<Modal show={isOpen} backdrop="static" keyboard={false}>

			<Modal.Body>
				<Flex vertical gap={18}>
					<Modal.Title style={{ color: "white" }}>Akun VIP</Modal.Title>
					{/* <Form.Control
						value={inputValue}
						placeholder={'Masukkan jumlah'}
						onChange={(e) => handleInputValueChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleSubmit();
							}
						}}
					/> */}
					<small>Berlaku Sampai</small>
					<Datetime
						timeFormat={false}
						value={moment(inputValue).toDate()}
						onChange={(value) =>
							setInputValue(value)
						}
					/>
					<Flex justify="end">
						<AntButton
							style={{ marginRight: 10, color: "white" }}
							type="text"
							onClick={() => {
								handleRemoveVIP()
							}}
						>
							Matikan VIP
						</AntButton>
						<div style={{ flex: 1 }}></div>
						<AntButton
							style={{ marginRight: 10, color: "white" }}
							type="text"
							onClick={() => {
								handleClose();
							}}
						>
							Batal
						</AntButton>
						<AntButton
							type="primary"
							onClick={() => {
								handleSubmit()
							}}
						>
							Simpan
						</AntButton>
					</Flex>
				</Flex>
			</Modal.Body>
		</Modal>
	);
}