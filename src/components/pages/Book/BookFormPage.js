import React, { Suspense, useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Button, Flex, message, Spin, Typography } from 'antd';
import { Card, CardBody, Container } from 'reactstrap';
import { Col, Row } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Palette from '../../../utils/Palette';
import Iconify from '../../reusable/Iconify';
import swal from '../../reusable/CustomSweetAlert';
import User from 'models/UserModel';

export default function BookFormPage({
  bookData
}) {
  const history = useHistory();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [publishDate, setPublishDate] = useState(0)
  const [isbn, setIsbn] = useState("")
  const [userId, setUserId] = useState(0);
  const [adaptationId, setAdaptationId] = useState(0);
  const [publisherId, setPublisherId] = useState(0);
  const [translatorId, setTranslatorId] = useState(0);
  const [illustratorId, setIllustratorId] = useState(0);
  const [agencyId, setAgencyId] = useState(0);

  const [users, setUsers] = useState([]);
  const [adaptations, setAdaptations] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [translators, setTranslators] = useState([]);
  const [illustrators, setIllustrators] = useState([]);
  const [agencies, setAgencies] = useState([]);

  const getUsersData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setUsers(result)
    } catch (e) {
    }
  }

  const getAdaptationsData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setAdaptations(result)
    } catch (e) {
    }
  }

  const getPublishersData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setPublishers(result)
    } catch (e) {
    }
  }

  const getTranslatorsData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setTranslators(result)
    } catch (e) {
    }
  }

  const getIllustratorsData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setIllustrators(result)
    } catch (e) {
    }
  }

  const getAgenciesData = async () => {
    try {
      let result = await User.getAll()
      console.log(result)
      setAgencies(result)
    } catch (e) {
    }
  }

  const initializeData = async () => {
    setLoading(true);
    await Promise.all([getUsersData(), getAdaptationsData(), getPublishersData(), getTranslatorsData(), getIllustratorsData(), getAgenciesData()])
    setLoading(false);
  }

  const onSubmit = async () => {
    if (!title) {
      return swal.fireError({ text: "Judul Buku Wajib diisi" })
    }
    if (!description) {
      return swal.fireError({ text: "Deskripsi Buku Wajib diisi" })
    }
    if (!publishDate) {
      return swal.fireError({ text: "Tanggal Penerbitan Wajib diisi" })
    }
    if (!isbn) {
      return swal.fireError({ text: "ISBN Wajib diisi" })
    }

    try {
      let result;
      let body = {
        title: title,
        description: description,
        publish_date: publishDate,
        isbn: isbn,
      }
      let msg = 'Berhasil membuat Buku'
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
      setTitle(bookData.title);
      setTitleEn(bookData.title_en);
      setDescription(bookData.description);
      setDescriptionEn(bookData.description_en);
      setPublishDate(bookData.publish_date);
      setIsbn(bookData.isbn);
      setUserId(bookData.user_id);
      setAdaptationId(bookData.adaptation_id);
      setPublisherId(bookData.publisher_id);
      setTranslatorId(bookData.translator_id);
      setIllustratorId(bookData.illustrator_id);
      setAgencyId(bookData.agency_id);
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
                      Kembali
                    </Typography.Text>
                  </Flex>
                </Link>
              </Col>
            </Row>
            <Row>
              <Col style={{ marginTop: "40px" }}>
                <Flex vertical gap={"24px"} style={{ width: "60%" }} className='text-white'>
                  {loading ? (
                    <Flex justify="center" align="center">
                      <Spin />
                    </Flex>
                  ) : (
                    <>
                      <Flex vertical gap={"16px"}>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Judul Buku</Form.Label>
                          <Form.Control
                            value={title}
                            autoComplete={"title"}
                            onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Judul Buku" />
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Judul Buku (Bahasa Inggris)</Form.Label>
                          <Form.Control
                            value={titleEn}
                            autoComplete={"title"}
                            onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Judul Buku" />
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Deskripsi Buku</Form.Label>
                          <Form.Control
                            value={description}
                            as="textarea" rows={2}
                            onChange={(e) => setDescription(e.target.value)} type="text" placeholder="Deskripsi Buku" />
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Deskripsi Buku (Bahasa Inggris)</Form.Label>
                          <Form.Control
                            value={descriptionEn}
                            as="textarea" rows={2}
                            onChange={(e) => setDescription(e.target.value)} type="text" placeholder="Deskripsi Buku" />
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Tanggal Penerbitan</Form.Label>
                          <Form.Control
                            value={publishDate}
                            onChange={(e) => {
                              console.log(e.target.value);
                              setPublishDate(e.target.value)
                            }} type="date" placeholder="" />
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>ISBN</Form.Label>
                          <Form.Control
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)} type="text" placeholder="ISBN" />
                        </Flex>
                      </Flex>
                      <Flex vertical gap={"16px"}>
                        <Suspense fallback={
                          <Flex justify="center" align="center">
                            <Spin />
                          </Flex>
                        }>
                          <Flex vertical gap={8}>
                            <Form.Label style={{ fontSize: "14px" }}>User</Form.Label>
                            <Form.Select
                              style={{ fontSize: "14px" }}
                              className='form-control'
                              value={userId}
                              onChange={(e) => setUserId(e.target.value)}
                            >
                              <option disabled>Open this select menu</option>
                              {users.length > 0 && users.map((user) => (
                                <option value={user.id}>{user.username}</option>
                              ))}
                            </Form.Select>
                          </Flex>
                        </Suspense>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Adaptation</Form.Label>
                          <Form.Select
                            style={{ fontSize: "14px" }}
                            className='form-control'
                            value={adaptationId}
                            onChange={(e) => setAdaptationId(e.target.value)}
                          >
                            <option disabled>Open this select menu</option>
                            {adaptations.length > 0 && adaptations.map((adaptation) => (
                              <option value={adaptation.id}>{adaptation.username}</option>
                            ))}
                          </Form.Select>
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Publisher</Form.Label>
                          <Form.Select
                            style={{ fontSize: "14px" }}
                            className='form-control'
                            value={publisherId}
                            onChange={(e) => setPublisherId(e.target.value)}
                          >
                            <option disabled>Open this select menu</option>
                            {publishers.length > 0 && publishers.map((publisher) => (
                              <option value={publisher.id}>{publisher.username}</option>
                            ))}
                          </Form.Select>
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Translator</Form.Label>
                          <Form.Select
                            style={{ fontSize: "14px" }}
                            className='form-control'
                            value={translatorId}
                            onChange={(e) => setTranslatorId(e.target.value)}
                          >
                            <option disabled>Open this select menu</option>
                            {translators.length > 0 && translators.map((translator) => (
                              <option value={translator.id}>{translator.username}</option>
                            ))}
                          </Form.Select>
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Illustrator</Form.Label>
                          <Form.Select
                            style={{ fontSize: "14px" }}
                            className='form-control'
                            value={illustratorId}
                            onChange={(e) => setIllustratorId(e.target.value)}
                          >
                            <option disabled>Open this select menu</option>
                            {illustrators.length > 0 && illustrators.map((illustrator) => (
                              <option value={illustrator.id}>{illustrator.username}</option>
                            ))}
                          </Form.Select>
                        </Flex>
                        <Flex vertical gap={8}>
                          <Form.Label style={{ fontSize: "14px" }}>Agency</Form.Label>
                          <Form.Select
                            style={{ fontSize: "14px" }}
                            className='form-control'
                            value={agencyId}
                            onChange={(e) => setAgencyId(e.target.value)}
                          >
                            <option disabled>Open this select menu</option>
                            {agencies.length > 0 && agencies.map((agency) => (
                              <option value={agency.id}>{agency.username}</option>
                            ))}
                          </Form.Select>
                        </Flex>
                      </Flex>
                      <Button type='primary' onClick={onSubmit} >Tambah</Button>
                    </>
                  )}
                </Flex>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

