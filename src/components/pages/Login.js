    import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col
} from "reactstrap";

import Admin from "../../models/AdminModel"
import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import logo from "../../assets/img/brand/logo_kart.png"
import Palette from "../../utils/Palette";
import swal from "../../components/reusable/CustomSweetAlert";

const Login = () => {
    const history = useHistory()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async () => {
        try {

            if (!username) {
                return await swal.fire({
                    title: 'Error',
                    text: "Please fill in username",
                    icon: 'error',
                    confirmButtonText: 'Okay'
                })
            }

            if (!password) {
                return await swal.fire({
                    title: 'Error',
                    text: "Please fill in password",
                    icon: 'error',
                    confirmButtonText: 'Okay'
                })
            }

            let result = await Admin.login(username, password)

            localStorage.super_token = result.token;
            localStorage.token = result.token;
            localStorage.admin_name = result.username;
            localStorage.role = result.role;
            sessionStorage.token = result.token;
            sessionStorage.admin_name = result.username;
            sessionStorage.id = result.id;
            history.push('/schedule')
            window.location.reload()

        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            if (e.error_message) {
                errorMessage = "Invalid Credential"
                // if (e.error_message === "USERNAME_NOT_FOUND" || e.error_message === "Wrong password") {
                //     errorMessage = "Invalid Credential"
                // } else {
                //     errorMessage = e.error_message
                // }
            }
            await swal.fire({
                title: 'Error',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }
    }
    return (
        <>
            <Col lg="5" md="7">
                <Card style={{background:Palette.BACKGROUND_BLACK, borderRadius:14}} >
                    <CardBody  className="px-lg-5 py-lg-5">
                        <div className="text-center text-muted mb-4">
                            <img
                                style={{
                                    width: "100%",
                                    objectFit: "contain"
                                }}
                                src={logo}/>
                        </div>
                        <Form role="form">
                            <FormGroup className="mb-3">
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend" style={{background:Palette.BACKGROUND_DARK_GRAY}}
                                    >
                                        <InputGroupText style={{background:Palette.BACKGROUND_DARK_GRAY}}
                                        >
                                            <i className="ni ni-email-83"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        style={{background:Palette.BACKGROUND_DARK_GRAY}}
                                        placeholder="Username"
                                        type="text"
                                        autoComplete="username"
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                        }}
                                        className="px-2"
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend" style={{background:Palette.BACKGROUND_DARK_GRAY}}>
                                        <InputGroupText style={{background:Palette.BACKGROUND_DARK_GRAY}}>
                                            <i className="ni ni-lock-circle-open"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        style={{background:Palette.BACKGROUND_DARK_GRAY}}
                                        placeholder="Kata sandi"
                                        type="password"
                                        autoComplete="new-password"
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                        }}
                                        onKeyUp={(event) => {
                                            if (event.key === "Enter") {
                                                handleSubmit()
                                            }
                                        }}
                                        className="px-2"
                                    />
                                </InputGroup>
                            </FormGroup>
                            <div className="text-center">
                                <Button onClick={() => {
                                    handleSubmit()
                                }} className="mt-2" color="info" type="button">
                                    Masuk
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>

            </Col>
        </>
    );
};

export default Login;
