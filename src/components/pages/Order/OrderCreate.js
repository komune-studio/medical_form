import { Button, Card, CardBody, Container } from "reactstrap";
import { Col, Form, Row } from 'react-bootstrap';
import Palette from "../../../utils/Palette";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import { Dropdown } from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import React, { useEffect, useState } from "react";
import { Space, Button as AntButton, } from "antd";

export default function OrderCreate() {

    useEffect(() => {
    }, [])

    return (
        <>
            <Container fluid style={{ color: "white" }}>
                <Row>
                    <Col md={12} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Iconify icon={'material-symbols:arrow-back'}></Iconify>
                        Proses Order
                    </Col>
                    <Col md={6}>
                        <div style={{ background: "black", margin: 10, padding: 10 }}>
                            <div style={{ fontWeight: "bold" }}>Tiket</div>
                            <Row style={{ color: "#C2C2C2" }}>
                                <Col md={6}>Item</Col>
                                <Col md={6}>Quantity</Col>
                                <Col md={12}>
                                    <div style={{ height: 1, backgroundColor: "#C2C2C2", width: "100%" }}></div>
                                </Col>
                                {
                                    [0, 1, 2].map(obj => {
                                        return <>
                                            <Col md={6} style={{ display: "flex", flexDirection: "column" }}>
                                                <div>Track Ticket Beginner</div>
                                                <div><Iconify icon={'fluent-emoji-flat:coin'}></Iconify>30.000</div>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        // value={price}
                                                        autoComplete={"jumlah"}
                                                        // onChange={(e) => setPrice(e.target.value)} 
                                                        type="number" placeholder="Masukan Jumlah" />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    })
                                }
                                <Col md={12}>
                                    <div style={{ height: 1, backgroundColor: "#C2C2C2", width: "100%" }}></div>
                                </Col>
                                <Col md={12} style={{ fontWeight: "bold", marginTop: 10 }}>
                                    Pembayaran
                                </Col>
                                <Col md={12} style={{ display: "flex", flexDirection: "row" }}>
                                    <div style={{ flex: 1 }}>Total</div>
                                    <div><Iconify icon={'fluent-emoji-flat:coin'}></Iconify>30.000</div>
                                </Col>
                                {/* <Col md={12} style={{marginTop : 10}}>
                                    <div style={{color : "#C2C2C2"}}>Pilih Metode Pembayaran</div>
                                </Col> */}
                            </Row>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div style={{ background: "black", margin: 10, padding: 10 }}>
                            <div style={{ fontWeight: "bold" }}>Customer</div>
                            <div style={{ display : "flex", flexDirection : "row", marginTop : 10}}>
                                <div style={{flex : 1}}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            // value={price}
                                            autoComplete={"jumlah"}
                                            // onChange={(e) => setPrice(e.target.value)} 
                                            placeholder="Masukan Jumlah" />
                                    </Form.Group>
                                </div>
                                <div style={{paddingLeft : 10}}>
                                    <AntButton style={{backgroundColor : "black", borderColor: "white", color : "white"}}>Cari</AntButton>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

            </Container>
        </>
    )
}