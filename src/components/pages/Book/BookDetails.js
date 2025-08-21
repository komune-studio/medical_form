import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload, Space, Image, Divider, Tag, Card as AntCard } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import { useParams } from "react-router-dom";
import BookFormPage from "./BookFormPage";
import Book from "models/BookModel";

const BookDetails = () => {
  const [bookData, setBookData] = useState({});
  const [loading, setLoading] = useState(true);

  const params = useParams();

  const getBookData = async (id) => {
    let result = await Book.getById(id);
    console.log(result);
    let categories = result.book_categories.map((bc) => {
      return {
        ...bc.categories
      }
    })
    let formattedResult = {
      ...result,
      categories,
    }
    return formattedResult;
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      let result = await getBookData(params.id)
      setBookData(result)
      setLoading(false);
    })()
  }, [params])

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className='mb-3' md={6}>
                <Space align='center'>
                  <Link to={'/books'}>
                    <Space align='center'>
                      <Iconify icon={'material-symbols:arrow-back-rounded'} style={{ fontSize: "16px", color: "white" }}></Iconify>
                    </Space>
                  </Link>
                  <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>Book</span>
                </Space>
              </Col>
              <Col md={6} className='text-right'>
                <Link to={`${window.location.pathname}/edit`}>
                  <Button
                    onClick={() => { }}
                    size={'middle'} type={'primary'} style={{ border: "1px solid #ef6024" }}>Edit Book</Button>
                </Link>
              </Col>
            </Row>

            <Row>
              <Col style={{ marginTop: "40px" }}>
                <AntCard>
                  <Flex gap={"48px"} >
                    <Flex vertical style={{ width: "30%" }} className='text-white'>
                      {loading ? (
                        <Flex justify="center" align="center" style={{ aspectRatio: "3 / 4" }}>
                          <Spin />
                        </Flex>
                      ) : !bookData?.image_cover ? (
                        <Flex align='center' justify="center" style={{ aspectRatio: "3 / 4", borderRadius: "10px", border: "3px solid white" }}>
                          <Flex align='center' vertical style={{ padding: "24px" }} >
                            <Iconify
                              icon={"material-symbols:hide-image-outline"}
                              style={{
                                fontSize: "72px",
                                marginBottom: "5%"
                              }}
                            />
                            <Typography.Title style={{ textAlign: "center" }} level={3}>No Image</Typography.Title>
                          </Flex>
                        </Flex>
                      ) : (
                        <Image style={{ width: "100%", height: "auto", borderRadius: "4px" }} src={bookData?.image_cover ?? 'https://placehold.co/600x800/EEE/31343C'}></Image>
                      )}
                    </Flex>
                    <Flex vertical gap={0} style={{ width: "60%" }}>
                      <Space direction='vertical' size={8} className='mb-3'>
                        <Typography.Text style={{ fontSize: "40px", fontWeight: "600" }}>{bookData.title}</Typography.Text>
                        <Typography.Text style={{ fontSize: "24px" }}>{bookData.title_tl}</Typography.Text>
                        {/* <Typography.Text>{bookData.title_tl}</Typography.Text> */}
                      </Space>
                      <Space size={0} className='mb-4'>
                        <>
                          {bookData.categories?.length > 0 ? (
                            bookData.categories.map((category) => {
                              return (
                                <Tag>{category.name}</Tag>
                              )
                            })
                          ) : (
                            <></>
                          )}
                        </>
                      </Space>
                      <Divider style={{ margin: "16px 0" }}></Divider>
                      <Space direction='vertical' size={0} className='mb-4'>
                        <Space direction='vertical' size={4} className='mb-4'>
                          <Typography.Text type="secondary" style={{ fontSize: "20px" }}>Deskripsi</Typography.Text>
                          <Typography.Text style={{ fontSize: "20px" }} className='mb'>{bookData.description}</Typography.Text>
                        </Space>
                        <Space direction='vertical' size={4}>
                          <Typography.Text type="secondary" style={{ fontSize: "20px" }}>Description (Translated)</Typography.Text>
                          <Typography.Text style={{ fontSize: "20px" }}>{bookData.description_tl}</Typography.Text>
                        </Space>
                        {/* <Typography.Text style={{ fontSize: "20px" }}>{bookData.description_tl}</Typography.Text> */}
                      </Space>
                      <Space direction='vertical' size={0}>
                        <Divider style={{ margin: "16px 0" }}></Divider>
                        <Space direction='vertical' size={0} className='mb-3'>
                          <Typography.Text type="secondary" style={{ fontSize: "16px" }}>Publisher</Typography.Text>
                          <Typography.Text style={{ fontSize: "16px" }}>{bookData.publishers?.name}</Typography.Text>
                        </Space>
                        <Space direction='vertical' size={0} className='mb-3'>
                          <Typography.Text type="secondary" style={{ fontSize: "16px" }}>Illustrator</Typography.Text>
                          <Typography.Text style={{ fontSize: "16px" }}>{bookData.illustrators?.name}</Typography.Text>
                        </Space>
                        <Space direction='vertical' size={0} className='mb-3'>
                          <Typography.Text type="secondary" style={{ fontSize: "16px" }}>Translator</Typography.Text>
                          <Typography.Text style={{ fontSize: "16px" }}>{!bookData.translators ? '-' : bookData.translators?.name}</Typography.Text>
                        </Space>
                      </Space>
                    </Flex>
                  </Flex>
                </AntCard>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  )
}

export default BookDetails