import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { Col, Form, Row } from "react-bootstrap";
import { Button as AntButton, Image } from "antd";
import swal from "components/reusable/CustomSweetAlert";
import LoyaltyShopModel from "../../../models/LoyaltyShopModel";
import UserModel from "models/UserModel";
import Iconify from "components/reusable/Iconify";
import CustomTable from "components/reusable/CustomTable";
import { useHistory } from "react-router-dom";
import Helper from "utils/Helper";
import Palette from "utils/Palette";
import LoyaltyHistoryModel from "models/LoyaltyHistoryModel";

export default function LoyaltyHistoryCreate() {
    const history = useHistory();
    const [loyaltyItems, setLoyaltyItems] = useState([]);
    const [quantity, setQuantity] = useState({});
    const [total, setTotal] = useState(0);
    const [scannedUser, setScannedUser] = useState(null);
    const [scanTextInput, setScanTextInput] = useState("");

    const columns = [
        {
            id: "name",
            label: "Item",
            filter: true,
            render: (row) => {
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
                            <div>{Helper.formatNumber(row.price)} points</div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "quantity",
            label: "Quantity",
            filter: false,
            render: (row) => {
                return (
                    <div style={{ flex: 1 }}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                value={quantity[row.id]}
                                onChange={(e) => {
                                    handleQuantityInputChange(
                                        row,
                                        parseInt(e.target.value)
                                    );
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
            render: (row) => {
                return <div>{Helper.formatNumber(row.price * quantity[row.id])}</div>;
            },
        },
    ];

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

    const getLoyaltyItems = async () => {
        try {
            let result = await LoyaltyShopModel.getAll();
            setLoyaltyItems(result);

            let quantityObject = {};
            for (let item of result) {
                quantityObject[item.id] = 0;
            }

            setQuantity(quantityObject);
        } catch (e) {
            swal.fireError({ text: e.error_message ? e.error_message : null });
        }
    };

    const handleScanTextInputChange = (value) => {
        setScanTextInput(value);

        let timer;
        clearTimeout(timer);

        timer = setTimeout(() => {
            if (value.length > 100) findUserByQR(value);
        }, 300);
    };

    const handleQuantityInputChange = (row, newValue) => {
        setQuantity({
            ...quantity,
            [row.id]: newValue <= 0 ? 0 : newValue,
        });
    };

    const resetForms = () => {
        let quantityObject = {};

        for (let item of loyaltyItems) {
            quantityObject[item.id] = 0;
        }

        setQuantity(quantityObject);
        setScanTextInput("");
        setScannedUser(null);
    };

    const handleSubmit = async () => {
        try {
            const details = [];
            for (let item of loyaltyItems) {
                if (quantity[item.id] > 0) {
                    details.push({ id: item.id, quantity: quantity[item.id] });
                }
            }

            await LoyaltyHistoryModel.create({
                user_id: scannedUser.id,
                details: details,
            });
            swal.fire({ text: "Loyalty Usage Success!", icon: "success" });
            history.push("/loyalty-history");
        } catch (e) {
            swal.fireError({ text: e.error_message ? e.error_message : null });
        }
    };

    useEffect(() => {
        getLoyaltyItems();
    }, []);

    useEffect(() => {
        let sum = 0;
        loyaltyItems.forEach((item) => {
            sum += item.price * quantity[item.id];
        });
        setTotal(sum);
    }, [quantity, loyaltyItems]);

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
                        onClick={resetForms}
                        style={{
                            backgroundColor: "transparent",
                            borderColor: Palette.BARCODE_ORANGE,
                            color: "white",
                            marginRight: 12,
                        }}
                    >
                        Reset
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
                    <div
                        style={{
                            backgroundColor: "black",
                            marginLeft: 16,
                            marginRight: 16,
                            marginTop: 24,
                            padding: 16,
                            width: "100%",
                            borderRadius: 8,
                            gap: 16,
                        }}
                        className="d-flex flex-column"
                    >
                        <div>Pembayaran</div>
                        <div
                            style={{
                                padding: 12,
                                borderRadius: 4,
                                border: "1px solid #404040",
                            }}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div>Total</div>
                            <div>{Helper.formatNumber(total)}</div>
                        </div>
                        <div style={{ textAlign: "end" }}>
                            <AntButton
                                onClick={() => {
                                    handleSubmit();
                                }}
                                style={{
                                    backgroundColor: Palette.BARCODE_ORANGE,
                                    borderColor: Palette.BARCODE_ORANGE,
                                    color: "white",
                                }}
                            >
                                Tukar Poin
                            </AntButton>
                        </div>
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
                                    {Helper.formatNumber(scannedUser.loyalty)} points
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
                                                handleScanTextInputChange(
                                                    e.target.value
                                                )
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
