import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Segmented, Tag } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import User from 'models/UserModel';
import Publisher from 'models/PublisherModel';
import Ilustrator from 'models/IlustratorModel';
import Category from 'models/CategoryModel';
import Translator from 'models/TranslatorModel';
import Book from 'models/BookModel';
import BookCategory from 'models/BookCategoryModel';
import Upload from 'models/UploadModel';
import Author from 'models/AuthorModel';
import BookAuthor from 'models/BookAuthorModel';

const allowedImageType = ["image/jpg", "image/jpeg", "image/png", "image/webp"]

export default function BookFormPage({
  bookData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [initialBookCategories, setInitialBookCategories] = useState([]);
  const [initialBookAuthors, setInitialBookAuthors] = useState([]);
  const [language, setLanguage] = useState("ID");

  const [publishers, setPublishers] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [ilustrators, setIlustrators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [imagePreviewURL, setImagePreviewURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const getPublishersData = async () => {
    try {
      let result = await Publisher.getAll()
      setPublishers(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getTranslatorsData = async () => {
    try {
      let result = await Translator.getAll()
      setTranslators(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getIlustratorsData = async () => {
    try {
      let result = await Ilustrator.getAll()
      setIlustrators(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getCategoriesData = async () => {
    try {
      let result = await Category.getAll();
      setCategories(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getAuthorsData = async () => {
    try {
      let result = await Author.getAll();
      setAuthors(result.map((r) => ({
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
      getIlustratorsData(),
      getCategoriesData(),
      getAuthorsData(),
    ])
    setLoading(false);
  }

  const selectFilterFunction = (input, option) => {
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  }

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
      // console.log("Body: ", body)

      let msg = 'Successfully created Book'
      if (!bookData) {
        result = await Book.create(body);
      } else {
        result = await Book.edit(bookData.id, body);
      }

      let bookCategoryUpdatePromises = [];
      if (!body.categories) body.categories = []
      for (let bcId of body.categories) {
        if (initialBookCategories.length > 0 && initialBookCategories.includes(bcId)) continue;
        bookCategoryUpdatePromises.push(new Promise((resolve, reject) => {
          try {
            let res = BookCategory.create({
              book_id: result.id,
              category_id: bcId,
            });
            resolve(res)
          } catch (err) {
            reject(err)
          }
        }))
      }
      for (let ibcId of initialBookCategories) {
        if (body.categories && body.categories.includes(ibcId)) continue;
        bookCategoryUpdatePromises.push(new Promise((resolve, reject) => {
          try {
            let res = BookCategory.delete(parseInt(result.id), parseInt(ibcId));
            resolve(res);
          } catch (err) {
            reject(err)
          }
        }))
      }

      let bookAuthorUpdatePromises = [];
      if (!body.authors) body.authors = []
      for (let baId of body.authors) {
        if (initialBookAuthors.length > 0 && initialBookAuthors.includes(baId)) continue;
        bookAuthorUpdatePromises.push(new Promise((resolve, reject) => {
          try {
            let res = BookAuthor.create({
              book_id: result.id,
              author_id: baId,
            });
            resolve(res)
          } catch (err) {
            reject(err)
          }
        }))
      }
      for (let ibaId of initialBookAuthors) {
        if (body.authors && body.authors.includes(ibaId)) continue;
        bookAuthorUpdatePromises.push(new Promise((resolve, reject) => {
          try {
            let res = BookAuthor.delete(parseInt(result.id), parseInt(ibaId));
            resolve(res);
          } catch (err) {
            reject(err)
          }
        }))
      }

      await Promise.all([...bookCategoryUpdatePromises, ...bookAuthorUpdatePromises]);

      message.success(msg)
      history.push("/books")
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
      setLoadingSubmit(true);
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

      let categoryIds = bookData.categories?.map((c) => {
        return c.id
      })
      setInitialBookCategories(categoryIds);
      form.setFieldValue("categories", categoryIds);

      let authorIds = bookData.authors?.map((a) => {
        return a.id
      })
      setInitialBookAuthors(authorIds);
      form.setFieldValue("authors", authorIds);

      if (bookData.image_cover) {
        console.log(bookData.image_cover)
        form.setFieldValue("image_cover", bookData.image_cover);
        setImagePreviewURL(bookData.image_cover);
      }
    }
    if (disabled) {
      setFormDisabled(disabled);
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
                <Space align='center'>
                  <Link to={'/books'}>
                    <Space align='center'>
                      <Iconify icon={'material-symbols:arrow-back-rounded'} style={{ fontSize: "16px", color: "white" }}></Iconify>
                    </Space>
                  </Link>
                  <span style={{ fontWeight: "bold", fontSize: "1.1em" }}>Books</span>
                </Space>
              </Col>
            </Row>
            <Row>
              <Col className='mb-3' md={12} style={{ marginTop: "40px" }}>
                <Typography.Title level={3}>{!bookData ? "Add" : "Update"} Book</Typography.Title>
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
                    <Flex gap={"48px"}>
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
                          label={languageTag("Title")}
                          name="title"
                          rules={[{
                            required: true,
                          }]}
                          hidden={language !== "ID"} 
                        >
                          <Input variant='filled' />
                        </Form.Item>

                        <Form.Item
                          label={languageTag("Description")}
                          name="description"
                          hidden={language !== "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} />
                        </Form.Item >

                        <Form.Item
                          label={languageTag("Title")}
                          name="title_tl"
                          hidden={language === "ID"}
                        >
                          <Input variant='filled' />
                        </Form.Item>

                        <Form.Item
                          label={languageTag("Description")}
                          name="description_tl"
                          hidden={language === "ID"}
                        >
                          <Input.TextArea variant='filled' rows={4} />
                        </Form.Item>
                        <Form.Item
                          label={"Authors"}
                          name={"authors"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select mode='multiple' options={authors} variant='filled' filterOption={selectFilterFunction} />
                        </Form.Item>
                        <Form.Item
                          label={"Publisher"}
                          name={"publisher_id"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select showSearch={true} options={publishers} variant='filled' filterOption={selectFilterFunction} />
                        </Form.Item>
                        <Form.Item
                          label={"Illustrator"}
                          name={"illustrator_id"}
                          rules={[{
                            required: true,
                          }]}
                        >
                          <Select showSearch={true} options={ilustrators} variant='filled' filterOption={selectFilterFunction} />
                        </Form.Item>
                        <Form.Item
                          label={"Translator"}
                          name={"translator_id"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select showSearch={true} options={translators} variant='filled' filterOption={selectFilterFunction} />
                        </Form.Item>
                        <Form.Item
                          label={"Categories"}
                          name={"categories"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select mode='multiple' options={categories} variant='filled' filterOption={selectFilterFunction} />
                        </Form.Item>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit}>
                              {!bookData ? "Add Book" : "Save Book"}
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </Flex>
                      <Flex vertical style={{ width: "30%" }} className='text-white'>
                        <Form.Item
                          label={"Cover Image"}
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
                            <button style={{ border: "none", background: "none", padding: "24px", minHeight: "200px", width: "100%", ...(formDisabled && { cursor: "not-allowed" }) }} type='button'>
                              <Flex vertical align='center'>
                                {imagePreviewURL ? (
                                  <>
                                    <img src={imagePreviewURL} style={{ width: "100%", height: "auto" }} />
                                    <Typography.Text type="secondary" style={{ fontSize: "12px", display: "inline-block", marginTop: "12px" }}>
                                      Max image size 5MB.
                                    </Typography.Text>
                                  </>
                                ) : (
                                  <>
                                    <Iconify icon={"mdi:tray-upload"} style={{ fontSize: "48px" }} />
                                    <Typography.Text style={{ display: "inline-block", marginTop: "8px" }}>
                                      Click or drag here to upload image. <br />
                                      <Typography.Text type='secondary' style={{ fontSize: "12px", display: "inline-block", marginTop: "8px" }}>
                                        Max image size 5MB.
                                      </Typography.Text>
                                    </Typography.Text>
                                  </>
                                )}
                              </Flex>
                            </button>
                          </AntUpload.Dragger>
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

