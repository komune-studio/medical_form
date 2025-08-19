import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
// import Form from 'react-bootstrap/Form';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import User from 'models/UserModel';

export default function BookFormPage({
  bookData
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const [publishers, setPublishers] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [illustrators, setIllustrators] = useState([]);
  const [categories, setCategories] = useState([]);

  const [imagePreview, setImagePreview] = useState(null);

  const getPublishersData = async () => {
    try {
      // let result = await User.getAll()
      let result = [
        {
          id: 1,
          name: "pub1",
        },
        {
          id: 2,
          name: "pub2",
        },
      ]
      setPublishers(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getTranslatorsData = async () => {
    try {
      // let result = await User.getAll()
      let result = [
        {
          id: 1,
          name: "tra1",
        },
        {
          id: 2,
          name: "tra2",
        },
      ]
      setTranslators(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getIllustratorsData = async () => {
    try {
      // let result = await User.getAll()
      let result = [
        {
          id: 1,
          name: "ill1",
        },
        {
          id: 2,
          name: "ill2",
        },
      ]
      setIllustrators(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getCategoriesData = async () => {
    try {
      // let result = await User.getAll()
      let result = [
        {
          id: 1,
          name: "cat1",
        },
        {
          id: 2,
          name: "cat2",
        },
      ]
      setCategories(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const initializeData = async () => {
    setLoading(true);
    await Promise.all([
      getPublishersData(),
      getTranslatorsData(),
      getIllustratorsData(),
      getCategoriesData(),
    ])
    setLoading(false);
  }

  const handleUpload = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[fileList.length - 1].originFileObj;
      if (file) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        form.setFieldValue("image_cover", url);
      }
    } else {
      setImagePreview(null);
    }
  }

  const onImageBeforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }
    return false;
  }

  const onSubmit = async () => {
    try {
      let result;
      let body = form.getFieldsValue()
      console.log(body)
      let msg = 'Successfully created Book'
      // await UserModel.create(body)

      message.success(msg)
      history.push("/books")
    } catch (e) {
      console.log(e)
      let errorMessage = "An Error Occured"
      await swal.fire({
        title: 'Error',
        text: e.error_message ? e.error_message : "An Error Occured",
        icon: 'error',
        confirmButtonText: 'Okay'
      })
    }
  }

  useEffect(() => {
    (async () => {
      await initializeData();
    })()
  }, [])

  useEffect(() => {
    if (bookData) {
      form.setFieldsValue({
        title: bookData.title,
        title_tl: bookData.title_tl,
        description: bookData.description,
        description_tl: bookData.description_tl,
        publisher_id: bookData.publisher_id,
        illustrator_id: bookData.illustrator_id,
        translator_id: bookData.translator_id,
      })
      console.log(bookData);
      if (bookData.image_cover) {
        console.log(bookData.image_cover)
        form.setFieldValue("image_cover", bookData.image_cover);
        setImagePreview(bookData.image_cover);
      }
    }
  }, [bookData])

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
              <Col md="12">
                <Link to={'/books'}>
                  <Flex align='center' gap={"8px"} className='text-white'>
                    <Iconify icon={'material-symbols:arrow-back'}></Iconify>
                    <Typography.Text
                      style={{
                        color: "inherit",
                        fontSize: "16px",
                      }}>
                      Back
                    </Typography.Text>
                  </Flex>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col style={{ marginTop: "40px" }}>
                {loading ? (
                  <Flex justify="center" align="center">
                    <Spin />
                  </Flex>
                ) : (
                  <Form
                    layout='vertical'
                    form={form}
                    onFinish={onSubmit}
                    validateTrigger="onSubmit"
                  >
                    <Flex gap={"48px"} >
                      <Flex vertical style={{ width: "60%" }}>
                        <Form.Item
                          label={"Title"}
                          name={"title"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={"Title (Translated)"}
                          name={"title_tl"}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={"Description"}
                          name={"description"}
                        >
                          <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                          label={"Description (Translated)"}
                          name={"description_tl"}
                        >
                          <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                          label={"Publisher"}
                          name={"publisher_id"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select options={publishers} />
                        </Form.Item>
                        <Form.Item
                          label={"Illustrator"}
                          name={"illustrator_id"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select options={illustrators} />
                        </Form.Item>
                        <Form.Item
                          label={"Translator"}
                          name={"translator_id"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select options={translators} />
                        </Form.Item>
                        <Form.Item
                          label={"Categories"}
                          name={"categories"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select mode='tags' options={categories} />
                        </Form.Item>

                        <div className={"d-flex flex-row"}>
                          <Button size="sm" type='primary' variant="primary" htmlType='submit'>
                            Add
                          </Button>
                        </div>
                      </Flex>
                      <Flex vertical style={{ width: "40%" }} className='text-white'>
                        <Form.Item
                          label={"Cover Image"}
                          name={"image_cover"}
                        >
                          <Upload.Dragger
                            name="avatar"
                            listType="picture"
                            className="avatar-uploader"
                            showUploadList={false}
                            onChange={handleUpload}
                            beforeUpload={onImageBeforeUpload}
                          >
                            <button style={{ border: "none", background: "none", padding: "24px", minHeight: "200px" }} type='button'>
                              {imagePreview ? (
                                <img src={imagePreview} style={{ maxWidth: "100%" }} />
                              ) : (
                                <Flex vertical align='center'>
                                  <Iconify icon={"mdi:tray-upload"} style={{ fontSize: "48px" }} />
                                  Click or drag here to upload file.
                                </Flex>
                              )}
                            </button>
                          </Upload.Dragger>
                        </Form.Item>
                      </Flex>
                    </Flex>
                  </Form>
                )}
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

