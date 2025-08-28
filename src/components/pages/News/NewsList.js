import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import News from 'models/NewsModel';
import moment from 'moment';

const NewsList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null)
  const [openNewsModal, setOpenNewsModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'image_cover', label: 'Cover Image', filter: false, allowSort: false,
      render: (row) => {
        return (
          <Flex style={{ height: "100px", width: "auto", aspectRatio: "3/4", alignItems: "center", justifyContent: "center" }}>
            {!row?.profile_picture ? (
              <Iconify
                icon={"material-symbols:hide-image-outline"}
                style={{
                  fontSize: "48px"
                }}
              />
            ) : (
              <Image height={"100%"} width={"100%"} style={{ objectFit: "contain" }} src={row?.profile_picture}></Image>
            )}
          </Flex>
        )
      }
    },
    {
      id: 'title', label: 'Title', filter: true,
    },
    {
      id: 'created_at', label: 'Created At', filter: true,
      render: (row) => {
        return (
          moment(row.created_at).format("DD MMM YYYY HH:mm")
        )
      }
    },
    {
      id: 'modified_at', label: 'Modified At', filter: true,
      render: (row) => {
        return (
          moment(row.modified_at).format("DD MMM YYYY HH:mm")
        )
      }
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              {/* <Tooltip title="Detail">
                <Link to={`/books/${row.id}`}>
                  <AntButton
                    type={'link'}
                    style={{ color: Palette.MAIN_THEME }}
                    onClick={() => {
                      setOpenNewsModal(true)
                      setSelectedNews(row)
                      setIsNewRecord(false)
                    }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:search-rounded"} />} />
                </Link>
              </Tooltip> */}
              <Tooltip title="Edit">
                <Link to={`/news/${row.id}/edit`}>
                  <AntButton
                    type={'link'}
                    style={{ color: Palette.MAIN_THEME }}
                    onClick={() => {
                    }}
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
      await News.delete(id)
      message.success('News deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this news data?",
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
      let result = await News.getAll();
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>News</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <Link to="/news/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'}>Add News</AntButton>
                </Link>
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

    </>
  )
}

export default NewsList;
