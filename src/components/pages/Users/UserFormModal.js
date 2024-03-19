import Modal from 'react-bootstrap/Modal';
import {DatePicker, message, Spin,Upload as AntUpload} from "antd";
import { Button, Form } from 'react-bootstrap';
import {useEffect, useState} from "react";
import UserModel from "../../../models/UserModel";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import moment from "moment/moment";
import UploadModel from "../../../models/UploadModel"

UserFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    userData: PropTypes.object,
};


export default function UserFormModal({isOpen, close, isNewRecord, userData}) {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)
    const [email, setEmail] = useState(null)
    const [birthDate, setBirthDate] = useState(null)
    const [fullName, setFullName] = useState("")
    const [gender, setGender] = useState()
    const [phoneNumber, setPhoneNumber] = useState(null)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [avatarImage, setAvatarImage] = useState(null)
    const [loadingUpload, setLoadingUpload] = useState(false)



    const handleUpload = async (file) => {
        try {
            setLoadingUpload(true)
            let result = await UploadModel.uploadPicutre(file.file?.originFileObj)

            if(result?.location){
                setAvatarImage(result?.location)
                message.success('Successfully upload user')
            }
            setLoadingUpload(false)
        }catch (e) {
            console.log('isi e', e)
            message.error("Failed to upload user")
            setLoadingUpload(false)
        }
    }
    const onSubmit = async () => {
        if(!username){
            swal.fireError({text: "Username Wajib diisi",})
            return
        }

        if(!username){
            swal.fireError({text: "Username Wajib diisi",})
            return
        }
        if(!fullName){
            swal.fireError({text: "Nama Lengkap Wajib diisi",})
            return
        }
        if(!email){
            swal.fireError({text: "Email Wajib diisi",})
            return
        }
        if(!phoneNumber){
            swal.fireError({text: "Nomor Telepon Wajib diisi",})
            return
        }

        try {
            let result;
            let body = {
                username : username,
                gender : gender,
                full_name : fullName,
                email : email,
                phone_number : phoneNumber,
                birth_date : new Date(birthDate),
                avatar_url : avatarImage
            }
            let msg = ''
            if(isNewRecord){
                if(!password){
                    swal.fireError({text: "Password Wajib diisi",})
                    return
                }

                if (!confirmPassword) {
                    swal.fireError({ text: "Konfirmasi Password Wajib diisi", })
                    return
                }

                if (password !== confirmPassword) {
                    swal.fireError({ text: "Password dan Konfirmasi Password tidak sama", })
                    return
                }
                Object.assign(body, {
                    password:password
                })
                 await UserModel.create(body)
                msg = "Berhasil membuat User"
            }else{
                 await UserModel.edit(userData?.id, body)
                msg = "Berhasil update User"
            }

            message.success(msg)
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : "An Error Occured",
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initForm = () => {
        console.log('isi userData', userData)
        if(!isNewRecord){
            setUsername(userData?.username)
            setBirthDate(moment(userData?.birth_date) || null)
            setEmail(userData?.email)
            setGender(userData?.gender)
            setFullName(userData?.full_name)
            setPhoneNumber(userData?.phone_number)
            setAvatarImage(userData?.avatar_url)
        }

    }
    useEffect(()=>{
        if (isNewRecord){
            reset()
        }else{
            initForm()
        }


    }, [isOpen])

    const reset = () =>{
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setFullName("")
        setEmail("")
        setPhoneNumber("")
        setGender(null)
        setAvatarImage(null)
        setBirthDate(null)
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <Modal.Title>{isNewRecord ? 'Buat User' : `Ubah User: ${userData?.full_name}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

            <Form.Group>
                <Form.Label style={{ fontSize: "0.8em" }}>Image</Form.Label>
                <AntUpload
                    rootClassName={'upload-background'}
                    name="avatar"
                    listType="picture-card"
                    fileList={[]}
                    className="avatar-uploader"
                    showUploadList={false}
                    onChange={(file) => {
                        handleUpload(file)
                    }}
                >
                    {avatarImage ? (
                        <>
                            {
                                !loadingUpload ? <img
                                    src={avatarImage}
                                    alt="avatar"
                                    style={{
                                        width: '80%',
                                        height: '80%',
                                        objectFit: 'cover'
                                    }}
                                /> : <Spin style={{zIndex:100000}} size="large" />
                            }

                        </>

                    ) : (
                        <button
                            style={{
                                border: 0,
                                background: 'none',
                            }}
                            type="button"
                        >
                            {loadingUpload ?  <Spin style={{zIndex:100000}} size="large" /> : <PlusOutlined/>}
                            <div
                                style={{
                                    marginTop: 8,
                                }}
                            >
                                Upload
                            </div>
                        </button>
                    )}
                </AntUpload>
            </Form.Group>
                {/* Admin username */}
                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "0.8em" }}>Username</Form.Label>
                    <Form.Control
                        value={username}
                        autoComplete={"username"}
                        onChange={(e) => setUsername(e.target.value)} type="text" placeholder="Username" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "0.8em" }}>Full Name</Form.Label>
                    <Form.Control
                        value={fullName}
                        autoComplete={"fullname"}
                        onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Fullname" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "0.8em" }}>Email</Form.Label>
                    <Form.Control
                        value={email}
                        autoComplete={"email"}
                        onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Email" />
                </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Phone Number</Form.Label>
                <Form.Control
                    value={phoneNumber}
                    autoComplete={"email"}
                    onChange={(e) => setPhoneNumber(e.target.value)} type="text" placeholder="Phone Number" />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Gender</Form.Label>
                <Form.Check
                    value={'M'}
                    type="radio"
                    aria-label="Male"
                    label="Male"
                    onChange={(e) =>{
                        setGender(e.target.value)
                    }}
                    checked={gender === "M"}
                />
                <Form.Check
                    value={'F'}
                    type="radio"
                    aria-label="Female"
                    label="Female"
                    onChange={(e) =>{
                        setGender(e.target.value)
                    }}
                    checked={gender === "F"}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: "0.8em" }}>Tanggal Lahir</Form.Label>
                <DatePicker
                    getPopupContainer={(triggerNode) => {
                        return triggerNode.parentNode;
                    }}
                    style={{width : "100%"}}
                    value={birthDate}
                    onChange={(value)=>{
                        setBirthDate(value)
                    }}
                />
            </Form.Group>

            {
                isNewRecord &&
                <>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: "0.8em" }}>Password</Form.Label>
                        <Form.Control
                            autoComplete={"password"}
                            onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: "0.8em" }}>Confirm Password</Form.Label>
                        <Form.Control
                            autoComplete={"confirm-password"}
                            onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Password" />
                    </Form.Group>
                </>
            }

            <div className={"d-flex flex-row justify-content-end"}>
                <Button size="sm" variant="outline-danger" onClick={()=>handleClose()} style={{marginRight: '5px'}}>
                    Batal
                </Button>
                <Button size="sm" variant="primary" onClick={() => {
                    onSubmit()
                }}>
                    {isNewRecord ? 'Buat' : 'Ubah'}
                </Button>
            </div>
        </Modal.Body>
    </Modal>
}