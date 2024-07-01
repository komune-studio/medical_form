import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {Card, CardBody, Container} from "reactstrap";
import Palette from "../../../utils/Palette";

export default function Messaging() {

    const [form, setForm] = useState({title: '', body: ''})
    return (
        <Container fluid>
            <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}} className="card-stats mb-4 mb-xl-0">
                <CardBody>
                    <Row className={'mb-4'}>
                        <Col className='mb-3' md={12}>
                            <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Top Up</div>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label style={{fontSize: "0.8em"}}>Title</Form.Label>
                        <Form.Control value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} type="text" placeholder="Title"/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{fontSize: "0.8em"}}>Body</Form.Label>
                        <Form.Control rows={4} as={'textarea'} value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} type="text" placeholder="Title"/>
                    </Form.Group>
                </CardBody>
            </Card>
        </Container>
    )
}