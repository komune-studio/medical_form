import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { message, Button as AntButton, Flex } from 'antd';
import swal from '../../reusable/CustomSweetAlert';
import User from '../../../models/UserModel';
import ChildrenModel from '../../../models/ChildrenAccount';

export default function UserLinkChildrenModal({ isOpen, handleClose, userData }) {
	const [children, setChildren] = useState([]);
	const [inputValue, setInputValue] = useState('');

	const getChildren = async () => {
		try {
			let result = await ChildrenModel.getByUserId(userData.id);
			console.log('CHILDREN', result);
			setChildren(children);
		} catch (e) {
			console.log(e);
		}
	};

	const handleInputValueChange = (value) => {
		setInputValue(value);
	};

	const handleSubmit = () => {
		return null;
	};

	// const onSubmit = async () => {
	// 	if (!confirmPassword) {
	// 		message.error({ text: 'Konfirmasi Password Wajib diisi' });
	// 		return;
	// 	}

	// 	if (newPassword !== confirmPassword) {
	// 		message.error({ text: 'Password Baru dan Konfirmasi Password tidak sesuai' });
	// 		return;
	// 	}

	// 	try {
	// 		let body = {
	// 			new_password: newPassword,
	// 		};
	// 		let result2 = await User.edit_password(userData?.id, body);
	// 		if (result2?.id) {
	// 			message.success('Berhasil merubah password User');
	// 			handleClose(true);
	// 		} else {
	// 			message.error('Gagal menyimpan User');
	// 		}
	// 	} catch (e) {
	// 		console.log(e);
	// 		let errorMessage = 'An Error Occured';
	// 		await swal.fire({
	// 			title: 'Error',
	// 			text: e.error_message ? e.error_message : errorMessage,
	// 			icon: 'error',
	// 			confirmButtonText: 'Okay',
	// 		});
	// 	}
	// };

	useEffect(() => {
		if (isOpen) {
			getChildren();
		}
	}, [isOpen]);

	return (
		<Modal show={isOpen} backdrop="static" keyboard={false}>
			<Modal.Header>
				<Modal.Title>Sambungkan Akun Children</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Flex vertical gap={32}>
					<Flex vertical gap={8} style={{ marginTop: 24 }}>
						<Form.Label style={{ fontWeight: 400 }}>Daftarkan Driver</Form.Label>
						<Flex gap={8}>
							<Form.Control
								value={inputValue}
								placeholder={'Masukkan apex nickname user'}
								onChange={(e) => handleInputValueChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleSubmit();
									}
								}}
							/>
							<AntButton type={'primary'} disabled={!inputValue} onClick={handleSubmit}>
								Daftarkan
							</AntButton>
						</Flex>
					</Flex>
				</Flex>
			</Modal.Body>
		</Modal>
	);
}
