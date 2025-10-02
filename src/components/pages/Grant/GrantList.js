import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tabs } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import Grant from 'models/GrantModel';
import GrantReviewModal from './GrantReviewModal';

const tabs = [
  {
    key: 'pending',
    label: 'Pending',
  },
  {
    key: 'completed',
    label: 'Completed',
  },
];

const GrantList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [openGrantModal, setOpenGrantModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState("pending");

  const filteredData = dataSource.filter((data) => {
    if (selectedTab == "pending") {
      return data.status == "WAITING"
    }
    return data.status != "WAITING"
  })

  const columns = [
    {
      id: 'id', label: 'ID', filter: true,
    },
    {
      id: 'book_title', label: 'Book Title', filter: true,
    },
    {
      id: 'target_language', label: 'Target Language', filter: true,
    },
    {
      id: 'document_url', label: 'Document URL', filter: true,
    },
    {
      id: 'status', label: 'Status', filter: true,
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              <AntButton
                type={'link'}
                style={{ color: Palette.MAIN_THEME }}
                onClick={() => {
                  setSelectedGrant(row)
                  setOpenGrantModal(true)
                }}
                className={"d-flex align-items-center justify-content-center text-white"}
                shape="circle"
                icon={<Iconify icon={"mdi:print-preview"} />} >
                Review
              </AntButton>
              {/* Tombol Detail */}
              {/* <Tooltip title="Detail">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenGrantModal(true)
                    setSelectedGrant(row)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:search-rounded"} />} />
              </Tooltip> */}

              {/* <Tooltip title="Edit">
                <Link to={`/authors/${row.id}/edit`}>
                  <AntButton
                    type={'link'}
                    style={{ color: Palette.MAIN_THEME }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:edit"} />} />
                </Link>
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
              </Tooltip> */}
            </Space >
          </>
        )

      })
    },
  ]

  const approveGrant = async (id) => {
    try {
      await Grant.approveGrant(id)
      message.success('Grant approved')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const rejectGrant = async (id) => {
    try {
      await Grant.rejectGrant(id)
      message.success('Grant rejected')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onApprove = (record) => {
    Modal.confirm({
      title: "Are you sure you want to approve this grant request?",
      okText: "Yes",
      okType: "text",
      onOk: () => {
        approveGrant(record.id)
      },
      okButtonProps: {
        className: "bg-success"
      },
      cancelButtonProps: {
        type: "text",
        className: "bg-white"
      }
    });
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to reject this grant request?",
      okText: "Yes",
      okType: "text",
      onOk: () => {
        rejectGrant(record.id)
      },
      okButtonProps: {
        className: "bg-danger"
      },
      cancelButtonProps: {
        type: "text",
        className: "bg-white"
      }
    });
  };

  const initializeData = async () => {
    setLoading(true)
    try {
      let result = await Grant.getAll();
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Translation Grants</div>
              </Col>
              {/* <Col className='mb-3 text-right' md={6}>
                <Link to="/authors/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'}>Add Author</AntButton>
                </Link>
              </Col> */}
            </Row>
            <Row>
              <Col>
                <Tabs defaultActiveKey='pending' items={tabs} onChange={(key) => setSelectedTab(key)} />
              </Col>
            </Row>
            <CustomTable
              showFilter={true}
              pagination={true}
              searchText={''}
              data={filteredData}
              columns={columns}
            />
          </CardBody>
        </Card>

      </Container>

      {/* Modal untuk Detail Author */}
      <GrantReviewModal
        open={openGrantModal}
        grant={selectedGrant}
        onClose={() => setOpenGrantModal(false)}
      />
    </>
  )
}

export default GrantList;