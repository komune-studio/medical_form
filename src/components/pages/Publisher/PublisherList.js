import { Space, Button as AntButton, Tooltip, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import PublisherFormModal from './PublisherFormModal';
import Publisher from 'models/PublisherModel';

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
      id: 'email', label: 'Email', filter: false,
    },
    {
      id: 'phone', label: 'Phone', filter: false,
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
                    setOpenPublisherModal(true)
                    setSelectedPublisher(row)
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
      await Publisher.delete(id)
      message.success('Publisher deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this publisher data?",
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
      let result = await Publisher.getAll();
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
                <AntButton onClick={() => {
                  setIsNewRecord(true)
                  setOpenPublisherModal(true)
                }} size={'middle'} type={'primary'}>Add Publisher</AntButton>
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
