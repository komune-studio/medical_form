import { Button, Card, CardBody, Container } from "reactstrap";
import { Col, Form, Row } from "react-bootstrap";
import Palette from "../../../utils/Palette";
import Helper from "utils/Helper";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import { Dropdown } from "react-bootstrap";
import Iconify from "../../reusable/Iconify";
import CustomTable from "../../reusable/CustomTable";
import swal from "../../reusable/CustomSweetAlert";
import React, { useEffect, useState } from "react";
import { Space, Button as AntButton } from "antd";
import OrderModel from "models/OrderModel";
import UserModel from "models/UserModel";
import OrderCreateModel from "models/OrderCreateModel";
import { useHistory } from "react-router-dom";

const ITEMS = [
    { id: 1, name: "Beginner Ticket", price: "30000" },
    { id: 2, name: "Advanced Ticket", price: "40000" },
    { id: 3, name: "Pro Ticket", price: "50000" },
];

let contentTimer;

export default function OrderCreate() {
    const history = useHistory();

    let [quantity, setQuantity] = useState([0, 0, 0]);
    let [scanTextInput, setScanTextInput] = useState("");
    let [scannedUser, setScannedUser] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [total, setTotal] = useState(0)

    const editValue = (value) => {
        setScanTextInput(value);

        clearTimeout(contentTimer);

        contentTimer = setTimeout(async () => {
            if (value.length > 100) {
                findUserByQR(value);
            }
        }, 300);
    };

    const resetValue = () => {
        setScanTextInput("");
        setQuantity([0, 0, 0]);
    }

    const onSubmit = async () => {
        try {
            let details = [];
            for (let qIndex in quantity) {
                let q = quantity[qIndex];
                if (q > 0) {
                    details.push({ id: ITEMS[qIndex].id, quantity: q });
                }
            }
            let result = await OrderModel.create({
                user_id: scannedUser.id,
                details,
            });
            console.log("QR PAYMENT SUCCESS", result);
            swal.fire({
                title: `Success`,
                icon: "success",
                text: "QR payment success!",
            });
            history.push("/orders");
        } catch (e) {
            console.log("QR PAYMENT FAILED", e);
            swal.fireError({
                title: `Error`,
                text: e.error_message
                    ? e.error_message
                    : "Invalid request, please try again.",
            });
        }
    };

    const findUserByQR = async (value) => {
        try {
            let qr = await UserModel.processUserQR({
                token: value,
            });
            console.log("findUserByQR Sucess", qr);
            setScannedUser(qr);
        } catch (e) {
            console.log("findUserByQR Error", e);
            swal.fireError({
                title: `Error`,
                text: e.error_message
                    ? e.error_message
                    : "Invalid QR, please try again.",
            });
            resetValue();
        }
    };

    const getOrderItems = async () => {
        try {
            let result = await OrderCreateModel.getAll();
            setOrderItems(result);
        } catch (e) {
            swal.fireError({ text: e.error_message ? e.error_message : "" });
        }
    };

    useEffect(() => {
        getOrderItems();
    }, []);

    useEffect(() => {
        let sum = 0;
        
        if (orderItems.length > 0) {
            quantity.forEach((num, index) => {
                sum += orderItems[index].price * num
            })
        }

        setTotal(sum);
    }, [quantity, orderItems])

    return (
        <>
            <Container fluid style={{ color: "white" }}>
                <Row>
                    <Col
                        md={12}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <div onClick={() => history.push("/orders")}>
                            <Iconify
                                icon={"material-symbols:arrow-back"}
                            ></Iconify>
                        </div>
                        <div style={{ flex: 1 }}>&nbsp;Proses Order</div>
                        <AntButton
                            onClick={() => {
                                resetValue();
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: Palette.BARCODE_ORANGE,
                                color: "white",
                                marginRight: 12,
                            }}
                        >
                            Reset
                        </AntButton>
                        <AntButton
                            onClick={() => {
                                onSubmit();
                            }}
                            style={{
                                backgroundColor: Palette.BARCODE_ORANGE,
                                borderColor: Palette.BARCODE_ORANGE,
                                color: "white",
                            }}
                        >
                            Simpan
                        </AntButton>
                    </Col>
                    <Col md={6}>
                        <div
                            style={{
                                background: "black",
                                margin: 10,
                                padding: 10,
                            }}
                        >
                            <div style={{ fontWeight: "bold" }}>Tiket</div>
                            <Row style={{ color: "#C2C2C2" }}>
                                <Col md={6}>Item</Col>
                                <Col md={6}>Quantity</Col>
                                <Col md={12}>
                                    <div
                                        style={{
                                            height: 1,
                                            backgroundColor: "#C2C2C2",
                                            width: "100%",
                                        }}
                                    ></div>
                                </Col>
                                {orderItems.map((item, index) => {
                                    return (
                                        <>
                                            <Col
                                                md={6}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                }}
                                            >
                                                <div>{item.name}</div>
                                                <div>
                                                    <Iconify
                                                        icon={
                                                            "fluent-emoji-flat:coin"
                                                        }
                                                    ></Iconify>
                                                    {item.price}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Control
                                                        value={quantity[index]}
                                                        autoComplete={"jumlah"}
                                                        onChange={(e) => {
                                                            let temp = [
                                                                ...quantity,
                                                            ];
                                                            let newValue =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                );
                                                            if (newValue <= 0)
                                                                newValue = 0;
                                                            temp[index] =
                                                                newValue;
                                                            setQuantity(temp);
                                                        }}
                                                        type="number"
                                                        placeholder="Masukan Jumlah"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    );
                                })}
                                <Col md={12}>
                                    <div
                                        style={{
                                            height: 1,
                                            backgroundColor: "#C2C2C2",
                                            width: "100%",
                                        }}
                                    ></div>
                                </Col>
                                <Col
                                    md={12}
                                    style={{
                                        fontWeight: "bold",
                                        marginTop: 10,
                                    }}
                                >
                                    Pembayaran
                                </Col>
                                <Col
                                    md={12}
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>Total</div>
                                    <div>
                                        <Iconify
                                            icon={"fluent-emoji-flat:coin"}
                                        ></Iconify>
                                        {Helper.formatNumber(total)}
                                    </div>
                                </Col>
                                {/* <Col md={12} style={{marginTop : 10}}>
                                    <div style={{color : "#C2C2C2"}}>Pilih Metode Pembayaran</div>
                                </Col> */}
                            </Row>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div
                            style={{
                                background: "black",
                                margin: 10,
                                padding: 10,
                            }}
                        >
                            <div style={{ fontWeight: "bold" }}>Customer</div>
                            {scannedUser ? (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        marginTop: 10,
                                    }}
                                >
                                    {scannedUser.username}
                                    <br />
                                    <div
                                        style={{
                                            color: "#C2C2C2",
                                            fontSize: "0.85em",
                                        }}
                                    >
                                        {scannedUser.email}
                                    </div>
                                    <div
                                        style={{
                                            color: "#C2C2C2",
                                            fontSize: "0.85em",
                                        }}
                                    >
                                        <Iconify
                                            icon={"fluent-emoji-flat:coin"}
                                        ></Iconify>
                                        {Helper.formatNumber(scannedUser.balance.COIN)}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        marginTop: 10,
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <Form.Group className="mb-3">
                                            <Form.Control
                                                value={scanTextInput}
                                                onChange={(e) =>
                                                    editValue(e.target.value)
                                                }
                                                placeholder="Tekan lalu scan"
                                            />
                                        </Form.Group>
                                    </div>
                                    <div style={{ paddingLeft: 10 }}>
                                        <AntButton
                                            onClick={() => {
                                                findUserByQR();
                                            }}
                                            style={{
                                                backgroundColor: "black",
                                                borderColor: "white",
                                                color: "white",
                                            }}
                                        >
                                            Cari
                                        </AntButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
