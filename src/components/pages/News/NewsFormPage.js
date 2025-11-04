import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Tag, Segmented, Switch } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import News from 'models/NewsModel';
import Upload from 'models/UploadModel';
import ReactQuill from 'react-quill';
import Placeholder from 'utils/Placeholder';
import 'react-quill/dist/quill.snow.css';
import CropperUploadForm from 'components/reusable/CropperUploadForm';

const allowedImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"]

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

export default function NewsFormPage({
  newsData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState({
    save: false,
    saveDraft: false,
  });
  const [form] = Form.useForm();
  // const bodyTest = Form.useWatch('body', form);
  const [formDisabled, setFormDisabled] = useState(false);
  const [language, setLanguage] = useState("ID");
  const [hasChanges, setHasChanges] = useState(false);

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

  const onValuesChanged = (changedValues, allValues) => {
    if (!newsData) {
      const changed = Object.keys(allValues).some(key => {
        if (key == "body" || key == "body_tl") {
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
    const changed = Object.keys(allValues).some(key => {
      if (key == "body" || key == "body_tl") {
        if (allValues[key] && allValues[key] != '<p><br></p>' && allValues[key] != newsData[key]) return true
        return false
      }
      if (!!allValues[key] && allValues[key] != newsData[key]) {
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
      form.validateFields()
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
      if (!newsData) {
        msg = 'Successfully added new News'
        result = await News.create(body);
      } else {
        msg = 'Successfully updated News'
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
        title_tl: newsData.title_tl,
        body: newsData.body,
        body_tl: newsData.body_tl,
        video_url: newsData.video_url,
        hide: newsData.hide,
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
                    onFinish={() => onSubmit(false)}
                    onValuesChange={onValuesChanged}
                    validateTrigger="onSubmit"
                    disabled={formDisabled}
                    autoComplete='off'
                  >
                    <Flex gap={"48px"} >
                      <Flex vertical style={{ width: "100%" }}>
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
                        <Form.Item
                          label={languageTag("Title")}
                          name={"title"}
                          rules={[{
                            required: true,
                          }]}
                          hidden={language !== "ID"}
                        >
                          <Input variant='filled' placeholder={Placeholder.name_news} />
                        </Form.Item>
                        <Form.Item
                          label={languageTag("Title")}
                          name={"title_tl"}
                          hidden={language === "ID"}
                        >
                          <Input variant='filled' placeholder={Placeholder.translated.name_news} />
                        </Form.Item>

                        <CropperUploadForm
                          label={"Image Cover"}
                          name={"image_cover"}
                          onImageChange={(file) => setImageFile(file)}
                          imageAspect={16 / 9}
                          helperTextTop={[
                            <>Recommended: 1920px × 1080px (Width × Height)</>,
                          ]}
                        />

                        <Form.Item
                          label={"Video Embed Link"}
                          name={"video_url"}
                          style={{
                            width: "50%"
                          }}
                          rules={[
                            {
                              type: "url",
                            }
                          ]}
                        >
                          <Input variant='filled' placeholder={Placeholder.video_embed} />
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
                          <div className={"d-flex flex-row"} style={{ gap: "12px" }}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit["save"]}>
                              {!newsData ? "Add News" : "Save News"}
                            </Button>
                            {!newsData ? (
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

