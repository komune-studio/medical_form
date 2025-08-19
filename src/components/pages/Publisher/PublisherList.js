import { Space, Button as AntButton, Tooltip, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import moment from "moment"
import { CSVLink } from "react-csv";
import PublisherFormModal from './PublisherFormModal';

const PublisherList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [openPublisherModal, setOpenPublisherModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'id', label: 'ID', filter: false,
    },
    {
      id: 'name', label: 'Name', filter: true,
    },
    {
      id: 'address', label: 'Address', filter: true,
    },
    {
      id: 'website', label: 'Website', filter: false,
    },
    {
      id: '', label: '', filter: false,
      render: ((value) => {
        return (
          <>
            <Space size="small">
              <Tooltip title="Edit">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenPublisherModal(true)
                    setSelectedPublisher(value)
                    setIsNewRecord(false)


                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />} />
              </Tooltip>
              <Tooltip title="Hapus">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    onDelete(value.id)
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
      // await User.delete(id)
      message.success('Penerbit telah dihapus')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Apakah Anda yakin ingin menghapus data penerbit ini?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        deleteItem(record)
      }
    });
  };

  const initializeData = async () => {
    setLoading(true)
    try {
      // let result = await User.getAll()
      let result = [
        {
          "id": 1,
          "name": "Beta Solutions",
          "address": "321 Pine Rd, Ogdenville",
          "website": "https://deltatech.io"
        },
        {
          "id": 2,
          "name": "Test Data",
          "address": "654 ruko aniva",
          "website": "https://example.com"
        }
      ]
      console.log(result)
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Publisher</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <CSVLink
                  headers={[
                    { label: "Name", key: "name" },
                    { label: "Address", key: "address" },
                    { label: "Website", key: "website" },
                  ]}
                  filename={
                    "Publisher Data - " +
                    new moment().format("dddd, MMMM Do YYYY, HH:mm") +
                    ".csv"
                  }
                  data={dataSource.map(obj => {
                    // console.log("DDSS", dataSource)
                    return {
                      ...obj,
                      name: obj.name,
                      address: obj.address,
                      website: obj.website,
                    }
                  })}
                >
                  <AntButton className={"mr-1 bg-transparent text-white"}>
                    <Iconify icon={"mdi:download"}></Iconify> Export
                  </AntButton>
                </CSVLink>

                <AntButton onClick={() => {
                  setIsNewRecord(true)
                  setOpenPublisherModal(true)
                }} size={'middle'} type={'primary'} style={{ border: "1px solid #ef6024" }}>Tambah Penerbit</AntButton>
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

      <PublisherFormModal
        isOpen={openPublisherModal}
        isNewRecord={isNewRecord}
        publisherData={selectedPublisher}
        close={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenPublisherModal(false)
        }}
      />

    </>
  )
}

export default PublisherList;
