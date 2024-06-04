/*!

=========================================================
* Argon Dashboard React - v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/*eslint-disable*/

// reactstrap components
import {Container, Row, Col, Nav, NavItem, NavLink} from "reactstrap";
import Palette from "../../utils/Palette";
import Iconify from "../reusable/Iconify";

const Footer = () => {
    return (
        <footer className="footer" style={{background : Palette.BACKGROUND_DARK_GRAY}}>
            <Row className="align-items-center justify-content-xl-between">
                <Col xl="12">
                    <hr style={{marginBottom : 10, marginTop : 4}}/>
                    <div className="copyright text-center text-xl-left text-muted d-flex flex-row align-items-end justify-content-end">
                        <div style={{lineHeight: "1em"}}>© {new Date().getFullYear()}&nbsp;</div>
                        <a
                            style={{lineHeight: "1em"}}
                            href="https://storyteller-creator.komunestudio.com"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <b>Barcode Gokart Admin</b>
                        </a>
                        <div style={{lineHeight: "1em"}}>&nbsp;Powered by</div>
                        <a
                            style={{lineHeight: "1em"}}
                            className="font-weight-bold ml-1"
                            href="https://gsk.co.id"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <b style={{color: Palette.KOMUNE_YELLOW}}>Garuda Solusi Kreatif</b>
                        </a>
                    </div>
                </Col>
            </Row>
        </footer>
    );
};

export default Footer;
