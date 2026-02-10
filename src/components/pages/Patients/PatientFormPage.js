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
  DatePicker,
  Row,
  Col,
  Card,
  Space,
  InputNumber
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import PatientModel from 'models/PatientModel';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Update custom styles to match VisitorFormPage style
const customStyles = `
  /* Custom styling untuk Select dropdown */
  .patient-select .ant-select-selector {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    height: 34px !important;
    padding: 4px 11px !important;
    font-size: 14px !important;
  }
  
  .patient-select .ant-select-selection-placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
    font-size: 14px !important;
  }
  
  .patient-select .ant-select-selection-item {
    color: #000000 !important;
    font-size: 14px !important;
  }
  
  .patient-select .ant-select-arrow {
    color: rgba(0, 0, 0, 0.25) !important;
  }
  
  /* Hover state */
  .patient-select .ant-select-selector:hover {
    border-color: #666666 !important;
  }
  
  /* Focus state */
  .patient-select.ant-select-focused .ant-select-selector {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Dropdown menu styling */
  .patient-select .ant-select-dropdown {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    border-radius: 4px !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 
                0 6px 16px 0 rgba(0, 0, 0, 0.08), 
                0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
  }
  
  .patient-select .ant-select-item {
    color: #000000 !important;
    background-color: #FFFFFF !important;
    font-size: 14px !important;
    padding: 8px 12px !important;
    min-height: 36px !important;
  }
  
  .patient-select .ant-select-item:hover {
    background-color: #f5f5f5 !important;
  }
  
  .patient-select .ant-select-item-option-selected {
    background-color: #f5f5f5 !important;
    color: #000000 !important;
    font-weight: normal !important;
  }
  
  .patient-select .ant-select-item-option-active {
    background-color: #f5f5f5 !important;
  }
  
  /* Search input inside dropdown */
  .patient-select .ant-select-dropdown .ant-select-dropdown-search input {
    background-color: #FFFFFF !important;
    color: #000000 !important;
    border: 1px solid #d9d9d9 !important;
  }
  
  /* Custom styling untuk DatePicker */
  .patient-datepicker .ant-picker {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    height: 34px !important;
    width: 100% !important;
  }
  
  .patient-datepicker .ant-picker-input > input {
    color: #000000 !important;
    font-size: 14px !important;
    height: 24px !important;
  }
  
  .patient-datepicker .ant-picker-input > input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }
  
  .patient-datepicker .ant-picker-suffix {
    color: rgba(0, 0, 0, 0.25) !important;
  }
  
  /* Readonly fields */
  .readonly-field .ant-input {
    background-color: #fafafa !important;
    color: #666666 !important;
    cursor: not-allowed !important;
  }
  
  /* TextArea styling */
  .patient-textarea .ant-input {
    min-height: 80px !important;
    resize: vertical !important;
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
  
  .patient-textarea .ant-input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }

  /* InputNumber styling */
  .patient-input-number .ant-input-number {
    background-color: #FFFFFF !important;
    border: 1px solid #d9d9d9 !important;
    color: #000000 !important;
    border-radius: 4px !important;
    width: 100% !important;
    height: 34px !important;
  }

  .patient-input-number .ant-input-number-input {
    color: #000000 !important;
    font-size: 14px !important;
    height: 32px !important;
  }

  .patient-input-number .ant-input-number-input::placeholder {
    color: rgba(0, 0, 0, 0.4) !important;
  }

  .patient-input-number .ant-input-number:hover {
    border-color: #666666 !important;
  }

  .patient-input-number .ant-input-number-focused {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
  
  /* Tablet responsive */
  @media (min-width: 768px) and (max-width: 1024px) {
    .patient-form-item {
      margin-bottom: 14px !important;
    }
    
    .patient-select .ant-select-selector {
      height: 40px !important;
      font-size: 16px !important;
      padding: 8px 12px !important;
    }
    
    .patient-select .ant-select-selection-placeholder {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .patient-select .ant-select-selection-item {
      font-size: 16px !important;
      line-height: 24px !important;
    }
    
    .patient-select .ant-select-item {
      font-size: 16px !important;
      padding: 10px 12px !important;
      min-height: 44px !important;
    }
    
    .patient-datepicker .ant-picker {
      height: 40px !important;
    }
    
    .patient-datepicker .ant-picker-input > input {
      font-size: 16px !important;
    }
    
    .patient-textarea .ant-input {
      min-height: 100px !important;
      font-size: 16px !important;
    }

    .patient-input-number .ant-input-number {
      height: 40px !important;
    }

    .patient-input-number .ant-input-number-input {
      font-size: 16px !important;
      height: 38px !important;
    }
  }
`;

export default function PatientFormPage({
  patientData,
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
  const [bmi, setBmi] = useState(null);

  const calculateBMI = (height, weight) => {
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      return Math.round(bmiValue * 10) / 10;
    }
    return null;
  };

  const onValuesChanged = (changedValues, allValues) => {
    // Update BMI calculation when height or weight changes
    if (changedValues.height !== undefined || changedValues.weight !== undefined) {
      const newBMI = calculateBMI(allValues.height, allValues.weight);
      setBmi(newBMI);
    }

    if (!patientData) {
      const changed = Object.keys(allValues).some(key => {
        const value = allValues[key];
        if (value && value.toString().trim() !== '') {
          return true;
        }
        return false;
      });
      setHasChanges(changed);
      return;
    }

    const changed = Object.keys(allValues).some(key => {
      const currentValue = allValues[key];
      const originalValue = patientData[key];
      
      if (key === 'date_of_birth' && currentValue) {
        const formattedCurrent = moment(currentValue).format('YYYY-MM-DD');
        const formattedOriginal = moment(originalValue).format('YYYY-MM-DD');
        return formattedCurrent !== formattedOriginal;
      }
      
      if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      }
      
      return currentValue !== originalValue;
    });
    
    setHasChanges(changed);
  };

  const onSubmit = async () => {
    console.log('Form submitted');
    setLoadingSubmit(true);
    
    try {
      await form.validateFields();
      
      let body = form.getFieldsValue();
      console.log('Form data before processing:', body);
      
      // Hapus field yang tidak perlu dikirim ke backend
      delete body.patient_code;
      
      // Format tanggal lahir
      if (body.date_of_birth) {
        body.date_of_birth = moment(body.date_of_birth).format('YYYY-MM-DD');
      }

      console.log('Data to be saved:', body);

      let result;
      let msg;

      if (!patientData) {
        msg = 'Successfully added new Patient';
        console.log('Creating new patient...');
        result = await PatientModel.createPatient(body);
      } else {
        msg = 'Successfully updated Patient';
        console.log('Updating patient ID:', patientData.id);
        if (!body.patient_code) {
          delete body.patient_code;
        }
        result = await PatientModel.updatePatient(patientData.id, body);
      }

      console.log('API Response:', result);

      if (result && result.http_code === 200) {
        message.success(msg);
        
        if (isStandalone && onSubmitSuccess) {
          form.resetFields();
          setHasChanges(false);
          setBmi(null);
          setFormKey(prev => prev + 1);
          
          setTimeout(() => {
            onSubmitSuccess();
          }, 300);
        } else {
          history.push("/patients");
        }
      } else {
        const errorMsg = result?.error_message || "Failed to save patient";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      let errorMessage = "An error occurred while saving patient";
      
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
      if (!patientData || !patientData.id) return;
      
      await swal.fire({
        title: 'Delete Patient',
        text: 'Are you sure you want to delete this patient?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      }).then(async (result) => {
        if (result.isConfirmed) {
          setLoading(true);
          const deleteResult = await PatientModel.deletePatient(patientData.id);
          if (deleteResult && deleteResult.http_code === 200) {
            message.success('Patient deleted successfully');
            history.push("/patients");
          } else {
            message.error('Failed to delete patient');
          }
        }
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      message.error('Failed to delete patient');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PatientFormPage useEffect triggered with patientData:', patientData);
    
    if (patientData) {
      console.log('Setting form values for patient:', patientData);
      const formValues = {
        patient_code: patientData.patient_code,
        name: patientData.name,
        date_of_birth: patientData.date_of_birth ? moment(patientData.date_of_birth) : null,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        height: patientData.height,
        weight: patientData.weight,
        address: patientData.address,
        medical_notes: patientData.medical_notes || '',
        allergies: patientData.allergies || '',
      };
      
      console.log('Form values to set:', formValues);
      form.setFieldsValue(formValues);
      
      // Calculate initial BMI
      const initialBMI = calculateBMI(patientData.height, patientData.weight);
      setBmi(initialBMI);
      
      setHasChanges(false);
    } else {
      console.log('Resetting form for new patient');
      form.resetFields();
      setBmi(null);
      setHasChanges(false);
    }
    
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [patientData, form, disabled, formKey]);

  return (
    <div style={{ 
      minHeight: 'auto', 
      backgroundColor: '#FFFFFF',
      padding: '8px',
      color: '#000000'
    }}>
      <style>{customStyles}</style>
      <Container fluid style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {!isStandalone && (
          <Row style={{ marginBottom: '12px' }}>
            <Col span={24}>
              <Link to="/patients" style={{ 
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
                      {!patientData ? "Add New Patient" : "Update Patient"}
                    </Title>
                    {patientData && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666666' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: '#000000' }}>Patient Code:</strong> {patientData.patient_code}
                        </div>
                        <div>
                          <strong style={{ color: '#000000' }}>Created:</strong> {moment(patientData.created_at).format('DD MMM YYYY HH:mm')}
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
                      {/* Patient Code (Display only for edit) */}
                      {patientData && (
                        <Form.Item
                          label={
                            <span style={{ 
                              color: '#000000',
                              fontWeight: 600, 
                              fontSize: '14px' 
                            }}>
                              Patient Code
                            </span>
                          }
                          name="patient_code"
                          style={{ marginBottom: '10px' }}
                          className="patient-form-item"
                        >
                          <Input 
                            className="readonly-field"
                            readOnly
                            style={{ 
                              backgroundColor: '#fafafa',
                              border: '1px solid #d9d9d9',
                              color: '#666666',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              fontSize: '14px',
                              height: '34px'
                            }}
                          />
                        </Form.Item>
                      )}

                      {/* Full Name */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Full Name
                          </span>
                        }
                        name="name"
                        rules={[
                          { required: true, message: 'Required!' },
                          { max: 150, message: 'Max 150 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="patient-form-item"
                      >
                        <Input 
                          placeholder="Enter patient's full name"
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

                      {/* Date of Birth */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Date of Birth
                          </span>
                        }
                        name="date_of_birth"
                        rules={[
                          { required: true, message: 'Required!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="patient-form-item"
                      >
                        <DatePicker
                          className="patient-datepicker"
                          placeholder="DD/MM/YYYY"
                          format="DD/MM/YYYY"
                          disabledDate={(current) => {
                            return current && current > moment().endOf('day');
                          }}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      {/* Gender */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Gender
                          </span>
                        }
                        name="gender"
                        rules={[
                          { required: true, message: 'Required!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <Select
                          className="patient-select"
                          placeholder="Select gender"
                          allowClear
                        >
                          <Option value="MALE">Male</Option>
                          <Option value="FEMALE">Female</Option>
                        </Select>
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          {/* Height */}
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Height (cm)
                              </span>
                            }
                            name="height"
                            rules={[
                              { type: 'number', min: 1, max: 300, message: 'Height must be between 1-300 cm' }
                            ]}
                            style={{ marginBottom: '10px' }}
                          >
                            <InputNumber
                              className="patient-input-number"
                              placeholder="Enter height"
                              min={1}
                              max={300}
                              precision={2}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          {/* Weight */}
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Weight (kg)
                              </span>
                            }
                            name="weight"
                            rules={[
                              { type: 'number', min: 1, max: 500, message: 'Weight must be between 1-500 kg' }
                            ]}
                            style={{ marginBottom: '10px' }}
                          >
                            <InputNumber
                              className="patient-input-number"
                              placeholder="Enter weight"
                              min={1}
                              max={500}
                              precision={2}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* BMI Display */}
                      {bmi !== null && (
                        <div style={{ 
                          marginBottom: '10px', 
                          padding: '8px 12px',
                          backgroundColor: '#f0f5ff',
                          border: '1px solid #adc6ff',
                          borderRadius: '4px'
                        }}>
                          <Text style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px',
                            marginRight: '8px'
                          }}>
                            BMI:
                          </Text>
                          <Text style={{ fontSize: '14px', color: '#1890ff', fontWeight: 500 }}>
                            {bmi}
                          </Text>
                          <Text style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                            {bmi < 18.5 ? '(Underweight)' : 
                             bmi < 25 ? '(Normal)' : 
                             bmi < 30 ? '(Overweight)' : '(Obese)'}
                          </Text>
                        </div>
                      )}

                      {/* Phone Number */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Phone Number
                          </span>
                        }
                        name="phone"
                        rules={[
                          { required: true, message: 'Required!' },
                          { pattern: /^[0-9+()-]+$/, message: 'Invalid format!' },
                          { max: 20, message: 'Max 20 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="patient-form-item"
                      >
                        <Input 
                          placeholder="Enter phone number"
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

                      {/* Email */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Email
                          </span>
                        }
                        name="email"
                        rules={[
                          { type: 'email', message: 'Invalid email format' },
                          { max: 100, message: 'Max 100 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="patient-form-item"
                      >
                        <Input 
                          placeholder="Enter email address"
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

                      {/* Address */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Address
                          </span>
                        }
                        name="address"
                        rules={[
                          { max: 500, message: 'Max 500 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter patient's address"
                          className="patient-textarea"
                          rows={3}
                        />
                      </Form.Item>

                      {/* Medical Notes */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Medical Notes
                          </span>
                        }
                        name="medical_notes"
                        rules={[
                          { max: 1000, message: 'Max 1000 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter medical notes"
                          className="patient-textarea"
                          rows={2}
                        />
                      </Form.Item>

                      {/* Allergies */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Allergies
                          </span>
                        }
                        name="allergies"
                        rules={[
                          { max: 500, message: 'Max 500 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter allergies information"
                          className="patient-textarea"
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
                                {!patientData ? "Add Patient" : "Save"}
                              </Button>
                              
                              {patientData && (
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
                                  onClick={() => history.push("/patients")}
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