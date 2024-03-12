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

import Admin from "models/AdminModel";
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import logo from "../../assets/img/brand/elib.png"
import Palette from "../../utils/Palette";
import swal from "../../components/reusable/CustomSweetAlert";

const Login = () => {
  const history = useHistory()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async () => {
    try {

      if(!username){
        return await swal.fire({
          title: 'Error',
          text: "Please fill in username",
          icon: 'error',
          confirmButtonText: 'Okay'
        })
      }

      if(!password){
        return await swal.fire({
          title: 'Error',
          text: "Please fill in password",
          icon: 'error',
          confirmButtonText: 'Okay'
        })
      }

      let result = await Admin.login(username, password)

      console.log(result.username)
      localstorage.super_token = result.token;
      localStorage.username = result.username;
      localStorage.role = result.role;
      sessionStorage.token = result.token;
      sessionStorage.username = result.username;
      sessionStorage.id = result.id;
      history.push('/')

    } catch (e) {
      console.log(e)

      let errorMessage = "An Error Occured"
      if (e.error_message) {
        if (e.error_message === "USERNAME_NOT_FOUND" || e.error_message === "Wrong password") {
          errorMessage = "Wrong Credential"
        } else {
          errorMessage = e.error_message
        }
      }
      await swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Okay'
      })

    }
  }L
  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">

          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <img
                  style={{
                    width : "100%",
                    objectFit : "contain"
                  }}
                  src={logo}/>
              {/* <div className={"d-flex flex-row align-items-center justify-content-center"}> */}
                {/* <div>Powered By :&nbsp;</div> */}
                {/* <div style={{color : Palette.KOMUNE_YELLOW, fontWeight : "bold"}}>komune studio</div> */}
              {/* </div> */}
            </div>
            <Form role="form">
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Username"
                    type="text"
                    autoComplete="username"
                    onChange={(e) => {
                      setUsername(e.target.value)
                    }}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value)
                    }}
                  />
                </InputGroup>
              </FormGroup>
              <div className="text-center">
                <Button onClick={() => { handleSubmit() }} className="mt-2" color="info" type="button">
                  Sign in
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
