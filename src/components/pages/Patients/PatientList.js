import { Space, Button as AntButton, Tooltip, Modal, message, Input, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import PatientModel from 'models/PatientModel';
import MedicalHistoryModel from 'models/MedicalHistoryModel';

import moment from 'moment';
import create from 'zustand';

const useFilter = create((set) => ({
  search: "",
  timeRange: "all",
  gender: "",
  bloodType: "",

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  setTimeRange: (timeRange) =>
    set((state) => ({
      timeRange: timeRange,
    })),
  setGender: (gender) =>
    set((state) => ({
      gender: gender,
    })),
  setBloodType: (bloodType) =>
    set((state) => ({
      bloodType: bloodType,
    })),
  resetSearch: () =>
    set((state) => ({
      search: "",
      timeRange: "all",
      gender: "",
      bloodType: ""
    })),
}));

const PatientList = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  const search = useFilter((state) => state.search);
  const timeRange = useFilter((state) => state.timeRange);
  const gender = useFilter((state) => state.gender);
  const bloodType = useFilter((state) => state.bloodType);
  const setSearch = useFilter((state) => state.setSearch);
  const setTimeRange = useFilter((state) => state.setTimeRange);
  const setGender = useFilter((state) => state.setGender);
  const setBloodType = useFilter((state) => state.setBloodType);
  const resetSearch = useFilter((state) => state.resetSearch);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
    setPage(0);
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    setPage(0);
  };

  const handleGenderChange = (value) => {
    setGender(value);
    setPage(0);
  };

  const handleBloodTypeChange = (value) => {
    setBloodType(value);
    setPage(0);
  };

  const handleDownloadProgressPDF = async (patientId, patientName, patientCode) => {
    try {
      message.loading({ content: 'Generating PDF report...', key: 'pdf-gen', duration: 0 });
      
      await MedicalHistoryModel.generateProgressPDF(patientId);
      
      message.success({ 
        content: `Progress report for ${patientName} (${patientCode}) downloaded successfully!`, 
        key: 'pdf-gen',
        duration: 3
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      let errorMsg = 'Failed to generate PDF report';
      if (error.message.includes('No medical history')) {
        errorMsg = 'No medical history records found for this patient';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      message.error({ 
        content: errorMsg, 
        key: 'pdf-gen',
        duration: 5
      });
    }
  };

  const columns = [
    {
      id: 'patient_code',
      label: 'Patient ID',
      filter: true,
      render: (row) => (
        <div style={{ fontWeight: 500, color: '#333' }}>{row.patient_code}</div>
      )
    },
    {
      id: 'name',
      label: 'Patient Name',
      filter: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {row.gender}
          </div>
        </div>
      )
    },
    {
      id: 'contact_info',
      label: 'Contact',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ color: '#333' }}>{row.phone || 'No phone'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{row.email || 'No email'}</div>
        </div>
      )
    },
    {
      id: 'blood_type',
      label: 'Blood Type',
      filter: true,
      render: (row) => (
        <span className={`ant-tag blood-tag blood-${row.blood_type?.toLowerCase() || 'unknown'}`}>
          {row.blood_type || 'Unknown'}
        </span>
      )
    },
    {
      id: 'created_at',
      label: 'Registration Date',
      filter: false,
      render: (row) => (
        <div>
          <div style={{ color: '#333' }}>{moment(row.created_at).format("DD MMM YYYY")}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {moment(row.created_at).format("HH:mm")}
          </div>
        </div>
      )
    },
    {
      id: '',
      label: 'Actions',
      filter: false,
      render: (row) => {
        return (
          <Space size="small">
            <Tooltip title="View Details">
              <Link to={`/patients/${row.id}`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:visibility"} />}
                />
              </Link>
            </Tooltip>
    
            <Tooltip title="Edit Patient">
              <Link to={`/patients/${row.id}/edit`}>
                <AntButton
                  type={'link'}
                  style={{ color: '#333' }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:edit"} />}
                />
              </Link>
            </Tooltip>
    
            <Tooltip title="Download Progress Report (PDF)">
              <AntButton
                type={'link'}
                style={{ color: '#1890ff' }}
                onClick={() => handleDownloadProgressPDF(row.id, row.name, row.patient_code)}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"mdi:file-pdf-box"} />}
              />
            </Tooltip>
    
            <Tooltip title="Delete Patient">
              <AntButton
                type={'link'}
                style={{ color: '#ff4d4f' }}
                onClick={() => onDelete(row.id)}
                className={"d-flex align-items-center justify-content-center"}
                shape="circle"
                icon={<Iconify icon={"material-symbols:delete-outline"} />}
              />
            </Tooltip>
          </Space>
        );
      }
    },
  ];

  const deleteItem = async (id) => {
    try {
      await PatientModel.deletePatient(id);
      message.success('Patient deleted successfully');
      initializeData();
    } catch (error) {
      console.error("Error deleting patient:", error);
      message.error('Failed to delete patient');
    }
  };

  const onDelete = (id) => {
    Modal.confirm({
      title: "Delete Patient",
      content: "Are you sure you want to delete this patient?",
      okText: "Delete",
      okType: "primary",
      cancelText: "Cancel",
      onOk: () => deleteItem(id)
    });
  };

  const exportCSV = async () => {
    setExportLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (gender) filters.gender = gender;
      if (bloodType) filters.blood_type = bloodType;
      if (timeRange && timeRange !== "all") filters.timeRange = timeRange;
      
      const result = await PatientModel.getAllPatients(filters);
      
      if (!result || result.http_code !== 200) {
        throw new Error("Failed to fetch data");
      }
      
      let data = result.data || [];
      
      data = data.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });
      
      const headers = [
        'ID',
        'Patient Code',
        'Full Name',
        'Date of Birth',
        'Gender',
        'Phone Number',
        'Email',
        'Blood Type',
        'Address',
        'Registration Date'
      ];
      
      const rows = data.map(patient => {
        const dob = patient.date_of_birth ? 
          moment(patient.date_of_birth).format('DD/MM/YYYY') : '';
        
        const regDate = patient.created_at ? 
          moment(patient.created_at).format('DD/MM/YYYY HH:mm') : '';
        
        return [
          patient.id || '',
          patient.patient_code || '',
          patient.name || '',
          dob,
          patient.gender || '',
          patient.phone || '',
          patient.email || '',
          patient.blood_type || 'Unknown',
          patient.address || '',
          regDate
        ];
      });
      
      const allRows = [headers, ...rows];
      
      const csvContent = allRows
        .map(row => 
          row
            .map(cell => {
              const cellStr = String(cell || '');
              if (cellStr.includes(';') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(';')
        )
        .join('\n');
      
      const BOM = '\uFEFF';
      const finalContent = BOM + csvContent;
      
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = moment().format('YYYY-MM-DD_HH-mm');
      link.download = `patients_${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success(`CSV exported! ${data.length} patients exported.`);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      message.error('Failed to export CSV: ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const initializeData = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setLoading(true);
    try {
      const filters = {};
      
      if (search) filters.search = search;
      if (gender) filters.gender = gender;
      if (bloodType) filters.blood_type = bloodType;
      if (timeRange && timeRange !== "all") {
        filters.timeRange = timeRange;
      }
      
      const result = await PatientModel.getAllPatients(filters);
      
      if (result && result.http_code === 200) {
        const allData = Array.isArray(result.data) ? result.data : [];
        
        const startIndex = currentPage * currentRowsPerPage;
        const endIndex = startIndex + currentRowsPerPage;
        const paginatedData = allData.slice(startIndex, endIndex);
        
        setDataSource(paginatedData);
        setTotalCount(allData.length);
      } else {
        setDataSource([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setDataSource([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData(page, rowsPerPage);
  }, [page, rowsPerPage, search, timeRange, gender, bloodType]);

  return (
    <>
      <style>{`
        /* General button styles */
        .custom-add-button .ant-btn-primary {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        .custom-add-button .ant-btn-primary:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .custom-add-button {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        .custom-add-button:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .custom-export-button {
          background: #52c41a !important;
          border-color: #52c41a !important;
          color: white !important;
        }
        
        .custom-export-button:hover {
          background: #73d13d !important;
          border-color: #73d13d !important;
        }
        
        /* Search input */
        .patient-search.ant-input-affix-wrapper {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        .patient-search .ant-input {
          background: white !important;
          color: #333 !important;
        }
        
        .patient-search .ant-input::placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .patient-search .ant-input-prefix {
          color: #666 !important;
        }
        
        .patient-search.ant-input-affix-wrapper:hover,
        .patient-search.ant-input-affix-wrapper:focus,
        .patient-search.ant-input-affix-wrapper-focused {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
        }
        
        .patient-search .ant-input-clear-icon {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .patient-search .ant-input-clear-icon:hover {
          color: rgba(0, 0, 0, 0.45) !important;
        }
        
        .patient-search.ant-input-affix-wrapper {
          border-radius: 6px !important;
        }
        
        /* Select filter */
        .filter-select .ant-select-selector {
          background: white !important;
          border: 1px solid #d9d9d9 !important;
          color: #333 !important;
          border-radius: 6px !important;
        }
        
        .filter-select .ant-select-selection-placeholder {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .filter-select .ant-select-selection-item {
          color: #333 !important;
        }
        
        .filter-select .ant-select-arrow {
          color: rgba(0, 0, 0, 0.25) !important;
        }
        
        .filter-select .ant-select-selector:hover {
          border-color: #1890ff !important;
        }
        
        .filter-select.ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
        }
        
        /* Blood type tags */
        .blood-tag {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          display: inline-block;
        }
        
        .blood-tag.blood-a {
          background: #fff1f0 !important;
          color: #cf1322 !important;
          border: 1px solid #ffa39e !important;
        }
        
        .blood-tag.blood-b {
          background: #f6ffed !important;
          color: #389e0d !important;
          border: 1px solid #b7eb8f !important;
        }
        
        .blood-tag.blood-ab {
          background: #f0f5ff !important;
          color: #1d39c4 !important;
          border: 1px solid #adc6ff !important;
        }
        
        .blood-tag.blood-o {
          background: #fff7e6 !important;
          color: #d46b08 !important;
          border: 1px solid #ffd591 !important;
        }
        
        .blood-tag.blood-unknown {
          background: #f5f5f5 !important;
          color: #8c8c8c !important;
          border: 1px solid #d9d9d9 !important;
        }
        
        /* Modal styling */
        .ant-modal-header {
          background: white !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-modal-title {
          color: #333 !important;
        }
        
        .ant-modal-content {
          background: white !important;
          color: #333 !important;
        }
        
        .ant-modal-body {
          color: #333 !important;
        }
        
        .ant-modal-confirm-body .ant-modal-confirm-title {
          color: #333 !important;
        }
        
        .ant-modal-confirm-body .ant-modal-confirm-content {
          color: #333 !important;
        }
        
        .ant-modal-footer {
          border-top: 1px solid #f0f0f0 !important;
        }
        
        .ant-modal-mask {
          background-color: rgba(0, 0, 0, 0.45) !important;
        }
        
        /* Button styles */
        .ant-btn-primary {
          background: #1890ff !important;
          border-color: #1890ff !important;
          color: white !important;
        }
        
        .ant-btn-primary:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
        }
        
        .ant-btn-default:hover {
          border-color: #1890ff !important;
          color: #1890ff !important;
        }
        
        /* Table styling */
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #333 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background: #fafafa !important;
        }
        
        /* Pagination */
        .ant-pagination-item {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
        }
        
        .ant-pagination-item a {
          color: #333 !important;
        }
        
        .ant-pagination-item-active {
          border-color: #1890ff !important;
          background: #e6f7ff !important;
        }
        
        .ant-pagination-item-active a {
          color: #1890ff !important;
          font-weight: 500;
        }
        
        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          border: 1px solid #d9d9d9 !important;
          background: white !important;
          color: #333 !important;
        }
        
        /* Tablet responsive */
        @media (min-width: 768px) and (max-width: 1024px) {
          .patient-search.ant-input-affix-wrapper {
            height: 44px !important;
            font-size: 16px !important;
          }
          
          .patient-search .ant-input {
            font-size: 16px !important;
          }
          
          .patient-search .ant-input::placeholder {
            font-size: 16px !important;
          }
          
          .patient-search .ant-input-prefix {
            font-size: 22px !important;
          }
          
          .filter-select .ant-select-selector {
            height: 44px !important;
            font-size: 16px !important;
            padding: 5px 11px !important;
          }
          
          .filter-select .ant-select-selection-placeholder {
            font-size: 16px !important;
            line-height: 32px !important;
          }
          
          .filter-select .ant-select-selection-item {
            font-size: 16px !important;
            line-height: 32px !important;
          }
          
          .ant-select-item {
            font-size: 16px !important;
            padding: 10px 12px !important;
            min-height: 44px !important;
          }
          
          .custom-add-button {
            font-size: 16px !important;
            height: 44px !important;
            padding: 0 24px !important;
          }
          
          .custom-export-button {
            font-size: 16px !important;
            height: 44px !important;
            padding: 0 24px !important;
          }
          
          .ant-table-thead > tr > th {
            font-size: 16px !important;
            padding: 18px 16px !important;
            font-weight: 600 !important;
          }
          
          .ant-table-tbody > tr > td {
            font-size: 15px !important;
            padding: 18px 16px !important;
          }
          
          .blood-tag {
            font-size: 15px !important;
            padding: 6px 14px !important;
          }
          
          .ant-btn-circle {
            font-size: 22px !important;
            width: 40px !important;
            height: 40px !important;
          }
          
          .ant-pagination-item {
            min-width: 40px !important;
            height: 40px !important;
            line-height: 38px !important;
          }
          
          .ant-pagination-item a {
            font-size: 16px !important;
          }
          
          .patient-management-title {
            font-size: 26px !important;
          }
        }
        
        /* Mobile responsive */
        @media (max-width: 767px) {
          .custom-add-button,
          .custom-export-button {
            width: 100%;
            margin-top: 12px;
          }
          
          .button-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .button-group .ant-btn {
            width: 100% !important;
          }
        }
      `}</style>
      <Container fluid>
        <Card style={{ 
          background: '#FFFFFF', 
          color: "#333",
          border: '1px solid #f0f0f0',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)'
        }}
          className="card-stats mb-4 mb-xl-0">
          <CardBody>
            <Row className="mb-4">
              <Col md={6} xs={12}>
                <div className="patient-management-title" style={{ fontWeight: "bold", fontSize: "1.2em", color: '#333' }}>
                  Patient Management
                </div>
              </Col>
              <Col md={6} xs={12} className="text-md-right text-center">
                <div className="button-group" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Link to="/patients/create" style={{ flexShrink: 0 }}>
                    <AntButton
                      size={'middle'}
                      type={'primary'}
                      icon={<Iconify icon={"material-symbols:add"} />}
                      className="custom-add-button"
                    >
                      Add Patient
                    </AntButton>
                  </Link>
                  
                  <AntButton
                    size={'middle'}
                    type={'primary'}
                    icon={<Iconify icon={"mdi:file-export-outline"} />}
                    className="custom-export-button"
                    onClick={exportCSV}
                    loading={exportLoading}
                  >
                    Export CSV
                  </AntButton>
                </div>
              </Col>
            </Row>

            <Row style={{ marginBottom: 24, alignItems: 'center' }}>
              <Col xl={4} lg={4} md={12} className="mb-3 mb-lg-0">
                <Input
                  className="patient-search"
                  placeholder="Search by name, ID, or phone"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={
                    <Iconify
                      icon="material-symbols:search"
                      style={{ color: '#666', fontSize: '18px' }}
                    />
                  }
                  allowClear
                  onClear={() => handleSearch("")}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xl={2} lg={2} className="d-none d-lg-block"></Col>
              <Col xl={2} lg={2} md={6} xs={6} className="mb-3 mb-lg-0 pe-md-2">
                <Select
                  className="filter-select"
                  placeholder="Gender"
                  style={{ width: '100%' }}
                  value={gender || undefined}
                  onChange={handleGenderChange}
                  allowClear
                  onClear={() => handleGenderChange("")}
                >
                  <Select.Option value="">All Gender</Select.Option>
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                 
                </Select>
              </Col>
              <Col xl={2} lg={2} md={6} xs={6} className="mb-3 mb-lg-0">
                <Select
                  className="filter-select"
                  placeholder="Blood Type"
                  style={{ width: '100%' }}
                  value={bloodType || undefined}
                  onChange={handleBloodTypeChange}
                  allowClear
                  onClear={() => handleBloodTypeChange("")}
                >
                  <Select.Option value="">All Blood Types</Select.Option>
                  <Select.Option value="A">A</Select.Option>
                  <Select.Option value="B">B</Select.Option>
                  <Select.Option value="AB">AB</Select.Option>
                  <Select.Option value="O">O</Select.Option>
                </Select>
              </Col>
              <Col xl={2} lg={2} md={6} xs={6} className="mb-3 mb-lg-0 ps-md-2">
                <Select
                  className="filter-select"
                  placeholder="Time Range"
                  style={{ width: '100%' }}
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                >
                  <Select.Option value="all">All Time</Select.Option>
                  <Select.Option value="today">Today</Select.Option>
                  <Select.Option value="last7days">Last 7 Days</Select.Option>
                  <Select.Option value="last30days">Last 30 Days</Select.Option>
                </Select>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <CustomTable
                  showFilter={false}
                  pagination={true}
                  searchText=""
                  data={dataSource}
                  columns={columns}
                  defaultOrder={"created_at"}
                  onSearch={null}
                  apiPagination={false}
                  totalCount={totalCount}
                  currentPage={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  loading={loading}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
}

export default PatientList;