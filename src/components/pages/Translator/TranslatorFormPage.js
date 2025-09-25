import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Tag, Segmented, Divider } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import Translator from 'models/TranslatorModel';
import Upload from 'models/UploadModel';
import Helper from 'utils/Helper';
import Placeholder from 'utils/Placeholder';

const allowedImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"]



export default function TranslatorFormPage({
  translatorData,
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

      let msg
      if (!translatorData) {
        msg = 'Successfully added new Translator'
        result = await Translator.create(body);
      } else {
        msg = 'Successfully updated Translator'
        result = await Translator.edit(translatorData.id, body);
      }

      message.success(msg)
      history.push("/translators")
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
    if (translatorData) {
      form.setFieldsValue({
        name: translatorData.name,
        email: translatorData.email,
        phone: translatorData.phone,
        facebook: translatorData.facebook,
        instagram: translatorData.instagram,
        tiktok: translatorData.tiktok,
        twitter: translatorData.twitter,
        youtube: translatorData.youtube,
        biography: translatorData.biography,
        biography_tl: translatorData.biography_tl,
        languages: translatorData.languages,
      })

      if (translatorData.profile_picture) {
        console.log(translatorData.profile_picture)
        form.setFieldValue("profile_picture", translatorData.profile_picture);
        setImagePreviewURL(translatorData.profile_picture);
      }
    }
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [translatorData])

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className='mb-3' md={6}>
                <Space align='center'>
                  <Link to={'/translators'}>
                    <Space align='center'>
                      <Iconify icon={'material-symbols:arrow-back-rounded'} style={{ fontSize: "16px", color: "white" }}></Iconify>
                    </Space>
                  </Link>
                  <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>Translators</span>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col className='mb-3' md={12} style={{ marginTop: "40px" }}>
                <Typography.Title level={3}>{!translatorData ? "Add" : "Update"} Translator</Typography.Title>
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

                        <Divider>Personal Information</Divider>

                        <Form.Item
                          label={"Name"}
                          name={"name"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Input variant='filled' placeholder={Placeholder.name_person} />
                        </Form.Item>

                        <Form.Item
                          label={"Email"}
                          name={"email"}
                          rules={[{
                            type: 'email',
                            message: 'Please enter a valid email address!',
                          }]}
                        >
                          <Input variant='filled' placeholder={Placeholder.email} />
                        </Form.Item>

                        <Form.Item
                          label={"Phone Number"}
                          name={"phone"}
                          rules={[{
                            pattern: Helper.phoneRegEx,
                            message: 'Please enter a valid phone number!',
                          }]}
                        >
                          <Input variant='filled' placeholder={Placeholder.phone} />
                        </Form.Item>

                        <Form.Item
                          label={languageTag("Biography")}
                          name={"biography"}
                          hidden={language !== "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} placeholder={Placeholder.biography} />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Biography")}
                          name={"biography_tl"}
                          hidden={language === "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} placeholder={Placeholder.translated.biography} />
                        </Form.Item>

                        <Form.Item
                          label={"Languages"}
                          name={"languages"}
                          rules={[{
                            required: true,
                            message: 'Please enter languages!',
                          }]}
                        >
                          <Input variant='filled' placeholder={Placeholder.language} />
                        </Form.Item>

                        <Divider>Social Media Accounts (URL)</Divider>

                        <Row>
                          <Col xs={4}>
                            <Form.Item
                              label="Facebook"
                              name="facebook"
                              style={{
                                width: "100%",
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.facebook} />
                            </Form.Item>
                          </Col>

                          <Col xs={4}>
                            <Form.Item
                              label="Instagram"
                              name="instagram"
                              style={{
                                width: "100%",
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.instagram} />
                            </Form.Item>
                          </Col>

                          <Col xs={4}>
                            <Form.Item
                              label="TikTok"
                              name="tiktok"
                              style={{
                                width: "100%"
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.tiktok} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={4}>
                            <Form.Item
                              label="Twitter"
                              name="twitter"
                              style={{
                                width: "100%",
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.twitter} />
                            </Form.Item>
                          </Col>

                          <Col xs={4}>

                            <Form.Item
                              label="YouTube"
                              name="youtube"
                              style={{
                                width: "100%",
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.youtube} />
                            </Form.Item>
                          </Col>
                        </Row>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit}>
                              {!translatorData ? "Add Translator" : "Save Translator"}
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