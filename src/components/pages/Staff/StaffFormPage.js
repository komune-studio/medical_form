import React, { useState, useEffect } from 'react';
import { useHistory, Link, Prompt } from 'react-router-dom';
import { 
  Button, 
  message, 
  Spin, 
  Typography, 
  Form, 
  Input, 
  Radio,
  Space,
  Row,
  Col,
  Card
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import StaffModel from 'models/StaffModel';
import moment from 'moment';

const { Title, Text } = Typography;

// Add custom styles for responsive field spacing
const customStyles = `
  @media (min-width: 768px) and (max-width: 1024px) {
    .staff-form-item {
      margin-bottom: 14px !important;
    }
  }
  
  /* Radio button styling */
  .status-radio .ant-radio-wrapper {
    color: #000000;
    font-size: 14px;
  }
  
  .status-radio .ant-radio-checked .ant-radio-inner {
    border-color: #000000;
    background-color: #000000;
  }
  
  .status-radio .ant-radio-inner::after {
    background-color: white;
  }
  
  /* Active/Inactive badge styling */
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    margin-left: 8px;
  }
  
  .active-badge {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }
  
  .inactive-badge {
    background: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
  }
`;

export default function StaffFormPage({
  staffData,
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

  const onValuesChanged = (changedValues, allValues) => {
    if (!staffData) {
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
      const originalValue = staffData[key];
      
      if (Array.isArray(currentValue) || Array.isArray(originalValue)) {
        return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      }
      
      return currentValue !== originalValue;
    });
    
    setHasChanges(changed);
  };

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      await form.validateFields();
      
      let body = form.getFieldsValue();
      
      // Validate required fields
      const validation = validateStaffData(body);
      if (!validation.isValid) {
        const errorMsg = Object.values(validation.errors).join(', ');
        message.error(`Validation errors: ${errorMsg}`);
        setLoadingSubmit(false);
        return;
      }

      let result;
      let msg;

      if (!staffData) {
        msg = 'Successfully added new Staff';
        result = await StaffModel.createStaff(body);
      } else {
        msg = 'Successfully updated Staff';
        result = await StaffModel.updateStaff(staffData.id, body);
      }

      if (result && result.http_code === 200) {
        message.success(msg);
        
        if (isStandalone && onSubmitSuccess) {
          form.resetFields();
          setHasChanges(false);
          setFormKey(prev => prev + 1);
          
          setTimeout(() => {
            onSubmitSuccess();
          }, 300);
        } else {
          history.push("/staff");
        }
      } else {
        throw new Error(result?.error_message || "Failed to save staff");
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      let errorMessage = "An error occurred while saving staff";
      
      await swal.fire({
        title: 'Error',
        text: error.error_message ? error.error_message : errorMessage,
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!staffData || !staffData.id) return;
      
      await swal.fire({
        title: 'Delete Staff',
        text: 'Are you sure you want to delete this staff permanently?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const deleteResult = await StaffModel.deleteStaff(staffData.id);
          if (deleteResult && deleteResult.http_code === 200) {
            message.success('Staff deleted successfully');
            history.push("/staff");
          }
        }
      });
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error('Failed to delete staff');
    }
  };

  // Validation function
  const validateStaffData = (data) => {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
      errors.name = "Staff name is required";
    } else if (data.name.length > 255) {
      errors.name = "Max 255 characters";
    }

    if (!data.phone_number || data.phone_number.trim() === "") {
      errors.phone_number = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9+()-]+$/;
      if (!phoneRegex.test(data.phone_number)) {
        errors.phone_number = "Invalid phone number format";
      } else if (data.phone_number.length > 20) {
        errors.phone_number = "Max 20 characters";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  useEffect(() => {
    if (staffData) {
      form.setFieldsValue({
        name: staffData.name,
        phone_number: staffData.phone_number,
        active: staffData.active !== undefined ? staffData.active : true,
      });
      setHasChanges(false);
    } else {
      // Create mode: default active = true
      form.setFieldsValue({
        name: '',
        phone_number: '',
        active: true, // Default active
      });
      setHasChanges(false);
    }
    
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [staffData, form, disabled, formKey]);

  // Get current status from form
  const currentStatus = form.getFieldValue('active');
  
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
              <Link to="/staff" style={{ 
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
                      {!staffData ? "Add New Staff" : "Update Staff"}
                    </Title>
                    {staffData && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666666' }}>
                        <span style={{ marginRight: '16px' }}>
                          <strong style={{ color: '#000000' }}>ID:</strong> #{staffData.id}
                        </span>
                        <span style={{ marginRight: '16px' }}>
                          <strong style={{ color: '#000000' }}>Created:</strong> {moment(staffData.created_at).format('DD MMM YYYY HH:mm')}
                        </span>
                        <span className={`status-badge ${staffData.active ? 'active-badge' : 'inactive-badge'}`}>
                          {staffData.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
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
                >
                  <Row gutter={[32, 0]}>
                    {/* Single Column - All fields vertical */}
                    <Col xs={24}>
                      {/* 1. Staff Name */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Staff Name <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="name"
                        rules={[
                          { required: true, message: 'Staff name is required!' },
                          { max: 255, message: 'Max 255 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="staff-form-item"
                      >
                        <Input 
                          placeholder="Enter staff name"
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

                      {/* 2. Phone Number */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Phone Number <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="phone_number"
                        rules={[
                          { required: true, message: 'Phone number is required!' },
                          { pattern: /^[0-9+()-]+$/, message: 'Invalid phone number format!' },
                          { max: 20, message: 'Max 20 characters!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="staff-form-item"
                      >
                        <Input 
                          placeholder="08123456789"
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

                      {/* 3. Status (Active/Inactive) - RADIO BUTTON */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Status
                          </span>
                        }
                        name="active"
                        rules={[{ required: true, message: 'Please select status!' }]}
                        style={{ marginBottom: '10px' }}
                        className="staff-form-item status-radio"
                      >
                        <Radio.Group 
                          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                        >
                          <Radio value={true}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#000000' }}>Active</span>
                              <span className="status-badge active-badge" style={{ marginLeft: '8px' }}>
                                ACTIVE
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#666',
                              marginLeft: '24px',
                              marginTop: '2px'
                            }}>
                              Staff will be available for selection in visitor forms
                            </div>
                          </Radio>
                          
                          <Radio value={false}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: '#000000' }}>Inactive</span>
                              <span className="status-badge inactive-badge" style={{ marginLeft: '8px' }}>
                                INACTIVE
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#666',
                              marginLeft: '24px',
                              marginTop: '2px'
                            }}>
                              Staff will not be available for selection in visitor forms
                            </div>
                          </Radio>
                        </Radio.Group>
                      </Form.Item>

                      {/* Current Status Preview */}
                      <div style={{ 
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: currentStatus ? '#f6ffed' : '#fff2f0',
                        border: `1px solid ${currentStatus ? '#b7eb8f' : '#ffccc7'}`,
                        borderRadius: '4px',
                        fontSize: '13px',
                        color: currentStatus ? '#52c41a' : '#ff4d4f'
                      }}>
                        <div style={{ fontWeight: 500 }}>
                          Current selection: 
                          <span style={{ marginLeft: '8px' }}>
                            {currentStatus ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '12px' }}>
                          {currentStatus 
                            ? 'This staff will appear in dropdown lists for visitor forms' 
                            : 'This staff will be hidden from dropdown lists in visitor forms'}
                        </div>
                      </div>
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
                                {!staffData ? "Submit" : "Save"}
                              </Button>
                              
                              {staffData && !isStandalone && (
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
                                  onClick={() => history.push("/staff")}
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