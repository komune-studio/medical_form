import React, { useState, useEffect, useRef } from 'react';
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
import StaffModel from 'models/StaffModel';
import UploadService from '../../../utils/Uploadservice';
import moment from 'moment';
import BodyAnnotation from './BodyAnnotation';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper function untuk convert base64 ke Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

// Treatment options
const TREATMENT_OPTIONS = [
  'Tens',
  'Ultrasound',
  'Shockwave',
  'Massage',
  'Leg Massage',
  'Ice'
];

// Recommended next session options
const NEXT_SESSION_OPTIONS = [
  'This week',
  'Next Week',
  'Next 2 Weeks',
  'Next Month',
  'Try pilates session'
];

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
  
  // Staff state
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  
  // Body Annotation ref
  const bodyAnnotationRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setStaffLoading(true);
        const response = await StaffModel.getActiveStaff();
        console.log('Staff response:', response);
        
        if (response && response.http_code === 200) {
          setStaffList(Array.isArray(response.data) ? response.data : []);
        } else if (Array.isArray(response.data)) {
          setStaffList(response.data);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        message.error('Failed to load staff list');
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, []);

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

  // Initialize form data
  useEffect(() => {
    console.log('MedicalHistoryFormPage useEffect triggered with medicalHistoryData:', medicalHistoryData);
    
    if (medicalHistoryData) {
      console.log('Setting form values for medical history:', medicalHistoryData);
      
      let dateTimeValue = '';
      
      if (medicalHistoryData.appointment_date) {
        const momentDate = moment(medicalHistoryData.appointment_date);
        dateTimeValue = momentDate.format('YYYY-MM-DDTHH:mm');
        setAppointmentDateTime(dateTimeValue);
      }
      
      const formValues = {
        patient_id: medicalHistoryData.patient_id,
        staff_id: medicalHistoryData.staff_id || undefined,
        service_type: medicalHistoryData.service_type || '',
        diagnosis_result: medicalHistoryData.diagnosis_result || '',
        pain_before: medicalHistoryData.pain_before || '',
        pain_after: medicalHistoryData.pain_after || '',
        treatments: medicalHistoryData.treatments || '',
        exercise: medicalHistoryData.exercise || '',
        homework: medicalHistoryData.homework || '',
        recommended_next_session: medicalHistoryData.recommended_next_session || '',
        additional_notes: medicalHistoryData.additional_notes || '',
        body_annotation: medicalHistoryData.body_annotation || '',
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
      
      // 👇 SIMPLE LOGIC: UPLOAD GAMBAR + ANNOTATION
      if (bodyAnnotationRef.current) {
        const hasLocalFile = bodyAnnotationRef.current.hasLocalFile();
        const hasAnnotations = bodyAnnotationRef.current.hasAnnotations();
        
        // Jika ada gambar baru atau ada annotation
        if (hasLocalFile || hasAnnotations) {
          try {
            setUploadingImage(true);
            message.loading({ content: 'Processing anatomy image...', key: 'uploadImage', duration: 0 });
            
            let fileToUpload;
            
            // Jika ada annotation, export canvas sebagai gambar
            if (hasAnnotations) {
              const imageDataUrl = bodyAnnotationRef.current.exportAsImage();
              
              if (imageDataUrl) {
                // Convert base64 to File
                const blob = dataURLtoBlob(imageDataUrl);
                const fileName = hasLocalFile ? bodyAnnotationRef.current.getLocalFile().name : 'body-annotation.jpg';
                fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });
              }
            } 
            // Jika hanya upload gambar baru tanpa annotation
            else if (hasLocalFile) {
              fileToUpload = bodyAnnotationRef.current.getLocalFile();
            }
            
            if (fileToUpload) {
              console.log('Uploading image with annotations:', fileToUpload.name);
              
              const uploadedUrl = await UploadService.uploadAnatomyImage(fileToUpload);
              console.log('Image uploaded successfully:', uploadedUrl);
              
              message.success({ content: 'Image uploaded!', key: 'uploadImage', duration: 2 });
              
              // Update BodyAnnotation component
              bodyAnnotationRef.current.setUploadedImageUrl(uploadedUrl);
              
              // 👇 SIMPLE: Simpan HANYA URL-nya aja (string), bukan JSON!
              body.body_annotation = uploadedUrl; // Langsung string URL
            }
            
          } catch (uploadError) {
            message.error({ content: 'Failed to upload image', key: 'uploadImage' });
            throw new Error('Image upload failed: ' + uploadError.message);
          } finally {
            setUploadingImage(false);
          }
        } else {
          // Jika tidak ada perubahan gambar/annotation, tetap simpan data yang ada
          if (body.body_annotation) {
            try {
              // Coba parse dulu, mungkin masih JSON
              const parsed = JSON.parse(body.body_annotation);
              // Ambil URL-nya aja
              body.body_annotation = parsed.imageUrl || body.body_annotation;
            } catch (e) {
              // Kalo udah string URL, biarin aja
              console.log('body_annotation is already a string URL');
            }
          }
        }
      }
      
      // Convert datetime-local value to ISO string
      const appointmentMoment = moment(appointmentDateTime);
      if (!appointmentMoment.isValid()) {
        throw new Error('Invalid appointment date and time');
      }
      
      body.appointment_date = appointmentMoment.toISOString();
      console.log('Final appointment datetime:', body.appointment_date);

      // Convert staff_id to integer
      if (body.staff_id !== undefined && body.staff_id !== null && body.staff_id !== '') {
        body.staff_id = parseInt(body.staff_id);
        console.log('Converted staff_id to integer:', body.staff_id);
      } else {
        body.staff_id = null;
      }

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
            throw new Error(deleteResult?.error_message || 'Failed to delete medical history');
          }
        }
      });
    } catch (error) {
      console.error("Error deleting medical history:", error);
      await swal.fire({
        title: 'Error',
        text: error.message || 'Failed to delete medical history',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f7f8fa',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <style>{customStyles}</style>
      
      <Container>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px' 
          }}>
            <Spin size="large" tip="Loading..." />
          </div>
        ) : (
          <Row justify="center">
            <Col xs={24} sm={24} md={22} lg={20} xl={18}>
              <Card 
                bordered={false}
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
                headStyle={{
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#FFFFFF',
                  padding: '16px'
                }}
                title={
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <Title level={4} style={{ 
                      margin: 0,
                      color: '#000000',
                      fontWeight: 700,
                      fontSize: '20px'
                    }}>
                      {!medicalHistoryData ? "New Medical History" : "Medical History Details"}
                    </Title>
                    
                    {!isStandalone && (
                      <Button 
                        onClick={() => history.push("/medical-history")}
                        style={{ 
                          height: '32px',
                          padding: '0 16px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          borderColor: '#d9d9d9'
                        }}
                      >
                        ← Back to List
                      </Button>
                    )}
                  </div>
                }
                bodyStyle={{ 
                  backgroundColor: '#FFFFFF',
                  padding: '16px'
                }} 
                headStyle={{ 
                  backgroundColor: '#FFFFFF',
                  borderBottom: '1px solid #e0e0e0',
                  padding: '16px'
                }} 
                bodyStyle={{ padding: 20 }}>
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
                              <Option value="Physiotherapy">Physiotherapy</Option>
                              <Option value="Pilates">Pilates</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                          {/* Staff Dropdown */}
                          <Form.Item
                            label={
                              <span style={{ 
                                color: '#000000',
                                fontWeight: 600, 
                                fontSize: '14px' 
                              }}>
                                Staff
                              </span>
                            }
                            name="staff_id"
                            style={{ marginBottom: '10px' }}
                          >
                            <Select
                              className="medical-history-select"
                              placeholder="Select staff (optional)"
                              loading={staffLoading}
                              showSearch
                              allowClear
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                            >
                              {staffList.map(staff => (
                                <Option key={staff.id} value={staff.id}>
                                  {staff.name} - {staff.phone_number}
                                </Option>
                              ))}
                            </Select>
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
                              { type: 'number', min: 0, max: 10, message: 'Pain level must be between 0 and 10!' }
                            ]}
                            style={{ marginBottom: '10px' }}
                            className="pain-level-input"
                          >
                            <InputNumber
                              min={0}
                              max={10}
                              placeholder="0-10 scale"
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
                              { type: 'number', min: 0, max: 10, message: 'Pain level must be between 0 and 10!' }
                            ]}
                            style={{ marginBottom: '10px' }}
                            className="pain-level-input"
                          >
                            <InputNumber
                              min={0}
                              max={10}
                              placeholder="0-10 scale"
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
                          { max: 1000, message: 'Max 1000 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                      >
                        <TextArea 
                          placeholder="Enter diagnosis result"
                          className="medical-history-textarea"
                          rows={3}
                        />
                      </Form.Item>

                      {/* Treatments - Now Dropdown */}
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
                        style={{ marginBottom: '10px' }}
                      >
                        <Select
                          className="medical-history-select"
                          placeholder="Select treatment"
                          allowClear
                        >
                          {TREATMENT_OPTIONS.map(treatment => (
                            <Option key={treatment} value={treatment}>
                              {treatment}
                            </Option>
                          ))}
                        </Select>
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

                      {/* Recommended Next Session - Updated Options */}
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
                          {NEXT_SESSION_OPTIONS.map(option => (
                            <Option key={option} value={option}>
                              {option}
                            </Option>
                          ))}
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

                      {/* Body Annotation */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Body Pain Diagram
                          </span>
                        }
                        name="body_annotation"
                        style={{ marginBottom: '10px' }}
                      >
                        <BodyAnnotation 
                          ref={bodyAnnotationRef}
                          disabled={formDisabled} 
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
                                loading={loadingSubmit || uploadingImage}
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