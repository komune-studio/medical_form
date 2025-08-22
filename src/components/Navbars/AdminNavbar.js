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
  const adminName = localStorage.getItem('admin_name') || null;

  const logout = () => {
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
  }
  return (
    <>
      <Navbar className="navbar-top navbar-dark justify-content-end" expand="md" id="navbar-main">
          <Nav className="align-items-center d-none d-md-flex mx-3" navbar>
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
                <DropdownItem href="#pablo" onClick={logout}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
