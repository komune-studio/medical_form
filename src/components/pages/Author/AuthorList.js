import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import Author from 'models/AuthorModel';
import AuthorDetailModal from './AuthorDetailModal';

const AuthorList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [openAuthorModal, setOpenAuthorModal] = useState(false)

  const columns = [
    {
      id: 'profile_picture', label: 'Profile Picture', filter: false, allowSort: false,
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
      id: 'name', label: 'Name', filter: true,
    },
    {
      id: 'biography', label: 'Biography', filter: false, allowSort: false,
      render: (row) => {
        return (
          <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.biography || '-'}
          </div>
        )
      }
    },
    {
      id: 'phone', label: 'Phone', filter: true,
      render: (row) => {
        return (
          <div>
            {row.phone || '-'}
          </div>
        )
      }
    },
    {
      id: 'email', label: 'Email', filter: true,
      render: (row) => {
        return (
          <div>
            {row.email || '-'}
          </div>
        )
      }
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              {/* Tombol Detail */}
              <Tooltip title="Detail">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenAuthorModal(true)
                    setSelectedAuthor(row)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:search-rounded"} />} />
              </Tooltip>
              
              <Tooltip title="Edit">
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
              </Tooltip>
            </Space>
          </>
        )

      })
    },
  ]

  const deleteItem = async (id) => {
    try {
      await Author.delete(id)
      message.success('Author deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this author data?",
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
      let result = await Author.getAll();
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Authors</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <Link to="/authors/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'}>Add Author</AntButton>
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

      {/* Modal untuk Detail Author */}
      <AuthorDetailModal
        open={openAuthorModal}
        author={selectedAuthor}
        onClose={() => setOpenAuthorModal(false)}
      />
    </>
  )
}

export default AuthorList;