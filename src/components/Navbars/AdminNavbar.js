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
import { Link, useHistory } from "react-router-dom";
// reactstrap components
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media
} from "reactstrap";

const AdminNavbar = (props) => {
  const history = useHistory();
  const adminName = localStorage.getItem('admin_name') || null

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >

          </Link>

          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <Media className="mr-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {adminName}
                    </span>
                  </Media>
                  <Avatar size="large" icon={<UserOutlined />} />
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0" style={{ color: "black" }}>Welcome!</h6>
                </DropdownItem>
                {/* <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-settings-gear-65" />
                  <span>Settings</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-calendar-grid-58" />
                  <span>Activity</span>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-support-16" />
                  <span>Support</span>
                </DropdownItem>
                <DropdownItem divider /> */}
                {/* <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}> */}
                <DropdownItem href="#pablo" onClick={() => {
                                    localStorage.removeItem("super_token")
                                    localStorage.removeItem("username")
                                    localStorage.removeItem("token")
                                    localStorage.removeItem("role")

                                    sessionStorage.removeItem("super_token")
                                    sessionStorage.removeItem("username")
                                    sessionStorage.removeItem("role")
                                    sessionStorage.removeItem("token")
                                    history.push('/login')
                                    window.location.reload()
                                }}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
