import { Space, Button as AntButton, Tooltip, Modal, message, Image } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import moment from "moment"
import { CSVLink } from "react-csv";

const BookList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null)
  const [openBookModal, setOpenBookModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'image_cover', label: 'Cover Image', filter: false,
      render: (row) => {
        return <Image height={100} width={150} style={{ objectFit: "contain" }} src={row.image_cover}></Image>
      }
    },
    {
      id: 'title', label: 'Title', filter: true,
    },
    {
      id: 'publisher', label: 'Publisher', filter: true,
    },
    {
      id: 'categories', label: 'Categories', filter: false,
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              <Tooltip title="Detail">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenBookModal(true)
                    setSelectedBook(row)
                    setIsNewRecord(false)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:search-rounded"} />} />
              </Tooltip>
              <Tooltip title="Edit">
                <Link to={`/books/${row.id}/edit`}>
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
              <Tooltip title="Hapus">
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
      // await User.delete(id)
      message.success('Buku telah dihapus')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Apakah Anda yakin ingin menghapus data Buku ini?",
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
          id: 1,
          title: "a",
          description: "aaaaaa",
          image_cover: "https://youtooz.com/cdn/shop/products/sb_nailonheadpatrick_characterai_el_779x1000trim_min-46a6.png?v=1682023304"
        },
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Book</div>
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

                <Link to="/books/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'} style={{ border: "1px solid #ef6024" }}>Add Book</AntButton>
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

      {/* <BookFormModal
        isOpen={openBookModal}
        isNewRecord={isNewRecord}
        bookData={selectedBook}
        close={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenBookModal(false)
        }}
      /> */}

    </>
  )
}

export default BookList;
