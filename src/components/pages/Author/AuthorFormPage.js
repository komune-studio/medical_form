import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Tag, Segmented } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import Author from 'models/AuthorModel';
import Upload from 'models/UploadModel';

const allowedImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"]

export default function AuthorFormPage({
  authorData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [language, setLanguage] = useState("ID");

  const [imagePreviewURL, setImagePreviewURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const uploadImage = async () => {
    try {
      let result = await Upload.uploadPicutre(imageFile);
      console.log(result)

      form.setFieldValue("profile_picture", result?.location);
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

      let msg = 'Successfully created Authors'
      if (!authorData) {
        result = await Author.create(body);
      } else {
        result = await Author.edit(authorData.id, body);
      }

      message.success(msg)
      history.push("/authors")
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

  useEffect(() => {
    if (authorData) {
      form.setFieldsValue({
        name: authorData.name,
        biography: authorData.biography,
        biography_tl: authorData.biography_tl,
      })

      if (authorData.profile_picture) {
        console.log(authorData.profile_picture)
        form.setFieldValue("profile_picture", authorData.profile_picture);
        setImagePreviewURL(authorData.profile_picture);
      }
    }
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [authorData])

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className='mb-3' md={6}>
                <Space align='center'>
                  <Link to={'/authors'}>
                    <Space align='center'>
                      <Iconify icon={'material-symbols:arrow-back-rounded'} style={{ fontSize: "16px", color: "white" }}></Iconify>
                    </Space>
                  </Link>
                  <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>Authors</span>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col className='mb-3' md={12} style={{ marginTop: "40px" }}>
                <Typography.Title level={3}>{!authorData ? "Add" : "Update"} Author</Typography.Title>
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
                      <Flex vertical style={{ width: "60%" }}>
                        <Flex justify="flex-end">
                          <Segmented
                            value={language}
                            style={{ marginBottom: 8 }}
                            onChange={setLanguage}
                            options={['ID', 'EN']}
                          />
                        </Flex>
                        <Form.Item
                          label={"Name"}
                          name={"name"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Input variant='filled' />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Biography")}
                          name={"biography"}
                          hidden={language !== "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Biography")}
                          name={"biography_tl"}
                          hidden={language === "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} />
                        </Form.Item>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit}>
                              {!authorData ? "Add Authors" : "Save Authors"}
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </Flex>
                      <Flex vertical style={{ width: "30%" }} className='text-white'>
                        <Form.Item
                          label={"Profile Picture"}
                          name={"profile_picture"}
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
                            <button style={{ border: "none", background: "none", padding: "24px", minHeight: "200px", width: "100%", ...(formDisabled && { cursor: "not-allowed" }) }} type='button'>
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
                            <Space wrap size={8}>
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

