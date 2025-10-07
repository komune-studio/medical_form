import { Space, Button as AntButton, Switch as AntSwitch, Tooltip, Modal, message, Flex, Image } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import BannerFormModal from './BannerFormModal';
import Banner from 'models/BannerModel';

const BannerList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null)
  const [openCateogryModal, setOpenBannerModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'id', label: 'ID', filter: false, allowSort: false,
    },
    {
      id: 'image_url', label: 'Banner Image', filter: true,
      render: (row) => (
        <Flex style={{ height: "100px", width: "auto", aspectRatio: "4/3", alignItems: "center", justifyContent: "center" }}>
          {!row?.image_url ? (
            <Iconify
              icon={"material-symbols:hide-image-outline"}
              style={{
                fontSize: "48px"
              }}
            />
          ) : (
            <Image height={"100%"} width={"100%"} style={{ objectFit: "contain" }} src={row?.image_url}></Image>
          )}
        </Flex>
      )
    },
    {
      id: 'show_banner', label: 'Show Banner', filter: true,
      render: (row) => (
        <Tooltip title="Show Banner on Landing Page">
          <AntSwitch defaultValue={row?.show_banner} onChange={(checked) => toggleShowBanner(checked, row?.id)} />
        </Tooltip>
      )
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              <Tooltip title="Edit">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenBannerModal(true)
                    setSelectedBanner(row)
                    setIsNewRecord(false)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />} />
              </Tooltip>
              <Tooltip title="Delete">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    onDelete(row.id)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:delete-outline"} />} />
              </Tooltip>
            </Space>
          </>
        )

      })
    },
    /* {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Button variant={'text'}>Lihat Detail</Button>
          </>
          )

      })
    }, */
  ]

  const deleteItem = async (id) => {
    try {
      await Banner.delete(id)
      message.success('Category deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category data?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        deleteItem(record)
      }
    });
  };

  const toggleShowBanner = async (checked, id) => {
    try {
      await Banner.edit(id, { show_banner: checked })
      initializeData()
    } catch(e) {
      message.error("Error updating banner image")
    }
  }

  const initializeData = async () => {
    setLoading(true)
    try {
      let result = await Banner.getAll();
      setDataSource(result)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeData()
  }, [])

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>

            <Row>
              <Col className='mb-3' md={6}>
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Banners</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <AntButton onClick={() => {
                  setIsNewRecord(true)
                  setOpenBannerModal(true)
                }} size={'middle'} type={'primary'}>Add Banner</AntButton>
              </Col>
            </Row>
            <Row>

            </Row>
            <CustomTable
              showFilter={true}
              pagination={true}
              searchText={''}
              data={dataSource}
              columns={columns}
            />
          </CardBody>
        </Card>

      </Container>

      <BannerFormModal
        isOpen={openCateogryModal}
        isNewRecord={isNewRecord}
        bannerData={selectedBanner}
        close={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenBannerModal(false)
        }}
      />

    </>
  )
}

export default BannerList;
