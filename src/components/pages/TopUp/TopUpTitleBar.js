import {Button, Col, Row} from "react-bootstrap";
import React from "react";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import {Link, useLocation} from "react-router-dom";

export default function TopUpTitleBar() {
    const location = useLocation()
    console.log('log', location)
    return (
        <>
            <Row>
                <Col className='mb-3' md={12}>
                    <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Top Up</div>
                </Col>
                <Col md={12}>
                    <ButtonGroup aria-label="Basic example">
                        <Link className={`btn ${location.pathname === '/top-up-history' ? 'btn-primary' : 'btn-default'}`} to={'/top-up-history'}>
                            Hisory
                        </Link>
                        <Link className={`btn ${location.pathname === '/top-up-list' ? 'btn-primary' : 'btn-default'}`} to={'/top-up-list'}>
                            Pengaturan
                        </Link>
                    </ButtonGroup>
                </Col>
            </Row>
        </>
    )
}