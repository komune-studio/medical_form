import {
    Space,
    Button as AntButton,
    Tooltip,
    Modal,
    message,
    Switch,
    Image,
} from "antd";
import React, { useState, useEffect } from "react";
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import { useHistory } from "react-router-dom";
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import LoyaltyShopModel from "../../../models/LoyaltyShopModel";
import Helper from "../../../utils/Helper";
import LoyaltyShopModalForm from "./LoyaltyShopModalForm";
import moment from "moment/moment";
import { Icon } from "@iconify/react";
import TopUpTitleBar from "../TopUp/TopUpTitleBar";
import LoyaltyShopTitleBar from "./LoyaltyShopTitleBar";

const LoyaltyShopList = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const columns = [
        {
            id: "image_url",
            label: "Foto Loyalty",
            filter: true,
            render: (row) => {
                return (
                    <Image height={100} width={150} src={row.image_url}></Image>
                );
            },
        },
        {
            id: "name",
            label: "Nama Barang",
            filter: true,
            width: "15%",
        },

        {
            id: "description",
            label: "Deskripsi Barang",
            filter: true,
            width: "15%",
        },
        {
            id: "price",
            label: "Nilai Poin",
            filter: true,
            width: "15%",
            render: (row) => {
                return (
                    <span>
                        <Icon
                            style={{ color: Palette.MAIN_THEME }}
                            icon={"mdi:crown"}
                        />
                        {row.price} points
                    </span>
                );
            },
        },
        {
            id: "active",
            label: "Status Promo",
            filter: false,
            width: "12%",
            render: (row) => {
                return (
                    <Switch
                        disabled={true}
                        defaultChecked={row.active}
                        style={{backgroundColor: row.active}}
                        onChange={() => {
                            changeActive(row.id, row.active);
                        }}
                    />
                );
            },
        },

        {
            id: "created_at",
            label: "Tanggal Dibuat",
            filter: true,
            width: "15%",
            render: (row) => {
                return moment(row.created_at).format("DD MMM YYYY HH:mm");
            },
        },
        {
            id: "",
            label: "",
            filter: false,
            render: (value) => {
                return (
                    <>
                        <Space size="small">
                            <Tooltip title="Edit">
                                <AntButton
                                    onClick={() => {
                                        setSelectedData(value);
                                        setOpenModal(true);
                                        setIsNewRecord(false);
                                    }}
                                    type={"link"}
                                    style={{ color: Palette.MAIN_THEME }}
                                    className={
                                        "d-flex align-items-center justify-content-center"
                                    }
                                    shape="circle"
                                    icon={
                                        <Iconify
                                            icon={"material-symbols:edit"}
                                        />
                                    }
                                >
                                    Edit
                                </AntButton>
                            </Tooltip>
                            <Tooltip
                                title={value?.active ? "Hapus" : "Restore"}
                            >
                                {value?.active ? (
                                    <AntButton
                                        onClick={() => {
                                            onDelete(value.id);
                                        }}
                                        type={"link"}
                                        style={{ color: Palette.MAIN_THEME }}
                                        className={
                                            "d-flex align-items-center justify-content-center"
                                        }
                                        shape="circle"
                                        icon={
                                            <Iconify
                                                icon={
                                                    "material-symbols:delete-outline"
                                                }
                                            />
                                        }
                                    >
                                        Hapus
                                    </AntButton>
                                ) : (
                                    <AntButton
                                        onClick={() => {
                                            onRestore(value.id);
                                        }}
                                        type={"link"}
                                        style={{ color: Palette.MAIN_THEME }}
                                        className={
                                            "d-flex align-items-center justify-content-center"
                                        }
                                        shape="circle"
                                        icon={<Iconify icon={"mdi:restore"} />}
                                    >
                                        Restore
                                    </AntButton>
                                )}
                            </Tooltip>
                        </Space>
                    </>
                );
            },
        },
    ];

    const changeActive = (id, currStatus) => {};

    const deleteItem = async (id) => {
        try {
            await LoyaltyShopModel.delete(id);
            message.success("Loyalty Shop berhasil dinonaktifkan");
            initializeData();
            window.location.reload();
        } catch (e) {
            message.error("There was error from server");
            setLoading(true);
        }
    };

    const restoreItem = async (id) => {
        try {
            await LoyaltyShopModel.restore(id);
            message.success("Loyalty berhasil diaktifkan");
            initializeData();
            window.location.reload();
        } catch (e) {
            message.error("There was error from server");
            setLoading(true);
        }
    };

    const onDelete = (record) => {
        Modal.confirm({
            title: "Apakah Anda yakin ingin nonaktifkan paket ini?",
            okText: "Yes",
            okButtonProps: {
                danger: false,
                type: "primary",
            },
            cancelButtonProps: {
                danger: false,
                type: "link",
                style: { color: "#fff" },
            },
            okType: "danger",
            onOk: () => {
                deleteItem(record);
            },
        });
    };

    const onRestore = (record) => {
        Modal.confirm({
            title: "Apakah Anda yakin ingin mengaktifkan paket ini?",
            okText: "Yes",
            okType: "danger",
            onOk: () => {
                restoreItem(record);
            },
        });
    };

    const initializeData = async () => {
        setLoading(true);
        try {
            let result = await LoyaltyShopModel.getAll();
            console.log("value of", result);
            setDataSource(result);
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeData();
    }, []);

    return (
        <>
            <Container fluid>
                <Card
                    style={{
                        background: Palette.BACKGROUND_DARK_GRAY,
                        color: "white",
                    }}
                    className="card-stats mb-4 mb-xl-0"
                >
                    <CardBody>
                        <LoyaltyShopTitleBar />
                        <AntButton
                            style={{
                                float: "right",
                                position: "relative",
                                top: "10px",
                            }}
                            onClick={() => {
                                setOpenModal(true);
                                setIsNewRecord(true);
                            }}
                            size={"middle"}
                            type={"primary"}
                        >
                            Tambah Barang
                        </AntButton>

                        {/* <Row style={{position: "relative", top: 65}}>
                            <Col className='mb-3 text-right' md={12}>
                                <AntButton onClick={() => {
                                    setOpenTopUpModal(true)
                                    setIsNewRecord(true)
                                }} size={'middle'} type={'primary'}>Tambah Top Up</AntButton>
                            </Col>
                        </Row> */}
                        <Row></Row>
                        <CustomTable
                            showFilter={true}
                            pagination={true}
                            searchText={""}
                            data={dataSource}
                            columns={columns}
                        />
                    </CardBody>
                </Card>
            </Container>
            <LoyaltyShopModalForm
                isOpen={openModal}
                isNewRecord={isNewRecord}
                selectedData={selectedData}
                close={async (refresh) => {
                    if (refresh) {
                        await initializeData();
                    }
                    setOpenModal(false);
                }}
            />
        </>
    );
};

export default LoyaltyShopList;
