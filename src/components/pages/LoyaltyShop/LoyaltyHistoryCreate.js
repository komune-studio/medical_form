import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { Col, Form, Row } from "react-bootstrap";
import { Button as AntButton, Image } from "antd";
import swal from "components/reusable/CustomSweetAlert";
import { Icon } from "@iconify/react";
import LoyaltyShopModel from "../../../models/LoyaltyShopModel";
import UserModel from "models/UserModel";
import Iconify from "components/reusable/Iconify";
import CustomTable from "components/reusable/CustomTable";
import { useHistory } from "react-router-dom";
import Helper from "utils/Helper";
import Palette from "utils/Palette";

export default function LoyaltyHistoryCreate() {
    const history = useHistory();
    const [loyaltyItems, setLoyaltyItems] = useState([]);
    const [quantity, setQuantity] = useState([]);
    const [total, setTotal] = useState(0);
    const [scannedUser, setScannedUser] = useState(null);
    const [scanTextInput, setScanTextInput] = useState(null);

    const columns = [
        {
            id: "item",
            label: "Item",
            filter: true,
            render: (row, index) => {
                return (
                    <div
                        className="d-flex justify-content-start align-items-center"
                        style={{ gap: 12 }}
                    >
                        <Image
                            height={40}
                            width={48}
                            src={row.image_url}
                            style={{ borderRadius: 6 }}
                        ></Image>
                        <div>
                            <div>{row.name}</div>
                            <div>{row.price} points</div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "quantity",
            label: "Quantity",
            filter: false,
            render: (row, index) => {
                return (
                    <div style={{ flex: 1 }}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                value={quantity[index]}
                                onChange={(e) => {
                                    setQuantity(quantity.map((item, idx) => {
                                        if (idx === index) {
                                            return e.target.value
                                        } else {
                                            return item
                                        }
                                    }))
                                }}
                                placeholder="Qty"
                                type="number"
                            />
                        </Form.Group>
                    </div>
                );
            },
        },
        {
            id: "total",
            label: "Total",
            filter: false,
            render: (row, index) => {
                return <div>{'hello'}</div>;
            },
        },
    ];

    const getLoyaltyItems = async () => {
        try {
            let result = await LoyaltyShopModel.getAll();
            setLoyaltyItems(result);
            setQuantity(Array(result.length).fill(0))
            console.log("LOYALTY ITEMS", result);
        } catch (e) {
            swal.fireError({ text: e.error_message ? e.error_message : null });
        }
    };

    const resetValue = () => {};

    const editValue = (value) => {
        setScanTextInput(value);

        let timer;
        clearTimeout(timer);

        timer = setTimeout(() => {
            if (value.length > 100) findUserByQR(value);
        }, 300);
    };

    const onSubmit = () => {};

    const findUserByQR = async (value) => {
        try {
            let result = await UserModel.processUserQR({ token: value });
            setScannedUser(result);
        } catch (e) {
            swal.fireError({
                text: e.error_message
                    ? e.error_message
                    : "Invalid QR, please try again.",
            });
        }
    };

    useEffect(() => {
        getLoyaltyItems();
    }, []);

    return (
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
                    <div onClick={() => history.push("/loyalty-history")}>
                        <Iconify icon={"material-symbols:arrow-back"}></Iconify>
                    </div>
                    <div style={{ flex: 1 }}>&nbsp;Tukar Poin</div>
                    <AntButton
                        onClick={() => {
                            resetValue();
                        }}
                        style={{
                            backgroundColor: "transparent",
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
                            marginLeft: 16,
                            marginRight: 16,
                            padding: 16,
                            width: "100%",
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: 16 }}>
                            Produk
                        </div>
                        <CustomTable
                            showFilter={true}
                            pagination={true}
                            searchText={""}
                            data={loyaltyItems}
                            columns={columns}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div
                        style={{
                            background: "black",
                            marginLeft: 16,
                            marginRight: 16,
                            padding: 16,
                            borderRadius: 8,
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: 16 }}>
                            Customer
                        </div>
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
                                    {"hello"}
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
    );
}
