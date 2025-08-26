import {Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input} from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, {useState, useEffect} from 'react';
import {Card, Row, CardBody, Container, Button} from "reactstrap";
import {Link, useHistory} from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import {InputGroup, Form, Col,} from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import UserFormModal from "./UserFormModal";
import UserResetPasswordModal from "./UserResetPasswordModal";
import Admin from 'models/AdminModel';

const UserList = () => {

  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null)
  const [openUserModal, setOpenUserModal] = useState(false)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [openUserResetModal, setOpenUserResetModal] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [userId, setUserId] = useState(null);

  const columns = [
    {
      id: 'id', label: 'ID', filter: false,
    },
    {
      id: 'username', label: 'Username', filter: true
    },
    // {
    //     id: 'full_name', label: 'Full Name', filter: true,
    // },
    {
      id: 'role', label: 'Role', filter: false,
    },
    {
      id: '', label: '', filter: false,
      render: ((row) => {
        if(!isSuperAdmin && row.id != userId) return
        return (
          <>
            <Space size="small">
              {/* <Tooltip title="Edit">
                <AntButton
                  type={'link'}
                  style={{color: Palette.MAIN_THEME}}
                  onClick={() => {
                    setOpenUserResetModal(false)
                    setOpenUserModal(true)
                    setSelectedUser(row)
                    setIsNewRecord(false)


                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"}/>}/>
              </Tooltip> */}
              <Tooltip title="Reset Password">
                <AntButton
                  type={'link'}
                  style={{color: Palette.MAIN_THEME}}
                  onClick={() => {
                    setSelectedUser(row)
                    setOpenUserResetModal(true)
                    setOpenUserModal(false)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:lock"}/>}/>
              </Tooltip>
              {isSuperAdmin && row.role != "SUPERADMIN" ? (
                <Tooltip title="Delete">
                  <AntButton
                    type={'link'}
                    style={{color: Palette.MAIN_THEME}}
                    onClick={() => {
                      onDelete(row.id)
                    }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:delete-outline"}/>}/>
                </Tooltip>
              ) : ( 
                <></>
              )}
            </Space>
          </>
        )

      })
    },
    /* {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Button variant={'text'}>Lihat Detail</Button>
          </>
          )

      })
    }, */
  ]

  const deleteItem = async (id) => {
    try {
      await Admin.delete(id)
      message.success('User deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user data?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        deleteItem(record)
      }
    });
  };

  const initializeData = async () => {
    setLoading(true)
    try {
      let result = await Admin.getAll()
      console.log(result)
      setDataSource(result)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeData();

    (async () => {
      const result = await Admin.getSelf();
      setIsSuperAdmin(result.role == "SUPERADMIN")
      setUserId(result.id)
    })()
  }, [])

  return (
    <>
      <Container fluid>
        <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
              className="card-stats mb-4 mb-xl-0">
          <CardBody>

            <Row>
              <Col className='mb-3' md={6}>
                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Users</div>
              </Col>
              {isSuperAdmin ? (
                <Col className='mb-3 text-right' md={6}>
                  <AntButton onClick={() => {
                    setIsNewRecord(true)
                    setOpenUserModal(true)
                    setOpenUserResetModal(false)
                  }} size={'middle'} type={'primary'}>Add User</AntButton>
                </Col>
              ) : (
                <></>
              )}
            </Row>
            <Row>

            </Row>
            <CustomTable
              showFilter={true}
              pagination={true}
              searchText={''}
              data={dataSource}
              columns={columns}
            />
          </CardBody>
        </Card>

      </Container>
      <UserResetPasswordModal
        isOpen={openUserResetModal}
        userData={selectedUser}
        isSuperAdmin={isSuperAdmin}
        onClose={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenUserModal(false)
          setOpenUserResetModal(false)
        }}
      />

      <UserFormModal
        isOpen={openUserModal}
        isNewRecord={isNewRecord}
        userData={selectedUser}
        isSuperAdmin={isSuperAdmin}
        close={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenUserModal(false)
          setOpenUserResetModal(false)
        }}
      />

    </>
  )
}

export default UserList;















