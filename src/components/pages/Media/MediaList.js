import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import moment from 'moment';
import Media from 'models/MediaModel';
import Helper from 'utils/Helper';

const MediaList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedMedias, setSelectedMedias] = useState(null)
  const [openMediasModal, setOpenMediasModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'thumbnail_image', label: 'Thumbnail Image', filter: false, allowSort: false,
      render: (row) => {
        return (
          <Flex style={{ height: "100px", width: "auto", aspectRatio: "3/4", alignItems: "center", justifyContent: "center" }}>
            {!row?.thumbnail_image ? (
              <Iconify
                icon={"material-symbols:hide-image-outline"}
                style={{
                  fontSize: "48px"
                }}
              />
            ) : (
              <Image height={"100%"} width={"100%"} style={{ objectFit: "contain" }} src={row?.thumbnail_image}></Image>
            )}
          </Flex>
        )
      }
    },
    {
      id: 'title', label: 'Title', filter: true,
    },
    {
      id: 'url', label: 'URL', filter: true,
    },
    {
      id: 'created_at', label: 'Created At', filter: false,
      render: (row) => {
        return (
          moment(row.created_at).format("DD MMM YYYY HH:mm")
        )
      }
    },
    {
      id: 'modified_at', label: 'Modified At', filter: false,
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
              <Tooltip title="Open on Landing Page">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    window.open(`${Helper.redirectURL}/medias/${row?.id}`)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"mdi:external-link"} />} />
              </Tooltip>

              {/* <Tooltip title="Detail">
                <Link to={`/books/${row.id}`}>
                  <AntButton
                    type={'link'}
                    style={{ color: Palette.MAIN_THEME }}
                    onClick={() => {
                      setOpenMediasModal(true)
                      setSelectedMedias(row)
                      setIsNewRecord(false)
                    }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:search-rounded"} />} />
                </Link>
              </Tooltip> */}
              <Tooltip title="Edit">
                <Link to={`/medias/${row.id}/edit`}>
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
      await Media.delete(id)
      message.success('Medias deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this media data?",
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
      let result = await Media.getAll();
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Medias</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <Link to="/medias/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'}>Add Medias</AntButton>
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

export default MediaList;
