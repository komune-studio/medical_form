import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import Book from 'models/BookModel';
import BookCategory from 'models/BookCategoryModel';
import Helper from 'utils/Helper';

const BookList = () => {

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null)
  const [openBookModal, setOpenBookModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)

  const columns = [
    {
      id: 'image_cover', label: 'Cover Image', filter: false, allowSort: false,
      render: (row) => {
        return (
          <Flex style={{ height: "100px", width: "auto", aspectRatio: "3/4", alignItems: "center", justifyContent: "center" }}>
            {!row?.image_cover ? (
              <Iconify
                icon={"material-symbols:hide-image-outline"}
                style={{
                  fontSize: "48px"
                }}
              />
            ) : (
              <Image height={"100%"} width={"100%"} style={{ objectFit: "contain" }} src={row?.image_cover}></Image>
            )}
          </Flex>
        )
      }
    },
    {
      id: 'title', label: 'Title', filter: true,
      // render: (row) => (
      //   textToUppercase(row.title)
      // )
    },
    {
      id: 'authors', label: 'Authors', filter: true,
      render: (row) => (
        <Space wrap size={4} style={{ maxWidth: "200px" }}>
          {row?.book_authors && row?.book_authors?.length > 0 ? (
            row?.book_authors?.map((ba) => (
              `- ${ba.authors.name}`
            ))
          ) : (
            '-'
          )}
        </Space>
      )
    },
    {
      id: 'publisher', label: 'Publisher', filter: true,
      render: (row) => row?.publishers ? row?.publishers.name : '-'
    },
    {
      id: 'categories', label: 'Categories', filter: true, allowSort: false,
      render: (row) => (
        <Space wrap size={4} style={{ maxWidth: "200px" }}>
          {row?.book_categories && row?.book_categories?.length > 0 ? (
            row?.book_categories?.map((bc) => (
              <Tag>{bc.categories.name}</Tag>
            ))
          ) : (
            '-'
          )}
        </Space>
      )
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
                    window.open(`${Helper.redirectURL}/books/details/${row?.id}`)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"mdi:external-link"} />} />
              </Tooltip>

              <Tooltip title="Detail">
                <Link to={`/books/${row.id}`}>
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
                </Link>
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
      await Book.delete(id)
      message.success('Book deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this book data?",
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
      let result = await Book.getAllWithCategoriesAndAuthors();
      let formattedResult = result.map((value) => {
        let bookAuthorsJoined = value.book_authors.map((book_author) => book_author.authors.name).join(",");
        let bookCategoriesJoined = value.book_categories.map((book_category) => book_category.categories.name).join(",");
        return {
          ...value,
          authors: bookAuthorsJoined,
          categories: bookCategoriesJoined,
        }
      })
      console.log(formattedResult[0]?.book_authors?.length)
      setDataSource(formattedResult)
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
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Books</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <Link to="/books/create">
                  <AntButton
                    onClick={() => { }}
                    size={'middle'} type={'primary'}>Add Book</AntButton>
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
