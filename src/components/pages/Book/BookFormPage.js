import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography, Form, Input, Select, Upload as AntUpload, Space, Segmented, Tag, DatePicker, Checkbox, Divider, InputNumber, Tooltip, Switch } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import User from 'models/UserModel';
import Publisher from 'models/PublisherModel';
import Illustrator from 'models/IllustratorModel';
import Category from 'models/CategoryModel';
import Translator from 'models/TranslatorModel';
import Book from 'models/BookModel';
import BookCategory from 'models/BookCategoryModel';
import Upload from 'models/UploadModel';
import Author from 'models/AuthorModel';
import BookAuthor from 'models/BookAuthorModel';
import Placeholder from 'utils/Placeholder';
import dayjs from 'dayjs';
import LiteraryAgencies from 'models/LiteraryAgenciesModel';
import CropperUploadForm from 'components/reusable/CropperUploadForm';
import ReactQuill from 'react-quill';
import Helper from 'utils/Helper';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'clean'],
  ],
}

const formats = [
  'bold', 'italic', 'underline'
]

export default function BookFormPage({
  bookData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState({
    save: false,
    saveDraft: false
  });
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [initialBookCategories, setInitialBookCategories] = useState([]);
  const [initialBookAuthors, setInitialBookAuthors] = useState([]);
  const [initialAvailableLanguages, setInitialAvailableLanguages] = useState([]);
  const [language, setLanguage] = useState("ID");
  const [hasChanges, setHasChanges] = useState(false);

  const [publishers, setPublishers] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [illustrators, setIllustrators] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

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

  const getIllustratorsData = async () => {
    try {
      let result = await Illustrator.getAll()
      setIllustrators(result.map((r) => ({
        value: r.id,
        label: r.name,
      })))
    } catch (e) {
    }
  }

  const getAgenciesData = async () => {
    try {
      let result = await LiteraryAgencies.getAll()
      setAgencies(result.map((r) => ({
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
      getIllustratorsData(),
      getAgenciesData(),
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
      message.success("Image uploaded successfully");
    } catch (e) {
      console.log("isi e", e);
      message.error("Failed to upload image");
    }
  }

  const onValuesChanged = (changedValues, allValues) => {
    if (!bookData) {
      const changed = Object.keys(allValues).some((key) => {
        if (key == "authors" || key == "categories" || key == "available_languages") {
          if (allValues[key] != undefined && allValues[key]?.length > 0) return true
          return false
        }
        if (key == "release_date") {
          if (allValues[key]) return true
          return false
        }
        if (key == "description" || key == "description_tl") {
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
      if (key == "authors") {
        if (!allValues[key]) allValues[key] = [];
        if (allValues[key].length != initialBookAuthors.length) return true
        if (allValues[key].some(id => !initialBookAuthors.includes(id))) return true
        return false
      }
      if (key == "categories") {
        if (!allValues[key]) allValues[key] = [];
        if (allValues[key].length != initialBookCategories.length) return true
        if (allValues[key].some(id => !initialBookCategories.includes(id))) return true
        return false
      }
      if (key == "available_languages") {
        if (!allValues[key]) allValues[key] = [];
        if (allValues[key].length != initialAvailableLanguages.length) return true
        if (allValues[key].some(language => !initialAvailableLanguages.includes(language))) return true
        return false
      }
      if (key == "release_date") {
        if (allValues[key] && !dayjs(allValues[key]).isSame(bookData[key])) return true
        return false
      }
      if (key == "description" || key == "description_tl") {
        if (allValues[key] && allValues[key] != '<p><br></p>' && Helper.removeHTMLTags(allValues[key])?.trim() != Helper.removeHTMLTags(bookData[key])?.trim()) return true
        return false
      }
      if (!!allValues[key] && allValues[key] != bookData[key]) {
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
      console.log("Body: ", body)

      let msg;
      if (!bookData) {
        msg = 'Successfully added new Book';
        result = await Book.create(body);
      } else {
        msg = 'Successfully updated Book';
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
          height: '160px',
          marginBottom: '42px'
        }}
        modules={modules}
        formats={formats}
        {...props}
      >
      </ReactQuill>
    );
  };

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
        literary_agency_id: bookData.literary_agency_id,
        isbn: bookData.isbn,
        total_page: bookData.total_page,
        initial_language: bookData.initial_language,
        translation_rights: bookData.translation_rights,
        contact_person_name: bookData.contact_person_name,
        contact_person_email: bookData.contact_person_email,
        hide: bookData.hide,
      })

      if (bookData.available_languages) {
        setInitialAvailableLanguages(bookData.available_languages)
        form.setFieldValue("available_languages", bookData.available_languages)
      }

      if (bookData.release_date) {
        form.setFieldValue("release_date", dayjs(bookData.release_date))
      }

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
        form.setFieldValue("image_cover", bookData.image_cover);
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
                    onFinish={() => onSubmit(false)}
                    onValuesChange={onValuesChanged}
                    validateTrigger="onSubmit"
                    disabled={formDisabled}
                    autoComplete='off'
                  >
                    <Flex gap={"48px"}>
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

                        <Divider>General Information</Divider>

                        <Form.Item
                          label={languageTag("Title")}
                          name="title"
                          rules={[{
                            required: true,
                          }]}
                          hidden={language !== "ID"}
                        >
                          <Input variant='filled' placeholder={Placeholder.name_book} />
                        </Form.Item>

                        <Form.Item
                          label={languageTag("Title")}
                          name="title_tl"
                          hidden={language === "ID"}
                        >
                          <Input variant='filled' placeholder={Placeholder.translated.name_book} />
                        </Form.Item>

                        {/* <Form.Item
                          label={languageTag("Description")}
                          name="description"
                          hidden={language !== "ID"}
                        >
                          <Input.TextArea
                            variant='filled'
                            rows={4}
                            placeholder={Placeholder.description}
                          />
                        </Form.Item >

                        <Form.Item
                          label={languageTag("Description")}
                          name="description_tl"
                          hidden={language === "ID"}
                        >
                          <Input.TextArea
                            variant='filled'
                            rows={4}
                            placeholder={Placeholder.translated.description}
                          />
                        </Form.Item> */}

                        <Form.Item
                          label={languageTag("Description")}
                          name={"description"}
                          hidden={language !== "ID"}
                        >
                          <FormQuill placeholder={Placeholder.description} />
                        </Form.Item>

                        <Form.Item
                          label={languageTag("Description")}
                          name={"description_tl"}
                          hidden={language === "ID"}
                        >
                          <FormQuill placeholder={Placeholder.translated.description} />
                        </Form.Item>

                        <Form.Item
                          label={"Authors"}
                          name={"authors"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select
                            mode='multiple'
                            options={authors}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_author}
                          />
                        </Form.Item>

                        <Form.Item
                          label={"Publisher"}
                          name={"publisher_id"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select
                            showSearch={true}
                            options={publishers}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_publisher}
                          />
                        </Form.Item>

                        <Form.Item
                          label={"Categories"}
                          name={"categories"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select
                            mode='multiple'
                            showSearch={true}
                            options={categories}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_categories}
                          />
                        </Form.Item>

                        <Divider>Detail Information</Divider>

                        <Form.Item
                          label={"Released Year"}
                          name="release_date"
                        >
                          <DatePicker picker='year' style={{ width: "100%" }} />
                        </Form.Item >

                        <Form.Item
                          label={"ISBN"}
                          name="isbn"
                        >
                          <Input variant='filled' placeholder={Placeholder.isbn} />
                        </Form.Item >
                        <Form.Item
                          label={"Initial Language"}
                          name="initial_language"
                          style={{
                            flexGrow: 1
                          }}
                        >
                          <Input variant='filled' placeholder={Placeholder.initial_language} />
                        </Form.Item >

                        <Form.Item
                          label={"Total Page"}
                          name="total_page"
                        >
                          <InputNumber variant='filled' placeholder={Placeholder.total_page} style={{ width: "100%" }} />
                        </Form.Item >

                        <Form.Item
                          label={"Illustrator"}
                          name={"illustrator_id"}
                        >
                          <Select
                            showSearch={true}
                            options={illustrators}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_illustrator}
                          />
                        </Form.Item>

                        <Form.Item
                          label={"Translator"}
                          name={"translator_id"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select
                            showSearch={true}
                            options={translators}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_translator}
                          />
                        </Form.Item>

                        <Form.Item
                          label={"Available Languages"}
                          name={"available_languages"}
                        // rules={[{
                        //   required: true,
                        // }]}
                        >
                          <Select
                            mode='tags'
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_available_languages}
                          />
                        </Form.Item>

                        <Form.Item
                          label={"Translation Rights"}
                          name="translation_rights"
                          valuePropName='checked'
                        >
                          <Checkbox>Available for translation</Checkbox>
                        </Form.Item >

                        <Divider>Contact Person Information</Divider>
                        <Form.Item
                          label={"Literary Agency"}
                          name={"literary_agency_id"}
                        >
                          <Select
                            showSearch={true}
                            options={agencies}
                            variant='filled'
                            filterOption={selectFilterFunction}
                            placeholder={Placeholder.select_agency}
                          />
                        </Form.Item>
                        <Row>
                          <Col md={6}>
                            <Form.Item
                              label={"Name"}
                              name="contact_person_name"
                            >
                              <Input variant='filled' placeholder={Placeholder.name_person} />
                            </Form.Item >
                          </Col>
                          <Col md={6}>
                            <Form.Item
                              label={"Email"}
                              name="contact_person_email"
                              rules={[{
                                type: 'email',
                                message: 'Please enter a valid email address!',
                              }]}
                            >
                              <Input variant='filled' placeholder={Placeholder.email} />
                            </Form.Item >
                          </Col>
                        </Row>

                        {!formDisabled ? (
                          <div className={"d-flex flex-row"} style={{ gap: "12px" }}>
                            <Button size="sm" type='primary' variant="primary" htmlType='submit' loading={loadingSubmit["save"]}>
                              {!bookData ? "Add Book" : "Save Book"}
                            </Button>
                            {!bookData ? (
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
                          label={"Cover Image"}
                          name={"image_cover"}
                          onImageChange={(file) => setImageFile(file)}
                          helperTextTop={[
                            <>Recommended: 600px × 900px (Width × Height)</>,
                          ]} />
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
        when={hasChanges && !(loadingSubmit["save"] || loadingSubmit['saveDraft'])}
        message={"Are you sure you want to leave before saving?"}
      />
    </>
  );
}

