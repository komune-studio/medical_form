import React, { useState, useEffect } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import { 
  Button, 
  message, 
  Spin, 
  Typography, 
  Form, 
  Input, 
  Select,
  Row,
  Col,
  Card,
  Space,
  InputNumber
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import MedicalHistoryModel from 'models/MedicalHistoryModel';
import PatientModel from 'models/PatientModel';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom styles matching the design
const customStyles = `
  /* Custom styling untuk Select dropdown */
  .medical-history-select .ant-select-selector {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    height: 34px !important;
    padding: 4px 11px !important;
    font-size: 14px !important;
  }
  
  .medical-history-select .ant-select-selection-placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
    font-size: 14px !important;
  }
  
  .medical-history-select .ant-select-selection-item {
    color: #000000 !important;
    font-size: 14px !important;
  }
  
  .medical-history-select .ant-select-arrow {
    color: rgba(0, 0, 0, 0.25) !important;
  }
  
  /* Hover state */
  .medical-history-select .ant-select-selector:hover {
    border-color: #666666 !important;
  }
  
  /* Focus state */
  .medical-history-select.ant-select-focused .ant-select-selector {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Dropdown menu styling */
  .medical-history-select .ant-select-dropdown {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    border-radius: 4px !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
  }
  
  .medical-history-select .ant-select-item {
    color: #000000 !important;
    background-color: #FFFFFF !important;
    font-size: 14px !important;
    padding: 8px 12px !important;
    min-height: 36px !important;
  }
  
  .medical-history-select .ant-select-item:hover {
    background-color: #f5f5f5 !important;
  }
  
  .medical-history-select .ant-select-item-option-selected {
    background-color: #f5f5f5 !important;
    color: #000000 !important;
    font-weight: normal !important;
  }
  
  .medical-history-select .ant-select-item-option-active {
    background-color: #f5f5f5 !important;
  }
  
  /* Native DateTime Input styling */
  .native-datetime-input {
    width: 100%;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    height: 34px !important;
    padding: 4px 11px !important;
    font-size: 14px !important;
    font-family: inherit;
    transition: all 0.3s;
  }
  
  .native-datetime-input:hover {
    border-color: #666666 !important;
  }
  
  .native-datetime-input:focus {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
    outline: none;
  }
  
  .native-datetime-input:disabled {
    background-color: #fafafa !important;
    color: #666666 !important;
    cursor: not-allowed !important;
  }
  
  /* InputNumber styling */
  .pain-level-input .ant-input-number {
    width: 100% !important;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
  }
  
  .pain-level-input .ant-input-number-input {
    height: 32px !important;
    color: #000000 !important;
    font-size: 14px !important;
  }
  
  /* Readonly fields */
  .readonly-field .ant-input {
    background-color: #fafafa !important;
    color: #666666 !important;
    cursor: not-allowed !important;
  }
  
  /* TextArea styling */
  .medical-history-textarea .ant-input {
    min-height: 80px !important;
    resize: vertical !important;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
  
  .medical-history-textarea .ant-input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }
  
  /* Patient select specific */
  .patient-select .ant-select-selector {
    height: 40px !important;
  }
  
  /* Tablet responsive */
  @media (min-width: 768px) and (max-width: 1024px) {
    .medical-history-form-item {
      margin-bottom: 14px !important;
    }
    
    .medical-history-select .ant-select-selector {
      height: 40px !important;
      font-size: 16px !important;
      padding: 8px 12px !important;
    }
    
    .medical-history-select .ant-select-selection-placeholder {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .medical-history-select .ant-select-selection-item {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .medical-history-select .ant-select-item {
      font-size: 16px !important;
      padding: 10px 12px !important;
      min-height: 44px !important;
    }
    
    .native-datetime-input {
      height: 40px !important;
      font-size: 16px !important;
    }
    
    .pain-level-input .ant-input-number {
      height: 40px !important;
    }
    
    .pain-level-input .ant-input-number-input {
      height: 38px !important;
      font-size: 16px !important;
    }
    
    .medical-history-textarea .ant-input {
      min-height: 100px !important;
      font-size: 16px !important;
    }
  }
`;

export default function MedicalHistoryFormPage({
  medicalHistoryData,
  disabled,
  isStandalone = false,
  onSubmitSuccess,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [appointmentDateTime, setAppointmentDateTime] = useState('');

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        const response = await PatientModel.getAllPatients();
        if (response && response.http_code === 200) {
          setPatients(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        message.error('Failed to load patients');
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Inisialisasi data saat medicalHistoryData berubah
  useEffect(() => {
    console.log('MedicalHistoryFormPage useEffect triggered with medicalHistoryData:', medicalHistoryData);
    
    if (medicalHistoryData) {
      console.log('Setting form values for medical history:', medicalHistoryData);
      
      // Parse appointment_date jika ada - convert to local datetime string
      let dateTimeValue = '';
      
      if (medicalHistoryData.appointment_date) {
        const momentDate = moment(medicalHistoryData.appointment_date);
        // Format: YYYY-MM-DDTHH:mm (required for datetime-local input)
        dateTimeValue = momentDate.format('YYYY-MM-DDTHH:mm');
        setAppointmentDateTime(dateTimeValue);
      }
      
      const formValues = {
        patient_id: medicalHistoryData.patient_id,
        staff_id: medicalHistoryData.staff_id || '',
        service_type: medicalHistoryData.service_type || '',
        diagnosis_result: medicalHistoryData.diagnosis_result || '',
        pain_before: medicalHistoryData.pain_before || '',
        pain_after: medicalHistoryData.pain_after || '',
        treatments: medicalHistoryData.treatments || '',
        exercise: medicalHistoryData.exercise || '',
        homework: medicalHistoryData.homework || '',
        recommended_next_session: medicalHistoryData.recommended_next_session || '',
        additional_notes: medicalHistoryData.additional_notes || '',
      };
      
      console.log('Form values to set:', formValues);
      console.log('DateTime value:', dateTimeValue);
      form.setFieldsValue(formValues);
      setHasChanges(false);
    } else {
      console.log('Resetting form for new medical history');
      form.resetFields();
      setAppointmentDateTime('');
      setHasChanges(false);
    }
    
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [medicalHistoryData, form, disabled, formKey]);

  const onValuesChanged = (changedValues, allValues) => {
    if (!medicalHistoryData) {
      const changed = Object.keys(allValues).some(key => {
        const value = allValues[key];
        if (value && value.toString().trim() !== '') {
          return true;
        }
        return false;
      }) || appointmentDateTime !== '';
      setHasChanges(changed);
      return;
    }

    const changed = Object.keys(allValues).some(key => {
      const currentValue = allValues[key];
      const originalValue = medicalHistoryData[key];
      
      if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      }
      
      return currentValue !== originalValue;
    });
    
    setHasChanges(changed || appointmentDateTime !== '');
  };

  const handleDateTimeChange = (e) => {
    const value = e.target.value;
    console.log('DateTime changed to:', value);
    setAppointmentDateTime(value);
    setHasChanges(true);
  };

  const onSubmit = async () => {
    console.log('Form submitted');
    setLoadingSubmit(true);
    
    try {
      // Validate datetime first
      if (!appointmentDateTime) {
        throw new Error('Appointment date and time is required');
      }

      await form.validateFields();
      
      let body = form.getFieldsValue();
      console.log('Form data before processing:', body);
      
      // Convert datetime-local value to ISO string
      const appointmentMoment = moment(appointmentDateTime);
      if (!appointmentMoment.isValid()) {
        throw new Error('Invalid appointment date and time');
      }
      
      body.appointment_date = appointmentMoment.toISOString();
      console.log('Final appointment datetime:', body.appointment_date);

      // Format pain levels as integers
      if (body.pain_before !== undefined) {
        body.pain_before = body.pain_before ? parseInt(body.pain_before) : null;
      }
      if (body.pain_after !== undefined) {
        body.pain_after = body.pain_after ? parseInt(body.pain_after) : null;
      }

      // Remove empty strings
      Object.keys(body).forEach(key => {
        if (body[key] === '') {
          body[key] = null;
        }
      });

      console.log('Data to be saved:', body);

      let result;
      let msg;

      if (!medicalHistoryData) {
        msg = 'Successfully added new Medical History';
        console.log('Creating new medical history...');
        result = await MedicalHistoryModel.createMedicalHistory(body);
      } else {
        msg = 'Successfully updated Medical History';
        console.log('Updating medical history ID:', medicalHistoryData.id);
        result = await MedicalHistoryModel.updateMedicalHistory(medicalHistoryData.id, body);
      }

      console.log('API Response:', result);

      if (result && result.http_code === 200) {
        message.success(msg);
        
        if (isStandalone && onSubmitSuccess) {
          form.resetFields();
          setAppointmentDateTime('');
          setHasChanges(false);
          setFormKey(prev => prev + 1);
          
          setTimeout(() => {
            onSubmitSuccess();
          }, 300);
        } else {
          history.push("/medical-history");
        }
      } else {
        const errorMsg = result?.error_message || "Failed to save medical history";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving medical history:", error);
      let errorMessage = "An error occurred while saving medical history";
      
      if (error.errorFields) {
        errorMessage = "Please check the form for errors";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!medicalHistoryData || !medicalHistoryData.id) return;
      
      await swal.fire({
        title: 'Delete Medical History',
        text: 'Are you sure you want to delete this medical history record? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const deleteResult = await MedicalHistoryModel.deleteMedicalHistory(medicalHistoryData.id);
          if (deleteResult && deleteResult.http_code === 200) {
            message.success('Medical history deleted successfully');
            history.push("/medical-history");
          } else {
            message.error('Failed to delete medical history');
          }
        }
      });
    } catch (error) {
      console.error("Error deleting medical history:", error);
      message.error('Failed to delete medical history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: 'auto', 
      backgroundColor: '#FFFFFF',
      padding: '8px',
      color: '#000000'
    }}>
      <style>{customStyles}</style>
      <Container fluid style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {!isStandalone && (
          <Row style={{ marginBottom: '12px' }}>
            <Col span={24}>
              <Link to="/medical-history" style={{ 
                color: '#000000',
                fontSize: '13px', 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                fontWeight: 500
              }}>
                <span>←</span> Back
              </Link>
            </Col>
          </Row>
        )}

        {loading ? (
          <Row>
            <Col span={24}>
              <Card style={{ 
                textAlign: 'center', 
                padding: '40px', 
                backgroundColor: '#FFFFFF',
                border: '1px solid #d9d9d9'
              }}>
                <Spin size="large" />
              </Card>
            </Col>
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            {/* Header Section */}
            <Col span={24}>
              <Card style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '6px', 
                border: '1px solid #e0e0e0',
                padding: '12px'
              }} bodyStyle={{ padding: 0 }}>
                <Row align="middle" justify="space-between">
                  <Col span={24}>
                    <Title level={4} style={{ 
                      margin: 0, 
                      fontSize: '20px', 
                      color: '#000000',
                      fontWeight: 700 
                    }}>
                      {!medicalHistoryData ? "Add New Medical History" : "Update Medical History"}
                    </Title>
                    {medicalHistoryData && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666666' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: '#000000' }}>Record ID:</strong> {medicalHistoryData.id}
                        </div>
                        <div>
                          <strong style={{ color: '#000000' }}>Created:</strong> {moment(medicalHistoryData.created_at).format('DD MMM YYYY HH:mm')}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Main Form Section */}
            <Col span={24}>
              <Card style={{ 
                backgroundColor: '#FFFFFF',
                borderRadius: '6px', 
                border: '1px solid #e0e0e0',
                padding: '16px'
              }} bodyStyle={{ padding: 0 }}>
                <Form
                  form={form}
                  onFinish={onSubmit}
                  onValuesChange={onValuesChanged}
                  validateTrigger="onSubmit"
                  disabled={formDisabled}
                  autoComplete='off'
                  key={formKey}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Row gutter={[32, 0]}>
                    <Col xs={24}>
                      {/* Patient Selection */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Patient
                          </span>
                        }
                        name="patient_id"
                        rules={[
                          { required: true, message: 'Patient selection is required!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="medical-history-form-item"
                      >
                        <Select
                          className="medical-history-select patient-select"
                          placeholder="Select patient"
                          loading={patientsLoading}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {patients.map(patient => (
                            <Option key={patient.id} value={patient.id}>
                              {patient.name} ({patient.patient_code})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Appointment Date and Time - Native HTML5 Input */}
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ 
                          display: 'block',
                          marginBottom: '8px',
                          color: '#000000',
                          fontWeight: 600, 
                          fontSize: '14px' 
                        }}>
                          Appointment Date & Time <span style={{ color: '#ff4d4f' }}>*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="native-datetime-input"
                          value={appointmentDateTime}
                          onChange={handleDateTimeChange}
                          disabled={formDisabled}
                          required
                        />
                      </div>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          {/* Service Type */}
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Service Type
                              </span>
                            }
                            name="service_type"
                            rules={[
                              { required: true, message: 'Service type is required!' }
                            ]}
                            style={{ marginBottom: '10px' }}
                          >
                            <Select
                              className="medical-history-select"
                              placeholder="Select service type"
                            >
                              <Option value="Consultation">Consultation</Option>
                              <Option value="Therapy">Therapy</Option>
                              <Option value="Follow-up">Follow-up</Option>
                              <Option value="Emergency">Emergency</Option>
                              <Option value="Check-up">Check-up</Option>
                              <Option value="Rehabilitation">Rehabilitation</Option>
                              <Option value="Screening">Screening</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          {/* Staff ID (optional for now) */}
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Staff ID
                              </span>
                            }
                            name="staff_id"
                            style={{ marginBottom: '10px' }}
                          >
                            <Input 
                              placeholder="Enter staff ID"
                              style={{ 
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #d9d9d9',
                                color: '#000000',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                fontSize: '14px',
                                height: '34px'
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Pain Levels */}
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Pain Level (Before)
                              </span>
                            }
                            name="pain_before"
                            rules={[
                              { 
                                validator: (_, value) => {
                                  if (value === undefined || value === '' || value === null) {
                                    return Promise.resolve();
                                  }
                                  const num = parseInt(value);
                                  if (isNaN(num) || num < 1 || num > 10) {
                                    return Promise.reject(new Error('Please enter a number between 1-10'));
                                  }
                                  return Promise.resolve();
                                }
                              }
                            ]}
                            style={{ marginBottom: '10px' }}
                          >
                            <InputNumber
                              className="pain-level-input"
                              min={1}
                              max={10}
                              placeholder="1-10"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Pain Level (After)
                              </span>
                            }
                            name="pain_after"
                            rules={[
                              { 
                                validator: (_, value) => {
                                  if (value === undefined || value === '' || value === null) {
                                    return Promise.resolve();
                                  }
                                  const num = parseInt(value);
                                  if (isNaN(num) || num < 1 || num > 10) {
                                    return Promise.reject(new Error('Please enter a number between 1-10'));
                                  }
                                  return Promise.resolve();
                                }
                              }
                            ]}
                            style={{ marginBottom: '10px' }}
                          >
                            <InputNumber
                              className="pain-level-input"
                              min={1}
                              max={10}
                              placeholder="1-10"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Diagnosis Result */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Diagnosis Result
                          </span>
                        }
                        name="diagnosis_result"
                        rules={[
                          { required: true, message: 'Diagnosis result is required!' },
                          { max: 500, message: 'Max 500 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="medical-history-form-item"
                      >
                        <TextArea 
                          placeholder="Enter diagnosis result"
                          className="medical-history-textarea"
                          rows={3}
                        />
                      </Form.Item>

                      {/* Treatments */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Treatments
                          </span>
                        }
                        name="treatments"
                        rules={[
                          { max: 1000, message: 'Max 1000 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter treatments performed"
                          className="medical-history-textarea"
                          rows={3}
                        />
                      </Form.Item>

                      {/* Exercise */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Exercise
                          </span>
                        }
                        name="exercise"
                        rules={[
                          { max: 500, message: 'Max 500 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter recommended exercises"
                          className="medical-history-textarea"
                          rows={2}
                        />
                      </Form.Item>

                      {/* Homework */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Homework
                          </span>
                        }
                        name="homework"
                        rules={[
                          { max: 500, message: 'Max 500 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter homework assignments"
                          className="medical-history-textarea"
                          rows={2}
                        />
                      </Form.Item>

                      {/* Recommended Next Session */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Recommended Next Session
                          </span>
                        }
                        name="recommended_next_session"
                        style={{ marginBottom: '10px' }}
                      >
                        <Select
                          className="medical-history-select"
                          placeholder="Select recommended next session"
                          allowClear
                        >
                          <Option value="">Not specified</Option>
                          <Option value="1 day">1 day</Option>
                          <Option value="2 days">2 days</Option>
                          <Option value="3 days">3 days</Option>
                          <Option value="1 week">1 week</Option>
                          <Option value="2 weeks">2 weeks</Option>
                          <Option value="3 weeks">3 weeks</Option>
                          <Option value="1 month">1 month</Option>
                          <Option value="Follow-up as needed">Follow-up as needed</Option>
                        </Select>
                      </Form.Item>

                      {/* Additional Notes */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Additional Notes
                          </span>
                        }
                        name="additional_notes"
                        rules={[
                          { max: 1000, message: 'Max 1000 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter additional notes"
                          className="medical-history-textarea"
                          rows={2}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Action Buttons */}
                  <Row style={{ 
                    marginTop: '16px', 
                    paddingTop: '12px', 
                    borderTop: '1px solid #e0e0e0' 
                  }}>
                    <Col span={24}>
                      {!formDisabled ? (
                        <Row align="middle" justify="space-between">
                          <Col>
                            {isStandalone && (
                              <Text style={{ 
                                fontSize: '12px', 
                                color: '#999999',
                                fontStyle: 'italic'
                              }}>
                                Form resets after submission
                              </Text>
                            )}
                          </Col>
                          
                          <Col>
                            <Space size={8}>
                              <Button 
                                htmlType='submit' 
                                loading={loadingSubmit}
                                style={{ 
                                  backgroundColor: '#000000',
                                  borderColor: '#000000',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  height: '36px',
                                  padding: '0 24px',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}
                              >
                                {!medicalHistoryData ? "Add Record" : "Save"}
                              </Button>
                              
                              {medicalHistoryData && (
                                <Button 
                                  onClick={handleDelete}
                                  style={{ 
                                    backgroundColor: '#d93025',
                                    borderColor: '#d93025',
                                    color: '#FFFFFF',
                                    height: '36px',
                                    padding: '0 20px',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                >
                                  Delete
                                </Button>
                              )}

                              {!isStandalone && (
                                <Button 
                                  onClick={() => history.push("/medical-history")}
                                  style={{ 
                                    height: '36px',
                                    padding: '0 20px',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Space>
                          </Col>
                        </Row>
                      ) : null}
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <Prompt
        when={hasChanges && !loadingSubmit}
        message={"Are you sure you want to leave before saving?"}
      />
    </div>
  );
}