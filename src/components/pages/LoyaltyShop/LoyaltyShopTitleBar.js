import {Button, Col, Row} from "react-bootstrap";
import React from "react";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import {Link, useLocation} from "react-router-dom";

export default function LoyaltyShopTitleBar() {
    const location = useLocation()
    return (
        <>
            <Row className={'mb-4'}>
                <Col className='mb-3' md={12}>
                    <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Loyalty Shop</div>
                </Col>
                <Col md={12}>
                    <ButtonGroup aria-label="Basic example">
                        <Link
                            // style={{background: '#121212'}}
                            className={`btn ${location.pathname === '/loyalty-history' ? 'btn-primary-tab' : 'btn-default-tab'}`}
                            to={'/loyalty-history'}>
                            Histori Tukar Poin
                        </Link>
                        <Link
                            // style={{background: '#404040', border: 'none'}}
                            className={`btn ${location.pathname === '/loyalty-shop-catalog' ? 'btn-primary-tab' : 'btn-default-tab'}`}
                            to={'/loyalty-shop-catalog'}>
                            Katalog
                        </Link>
                    </ButtonGroup>
                </Col>
            </Row>
        </>
    )
}