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

const Login = () => {

  let history = useHistory()

  useEffect(()=>{
    localStorage.removeItem("super_token")
    localStorage.removeItem("username")
    localStorage.removeItem("role")

    sessionStorage.removeItem("super_token")
    sessionStorage.removeItem("username")
    sessionStorage.removeItem("role")

    history.push('/login')
    window.location.reload()
  },[])

  return (
    <>
      <Col lg="5" md="7">

      </Col>
    </>
  );
};

export default Login;
