import { Table, Flex, Image, Space, Button as AntButton, Tooltip, Modal, message, Input } from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container, Button } from "reactstrap";
import Illustrator from '../../../models/IllustratorModel';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import Palette from 'utils/Palette';
import { InputGroup, Form, Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import swal from "../../reusable/CustomSweetAlert";
import IllustratorDetailModal from './IllustratorDetailModal'; // Import modal detail

const IllustratorList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedIllustrator, setSelectedIllustrator] = useState(null); // State untuk illustrator yang dipilih
  const [openIllustratorModal, setOpenIllustratorModal] = useState(false); // State untuk modal detail

  const columns = [
    {
      id: 'profile_picture', 
      label: 'Profile Picture', 
      filter: false, 
      allowSort: false,
      render: (row) => {
        return (
          <Flex style={{ height: "100px", width: "auto", aspectRatio: "3/4", alignItems: "center", justifyContent: "center" }}>
            {!row?.profile_picture ? (
              <Iconify
                icon={"material-symbols:hide-image-outline"}
                style={{
                  fontSize: "48px"
                }}
              />
            ) : (
              <Image height={"100%"} width={"100%"} style={{ objectFit: "contain" }} src={row?.profile_picture} />
            )}
          </Flex>
        )
      }
    },
    {
      id: 'name', 
      label: 'Name', 
      filter: true,
    },
    {
      id: 'biography', 
      label: 'Biography', 
      filter: true,
      render: (row) => (
        <Tooltip title={row.biography || 'No biography available'}>
          <span style={{
            display: 'block',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {row.biography || 'No biography'}
          </span>
        </Tooltip>
      )
    },
    { id: 'phone_number', label: 'Phone', filter: false, allowSort: false },
    { id: 'email', label: 'Email', filter: true },
    {
      id: '', 
      label: '', 
      filter: false,
      render: ((row) => {
        return (
          <>
            <Space size="small">
              {/* Tombol Detail */}
              <Tooltip title="Detail">
                <AntButton
                  type={'link'}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    setOpenIllustratorModal(true);
                    setSelectedIllustrator(row);
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:search-rounded"} />} />
              </Tooltip>
              
              <Tooltip title="Edit">
                <Link to={`/illustrators/${row.id}/edit`}>
                  <AntButton
                    type={'link'}
                    style={{ color: Palette.MAIN_THEME }}
                    className={"d-flex align-items-center justify-content-center"}
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:edit"} />} />
                </Link>
              </Tooltip>
              <Tooltip title="Delete">
                <AntButton
                  type={'link'}
                  style={{color: Palette.MAIN_THEME}}
                  onClick={() => {
                    onDelete(row.id)
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:delete-outline"}/>}
                >
                </AntButton> 
              </Tooltip>
            </Space>
          </>
        )
      })
    },
  ]

  const deleteItem = async (id) => {
    try {
      await Illustrator.delete(id);
      message.success('Illustrator deleted')
      initializeData();
    } catch (e) {
      message.error('There was error from server')
      setLoading(true)
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this illustrator data?",
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
      let result = await Illustrator.getAll()
      
      // console.log("Result: ", result)
      setDataSource(result)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeData()
  }, [])

  return (
    <>
      <Container fluid>
        <Card style={{background: Palette.BACKGROUND_DARK_GRAY, color: "white"}}
              className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className='mb-3' md={6}>
                <div style={{fontWeight: "bold", fontSize: "1.1em"}}>Illustrators</div>
              </Col>
              <Col className='mb-3 text-right' md={6}>
                <Link to="/illustrators/create">
                  <AntButton
                  onClick={() => {console.log("button worked") }}
                  size={'middle'} type={'primary'}>Add Illustrator</AntButton>
                </Link>
              </Col>
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

      {/* Modal untuk Detail Illustrator */}
      <IllustratorDetailModal
        open={openIllustratorModal}
        illustrator={selectedIllustrator}
        onClose={() => setOpenIllustratorModal(false)}
      />
    </>
  )
}

export default IllustratorList;