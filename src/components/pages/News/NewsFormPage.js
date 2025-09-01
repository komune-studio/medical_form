import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Tag, Segmented } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import News from 'models/NewsModel';
import Upload from 'models/UploadModel';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const allowedImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"]

export default function NewsFormPage({
  newsData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  // const bodyTest = Form.useWatch('body', form);
  const [formDisabled, setFormDisabled] = useState(false);
  const [language, setLanguage] = useState("ID");

  const [imagePreviewURL, setImagePreviewURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const uploadImage = async () => {
    try {
      let result = await Upload.uploadPicutre(imageFile);
      console.log(result)

      form.setFieldValue("image_cover", result?.location);
      setImagePreviewURL(result?.location)
      message.success("Image uploaded successfully");
    } catch (e) {
      console.log("isi e", e);
      message.error("Failed to upload image");
      throw e
    }
  }

  const onUploadChange = ({ file }) => {
    const isImage = allowedImageType.includes(file.type);
    if (!isImage) {
      message.error("File must be image type " +
        allowedImageType.map((type) => type.slice(6).toUpperCase()).join(", "))
      return Upload.LIST_IGNORE;
    }
    const lessThan5MB = file.size / 1024 / 1024 < 5;
    if (!lessThan5MB) {
      message.error("Image must be smaller than 5MB.")
      return Upload.LIST_IGNORE;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewURL(url);
  }

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      let result;
      let body;

      if (imageFile) {
        await uploadImage();
      }
      body = form.getFieldsValue()
      console.log(body)

      let msg = 'Successfully created News'
      if (!newsData) {
        result = await News.create(body);
      } else {
        result = await News.edit(newsData.id, body);
      }

      message.success(msg)
      history.push("/news")
    } catch (e) {
      console.log(e)
      let errorMessage = "An Error Occured"
      await swal.fire({
        title: 'Error',
        text: e.error_message ? e.error_message : errorMessage,
        icon: 'error',
        confirmButtonText: 'Okay'
      })
    }
    setLoadingSubmit(false);
  }

  const languageTag = (text, tagColor = Palette.MAIN_THEME) => (
    <span>
      {text} | {language}{" "}
      <Tag color={tagColor} style={{ fontSize: '10px', marginLeft: '8px' }}>
        Multi-Language
      </Tag>
    </span>
  );

  const FormQuill = ({ value, onChange, placeholder, ...props }) => {
    return (
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          height: '480px',
          marginBottom: '84px'
        }}
        {...props}
      />
    );
  };

  const FormLabelSecondaryText = (label) => {
    return <Typography.Text type='secondary'>{label}</Typography.Text>
  }

  // To watch form real update
  // useEffect(() => {
  //   console.log("body real update: ", bodyTest)
  // }, [bodyTest])

  useEffect(() => {
    if (newsData) {
      form.setFieldsValue({
        title: newsData.title,
        body: newsData.body,
        body_tl: newsData.body_tl,
      })

      if (newsData.image_cover) {
        console.log(newsData.image_cover)
        form.setFieldValue("image_cover", newsData.image_cover);
        setImagePreviewURL(newsData.image_cover);
      }
    }
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [newsData])

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className='mb-3' md={6}>
                <Space align='center'>
                  <Link to={'/news'}>
                    <Space align='center'>
                      <Iconify icon={'material-symbols:arrow-back-rounded'} style={{ fontSize: "16px", color: "white" }}></Iconify>
                    </Space>
                  </Link>
                  <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>News</span>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col className='mb-3' md={12} style={{ marginTop: "40px" }}>
                <Typography.Title level={3}>{!newsData ? "Add" : "Update"} News</Typography.Title>
              </Col>
            </Row>
            <Row>
              <Col>
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
                    disabled={formDisabled}
                    autoComplete='off'
                  >
                    <Flex gap={"48px"} >
                      <Flex vertical style={{ width: "100%" }}>
                        <Flex justify="flex-end">
                          <Segmented
                            value={language}
                            style={{ marginBottom: 8 }}
                            onChange={setLanguage}
                            options={['ID', 'EN']}
                          />
                        </Flex>
                        <Form.Item
                          label={languageTag("Title")}
                          name={"title"}
                          rules={[{
                            required: true,
                          }]}
                          hidden={language !== "ID"}
                        >
                          <Input variant='filled' />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Title")}
                          name={"title_tl"}
                          hidden={language === "ID"}
                        >
                          <Input variant='filled' />
                        </Form.Item>

                        <Form.Item
                          label={"Image Cover"}
                          name={"image_cover"}
                        >
                          <AntUpload.Dragger
                            name="avatar"
                            listType="picture"
                            className="avatar-uploader"
                            showUploadList={false}
                            multiple={false}
                            accept={allowedImageType.join(",")}
                            onChange={onUploadChange}
                            beforeUpload={() => false}
                          >
                            <button style={{ border: "none", background: "none", padding: "24px", minHeight: "200px", maxWidth: "100%", ...(formDisabled && { cursor: "not-allowed" }) }} type='button'>
                              <Flex vertical align='center'>
                                {imagePreviewURL ? (
                                  <>
                                    <img src={imagePreviewURL} style={{ width: "100%", height: "auto" }} />
                                  </>
                                ) : (
                                  <>
                                    <Iconify icon={"mdi:tray-upload"} style={{ fontSize: "48px" }} />
                                    <Typography.Text style={{ display: "inline-block", marginTop: "8px" }}>
                                      Click or drag here to upload image.
                                    </Typography.Text>
                                  </>
                                )}
                              </Flex>
                            </button>
                          </AntUpload.Dragger>
                          <Flex justify='start' style={{ marginTop: "4px" }}>
                            <Space size={8}>
                              <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
                                Max image size 5MB
                              </Typography.Text>
                              <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
                                -
                              </Typography.Text>
                              <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block" }}>
                                JPG, JPEG, PNG, WEBP supported
                              </Typography.Text>
                            </Space>
                          </Flex>
                        </Form.Item>
                        <Form.Item
                          label={FormLabelSecondaryText("Additional Content")}
                          style={{
                            marginBottom: 0
                          }}
                        >
                          <Flex style={{ columnGap: "12px" }}>
                            <Flex style={{ flexGrow: 1 }}>
                              <Form.Item
                                label={"Youtube Link"}
                                name={"youtube_url"}
                                style={{
                                  width: "100%"
                                }}
                                rules={[
                                  {
                                    type: "url",
                                  }
                                ]}
                              >
                                <Input variant='filled' />
                              </Form.Item>
                            </Flex>
                            <Flex style={{ flexGrow: 1 }}>
                              <Form.Item
                                label={"Spotify Link"}
                                name={"spotify_url"}
                                style={{
                                  width: "100%"
                                }}
                                rules={[
                                  {
                                    type: "url",
                                  }
                                ]}
                              >
                                <Input variant='filled' />
                              </Form.Item>
                            </Flex>
                          </Flex>
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Body")}
                          name={"body"}
                          hidden={language !== "ID"}
                          rules={[
                            {
                              required: true
                            }
                          ]}
                        >
                          <FormQuill placeholder="Write something here..." />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Body")}
                          name={"body_tl"}
                          hidden={language === "ID"}
                        >
                          <FormQuill placeholder="Write something here..." />
                        </Form.Item>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit}>
                              {!newsData ? "Add News" : "Save News"}
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </Flex>
                      <Flex vertical style={{ width: "30%" }} className='text-white'>
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

