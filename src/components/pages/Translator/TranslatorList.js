import { Table, Image, Space, Button as AntButton, Tooltip, Modal, message, Input, Flex } from 'antd';
import HeaderNav from "components/Headers/HeaderNav.js";
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import Translator from '../../../models/TranslatorModel';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import Palette from 'utils/Palette';
import { InputGroup, Form, Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import swal from "../../reusable/CustomSweetAlert";
import EditTranslatorModal from './EditTranslatorModal';
import CreateTranslatorModal from './CreateTranslatorModal';
import TranslatorDetailModal from './TranslatorDetailModal'; // Import modal detail
import Helper from 'utils/Helper';

const TranslatorList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTranslator, setSelectedTranslator] = useState(null);
  const [openTranslatorModal, setOpenTranslatorModal] = useState(false); // State untuk modal detail

  const columns = [
    {
      id: 'profile_picture',
      label: 'Profile Picture',
      filter: false,
      allowSort: false,
      render: (row) => (
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
    },
    { id: 'name', label: 'Name', filter: true },
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
    { id: 'languages', label: 'Languages', filter: true },
    { id: 'phone', label: 'Phone', filter: false, allowSort: false },
    { id: 'email', label: 'Email', filter: true },
    {
      id: '', label: '', filter: false,
      render: (row) => (
        <Space size="small">
          <Tooltip title="Open on Landing Page">
            <AntButton
              type={'link'}
              style={{ color: Palette.MAIN_THEME }}
              onClick={() => {
                window.open(`${Helper.redirectURL}/translators/${row?.id}`)
              }}
              className={"d-flex align-items-center justify-content-center"}
              shape="circle"
              icon={<Iconify icon={"mdi:external-link"} />} />
          </Tooltip>

          {/* Tombol Detail */}
          <Tooltip title="Detail">
            <AntButton
              type="link"
              style={{ color: Palette.MAIN_THEME }}
              onClick={() => {
                setOpenTranslatorModal(true);
                setSelectedTranslator(row);
              }}
              className="d-flex align-items-center justify-content-center"
              shape="circle"
              icon={<Iconify icon="material-symbols:search-rounded" />}
            />
          </Tooltip>

          <Tooltip title="Edit">
            <Link to={`/translators/${row.id}/edit`}>
              <AntButton
                type="link"
                style={{ color: Palette.MAIN_THEME }}
                className="d-flex align-items-center justify-content-center"
                shape="circle"
                icon={<Iconify icon="material-symbols:edit" />}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Delete">
            <AntButton
              type="link"
              style={{ color: Palette.MAIN_THEME }}
              onClick={() => {
                onDelete(row.id);
              }}
              className="d-flex align-items-center justify-content-center"
              shape="circle"
              icon={<Iconify icon="material-symbols:delete-outline" />}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const deleteItem = async (id) => {
    try {
      await Translator.delete(id);
      message.success('Translator deleted');
      initializeData();
    } catch (e) {
      message.error('There was error from server');
      setLoading(true);
    }
  };

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this translator data?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        deleteItem(record);
      }
    });
  };

  const initializeData = async () => {
    setLoading(true);
    try {
      let result = await Translator.getAll();
      setDataSource(result);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  return (
    <>
      <Container fluid>
        <Card style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row>
              <Col className="mb-3" md={6}>
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>Translators</div>
              </Col>
              <Col className="mb-3 text-right" md={6}>
                <Link to="/translators/create">
                  <AntButton size="middle" type="primary">
                    Add Translator
                  </AntButton>
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

      {/* Modal untuk Detail Translator */}
      <TranslatorDetailModal
        open={openTranslatorModal}
        translator={selectedTranslator}
        onClose={() => setOpenTranslatorModal(false)}
      />

      {/* Optional modals, kalau masih dipakai */}
      <CreateTranslatorModal
        isOpen={isCreateOpen}
        close={async (refresh) => {
          if (refresh) await initializeData();
          setIsCreateOpen(false);
        }}
      />
      {isEditModalOpen && (
        <EditTranslatorModal
          isOpen={isEditModalOpen}
          translatorData={selectedTranslator}
          close={(refresh) => {
            if (refresh) initializeData();
            setIsEditModalOpen(false);
            setSelectedTranslator(null);
          }}
        />
      )}
    </>
  );
};

export default TranslatorList;