import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Tag, Segmented, Divider, Switch } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import ReactQuill from 'react-quill';
import Author from 'models/AuthorModel';
import Upload from 'models/UploadModel';
import Helper from 'utils/Helper';
import Placeholder from 'utils/Placeholder';
import CropperUploadForm from 'components/reusable/CropperUploadForm';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    [{ 'size': ['small', false, 'large'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'align': [false, 'center', 'right', 'justify'] }, { 'list': 'bullet' }, { 'list': 'ordered' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
}

const formats = [
  'header',
  'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'align', 'list', 'bullet', 'indent',
  'link', 'image'
]

export default function AuthorFormPage({
  authorData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState({
    save: false,
    saveDraft: false
  });
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [language, setLanguage] = useState("ID");
  const [hasChanges, setHasChanges] = useState(false);

  const [imageFile, setImageFile] = useState(null);

  const uploadImage = async () => {
    try {
      let result = await Upload.uploadPicutre(imageFile);
      console.log(result)

      form.setFieldValue("profile_picture", result?.location);
      message.success("Image uploaded successfully");
    } catch (e) {
      console.log("isi e", e);
      message.error("Failed to upload image");
      throw e
    }
  }

  const onValuesChanged = (changedValues, allValues) => {
    if (!authorData) {
      const changed = Object.keys(allValues).some((key) => {
        if (key == "awards") {
          if (allValues[key] && allValues[key] != '<p><br></p>') return true
          return false
        }
        if (allValues[key]) {
          return true
        }
        return false
      })
      return setHasChanges(changed)
    }
    const changed = Object.keys(allValues).some((key) => {
      if (key == "awards") {
        if (allValues[key] && allValues[key] != '<p><br></p>' && removeHTMLTags(allValues[key])?.trim() != removeHTMLTags(bookData[key])?.trim()) return true
        return false
      }
      if (!!allValues[key] && allValues[key] != authorData[key]) {
        return true
      }
      return false
    })
    setHasChanges(changed)
  }

  const toggleLoadingSubmit = (action) => {
    setLoadingSubmit((prevLoadings) => {
      const newLoadings = { ...prevLoadings }
      newLoadings[action] = !prevLoadings[action];
      return newLoadings;
    })
  }

  const onSubmit = async (asDraft = false) => {
    if (asDraft) {
      form.validateFields();
      toggleLoadingSubmit("saveDraft")
    } else {
      toggleLoadingSubmit("save")
    }
    try {
      let result;
      let body;

      if (imageFile) {
        await uploadImage();
      }
      body = form.getFieldsValue()
      if (asDraft) {
        body["hide"] = true
      }
      console.log(body)

      let msg
      if (!authorData) {
        msg = 'Successfully added new Authors'
        result = await Author.create(body);
      } else {
        msg = 'Successfully updated Authors'
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
    } finally {
      if (asDraft) {
        toggleLoadingSubmit("saveDraft")
      } else {
        toggleLoadingSubmit("save")
      }
    }
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
        modules={modules}
        formats={formats}
        {...props}
      />
    );
  };

  useEffect(() => {
    if (authorData) {
      form.setFieldsValue({
        name: authorData.name,
        email: authorData.email,
        phone: authorData.phone,
        awards: authorData.awards,
        facebook: authorData.facebook,
        instagram: authorData.instagram,
        tiktok: authorData.tiktok,
        twitter: authorData.twitter,
        youtube: authorData.youtube,
        website_url: authorData.website_url,
        biography: authorData.biography,
        biography_tl: authorData.biography_tl,
        hide: authorData.hide,
      })

      if (authorData.profile_picture) {
        form.setFieldValue("profile_picture", authorData.profile_picture);
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
                    onFinish={() => onSubmit(false)}
                    onValuesChange={onValuesChanged}
                    validateTrigger="onSubmit"
                    disabled={formDisabled}
                    autoComplete='off'
                  >
                    <Flex gap={"48px"} >
                      <Flex vertical style={{ width: "60%" }}>
                        <Flex justify='space-between' align='center'>
                          <Flex align='center' gap={12}>
                            <Typography.Text>
                              Mark as draft
                            </Typography.Text>
                            <Form.Item
                              label={"Mark as draft"}
                              name={"hide"}
                              valuePropName='checked'
                              noStyle
                            >
                              <Switch />
                            </Form.Item>
                          </Flex>

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
                          <Input.TextArea
                            variant='filled'
                            rows={4}
                            placeholder={Placeholder.biography}
                          />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Biography")}
                          name={"biography_tl"}
                          hidden={language === "ID"}
                        >
                          <Input.TextArea
                            variant='filled'
                            rows={4}
                            placeholder={Placeholder.translated.biography}
                          />
                        </Form.Item>
                        <Form.Item
                          label={"Awards"}
                          name={"awards"}
                        >
                          <FormQuill placeholder="Write something here..." />
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

                          <Col xs={4}>

                            <Form.Item
                              label="Website"
                              name="website_url"
                              style={{
                                width: "100%",
                              }}
                            >
                              <Input variant='filled' placeholder={Placeholder.website} />
                            </Form.Item>
                          </Col>
                        </Row>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"} style={{ gap: "12px" }}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit["save"]}>
                              {!authorData ? "Add Authors" : "Save Authors"}
                            </Button>
                            {!authorData ? (
                              <Button size="sm" type='default' onClick={() => onSubmit(true)} loading={loadingSubmit["saveDraft"]}>
                                {"Save As Draft"}
                              </Button>
                            ) : <></>
                            }
                          </div>
                        ) : (
                          <></>
                        )}
                      </Flex>
                      <Flex vertical style={{ width: "30%" }} className='text-white'>
                        <CropperUploadForm
                          label={"Profile Picture"}
                          name={"profile_picture"}
                          onImageChange={(file) => setImageFile(file)}
                          imageAspect={2 / 3}
                          helperTextTop={[
                            <>Recommended: 400px × 600px (Width × Height)</>,
                          ]}
                        />
                      </Flex>
                    </Flex>
                  </Form>
                )}
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
      <Prompt
        when={hasChanges && !(loadingSubmit["save"] || loadingSubmit["saveDraft"])}
        message={"Are you sure you want to leave before saving?"}
      />
    </>
  );
}

