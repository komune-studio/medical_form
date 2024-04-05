import { Button, Card, CardBody, Container } from "reactstrap";
import { Col, Form, Row } from 'react-bootstrap';
import Palette from "../../../utils/Palette";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import { Dropdown } from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import React, { useEffect, useState } from "react";
import { Space, Button as AntButton, } from "antd";
import OrderModel from "models/OrderModel";
import UserModel from "models/UserModel"
import { useHistory } from "react-router-dom";

const ITEMS = [
    {id : 1, name : "Beginner Ticket", price : "30.000"},
    {id : 2, name : "Advanced Ticket", price : "40.000"},
    {id : 3, name : "Pro Ticket", price : "50.000"},
]

let contentTimer

export default function OrderCreate() {

    const history = useHistory()

    let [quantity, setQuantity] = useState([0,0,0])
    let [scanTextInput, setScanTextInput] = useState("")
    let [scannedUser, setScannedUser] = useState(null)

    const editValue = (value) => {
        setScanTextInput(value)

        clearTimeout(contentTimer);

        contentTimer = setTimeout(async () => {
            if(value.length > 100){
                findUserByQR(value)
            }
        }, 300);
    }


    const onSubmit=async()=>{
        try{
            let details = []
            for(let qIndex in quantity){
                let q = quantity[qIndex]
                if(q > 0){
                    details.push({id : ITEMS[qIndex].id, quantity : q})
                }
            }
            let result = await OrderModel.create({
                user_id : scannedUser.id,
                details
            })
            console.log(result)
            alert("Sukses, Pembelian Tersimpan")
            history.push("/orders")
        }catch(e){
            console.log(e)
            alert("Terjadi Kesalahan")
        }
    }

    const findUserByQR =async(value)=>{
        try{
            let qr = await UserModel.processUserQR({
                token : value
            })
            console.log(qr)
            setScannedUser(qr)
        }catch(e){
            console.log(e)
            alert("Terjadi Kesalahan")
        }
    }

    useEffect(() => {

    }, [])

    return (
        <>
            <Container fluid style={{ color: "white" }}>
                <Row>
                    <Col md={12} style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom : 20 }}>
                        <Iconify icon={'material-symbols:arrow-back'}></Iconify>
                        <div style={{flex : 1}}>Proses Order</div>
                        <AntButton 
                            onClick={()=>{
                                onSubmit()
                            }}
                            style={{backgroundColor : Palette.BARCODE_ORANGE, borderColor : Palette.BARCODE_ORANGE, color : "white"}}>Simpan</AntButton>
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
                                    ITEMS.map((item, index) => {
                                        return <>
                                            <Col md={6} style={{ display: "flex", flexDirection: "column" }}>
                                                <div>{item.name}</div>
                                                <div><Iconify icon={'fluent-emoji-flat:coin'}></Iconify>{item.price}</div>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        value={quantity[index]}
                                                        autoComplete={"jumlah"}
                                                        onChange={(e) => {
                                                            let temp = [...quantity]
                                                            let newValue = parseInt(e.target.value)
                                                            if(newValue <= 0) newValue = 0
                                                            temp[index] = newValue
                                                            setQuantity(temp)
                                                        }} 
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
                            {
                                scannedUser ? 
                                <div style={{ display : "flex", flexDirection : "column", marginTop : 10}}>
                                    {scannedUser.username}<br/>
                                    <div style={{color : "#C2C2C2", fontSize : "0.85em"}}>{scannedUser.email}</div>
                                </div>
                                :
<div style={{ display : "flex", flexDirection : "row", marginTop : 10}}>
                                <div style={{flex : 1}}>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            value={scanTextInput}
                                            onChange={(e) => editValue(e.target.value)} 
                                            placeholder="Tekan lalu scan" />
                                    </Form.Group>
                                </div>
                                <div style={{paddingLeft : 10}}>
                                    <AntButton 
                                        onClick={()=>{
                                            findUserByQR()
                                        }}
                                        style={{backgroundColor : "black", borderColor: "white", color : "white"}}>Cari</AntButton>
                                </div>
                            </div>
                            }
                            
                        </div>
                    </Col>
                </Row>

            </Container>
        </>
    )
}