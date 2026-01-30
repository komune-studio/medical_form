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
  Select,
  Space,
  Row,
  Col,
  Card
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import FormModel from 'models/VisitorModel';
import StaffModel from 'models/StaffModel';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

// Add custom styles for responsive field spacing
const customStyles = `
  @media (min-width: 768px) and (max-width: 1024px) {
    .visitor-form-item {
      margin-bottom: 14px !important;
    }
  }
`;

export default function VisitorFormPage({
  visitorData,
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
  const [currentProfile, setCurrentProfile] = useState("Visitor");
  const [formKey, setFormKey] = useState(0);
  
  // New states for staff dropdown
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Fetch staff data for dropdown
  const fetchStaffData = async () => {
    setStaffLoading(true);
    try {
      const result = await StaffModel.getActiveStaff();
      if (result && result.http_code === 200) {
        const options = result.data.map(staff => ({
          value: staff.id,
          label: `${staff.name} - ${staff.phone_number}`,
          staffData: staff
        }));
        setStaffOptions(options);
        
        // If editing visitor, set the selected staff
        if (visitorData && visitorData.staff_id) {
          const staff = result.data.find(s => s.id === visitorData.staff_id);
          if (staff) {
            setSelectedStaff(staff);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      message.error('Failed to load staff data');
    } finally {
      setStaffLoading(false);
    }
  };

  const onValuesChanged = (changedValues, allValues) => {
    if (changedValues.visitor_profile) {
      setCurrentProfile(changedValues.visitor_profile);
    }
    
    // Handle staff_id change
    if (changedValues.staff_id !== undefined) {
      const selected = staffOptions.find(opt => opt.value === changedValues.staff_id);
      setSelectedStaff(selected ? selected.staffData : null);
    }

    if (!visitorData) {
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
      const originalValue = visitorData[key];
      
      if (key === 'checked_out_at') {
        return false;
      }
      
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
      
      // Transform data for new API (with staff_id instead of filled_by)
      const transformedBody = {
        visitor_name: body.visitor_name,
        phone_number: body.phone_number,
        visitor_profile: body.visitor_profile,
        staff_id: body.staff_id,
      };
      
      if (body.visitor_profile === 'Other' && body.visitor_profile_other) {
        transformedBody.visitor_profile_other = body.visitor_profile_other;
      }

      // Validate required fields
      if (!transformedBody.staff_id) {
        message.error('Please select a staff member');
        setLoadingSubmit(false);
        return;
      }

      let result;
      let msg;

      if (!visitorData) {
        msg = 'Successfully added new Visitor';
        result = await FormModel.createVisitor(transformedBody);
      } else {
        msg = 'Successfully updated Visitor';
        result = await FormModel.updateVisitor(visitorData.id, transformedBody);
      }

      if (result && result.http_code === 200) {
        message.success(msg);
        
        if (isStandalone && onSubmitSuccess) {
          form.resetFields();
          setHasChanges(false);
          setCurrentProfile("Visitor");
          setSelectedStaff(null);
          setFormKey(prev => prev + 1);
          
          setTimeout(() => {
            onSubmitSuccess();
          }, 300);
        } else {
          history.push("/visitors");
        }
      } else {
        throw new Error(result?.error_message || "Failed to save visitor");
      }
    } catch (error) {
      console.error("Error saving visitor:", error);
      let errorMessage = "An error occurred while saving visitor";
      
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

  const handleCheckout = async () => {
    try {
      if (!visitorData || !visitorData.id) return;
      
      await swal.fire({
        title: 'Checkout Visitor',
        text: 'Are you sure you want to checkout this visitor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, checkout',
        cancelButtonText: 'Cancel'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const checkoutResult = await FormModel.checkoutVisitor(visitorData.id);
          if (checkoutResult && checkoutResult.http_code === 200) {
            message.success('Visitor checked out successfully');
            history.push("/visitors");
          }
        }
      });
    } catch (error) {
      console.error("Error checking out visitor:", error);
      message.error('Failed to checkout visitor');
    }
  };

  const handleDelete = async () => {
    try {
      if (!visitorData || !visitorData.id) return;
      
      await swal.fire({
        title: 'Delete Visitor',
        text: 'Are you sure you want to delete this visitor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const deleteResult = await FormModel.deleteVisitor(visitorData.id);
          if (deleteResult && deleteResult.http_code === 200) {
            message.success('Visitor deleted successfully');
            history.push("/visitors");
          }
        }
      });
    } catch (error) {
      console.error("Error deleting visitor:", error);
      message.error('Failed to delete visitor');
    }
  };

  const profileOptions = FormModel.getVisitorProfileOptions();

  useEffect(() => {
    // Fetch staff data on component mount
    fetchStaffData();
  }, []);

  useEffect(() => {
    if (visitorData) {
      const formValues = {
        visitor_name: visitorData.visitor_name,
        phone_number: visitorData.phone_number,
        visitor_profile: visitorData.visitor_profile,
        visitor_profile_other: visitorData.visitor_profile_other,
        staff_id: visitorData.staff_id || (visitorData.staff ? visitorData.staff.id : null),
      };
      
      form.setFieldsValue(formValues);
      setCurrentProfile(visitorData.visitor_profile);
      setHasChanges(false);
    } else {
      form.resetFields();
      setCurrentProfile("Visitor");
      setSelectedStaff(null);
      setHasChanges(false);
    }
    
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [visitorData, form, disabled, formKey]);

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
              <Link to="/visitors" style={{ 
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
                      {!visitorData ? "FORM CHECK-IN KULA VISITOR (INTERNAL)" : "Update Visitor"}
                    </Title>
                    {visitorData && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666666' }}>
                        <span style={{ marginRight: '16px' }}>
                          <strong style={{ color: '#000000' }}>Created:</strong> {moment(visitorData.created_at).format('DD MMM YYYY HH:mm')}
                        </span>
                        {visitorData.checked_out_at && (
                          <span style={{ color: '#d93025' }}>
                            <strong>Checked out:</strong> {moment(visitorData.checked_out_at).format('DD MMM YYYY HH:mm')}
                          </span>
                        )}
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
                      {/* 1. Nama Visitor */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Nama Visitor <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="visitor_name"
                        rules={[
                          { required: true, message: 'Required!' },
                          { max: 255, message: 'Max 255 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="visitor-form-item"
                      >
                        <Input 
                          placeholder="Enter name"
                          style={{ 
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #d9d9d9',
                            color: '#000000',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            height: '34px'
                          }}
                          className="responsive-input"
                        />
                      </Form.Item>

                      {/* 2. No HP (cara penulisan: 08XXXXXXXX) */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            No HP (cara penulisan: 08XXXXXXXX) <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="phone_number"
                        rules={[
                          { required: true, message: 'Required!' },
                          { pattern: /^[0-9+()-]+$/, message: 'Invalid format!' },
                          { max: 20, message: 'Max 20 chars!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="visitor-form-item"
                      >
                        <Input 
                          placeholder="08XXXXXXXX"
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

                      {/* 3. Profile Visitor */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Profile Visitor <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="visitor_profile"
                        rules={[{ required: true, message: 'Required!' }]}
                        style={{ marginBottom: currentProfile === "Other" ? '6px' : '10px' }}
                      >
                        <Radio.Group 
                          onChange={(e) => setCurrentProfile(e.target.value)}
                          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                        >
                          {profileOptions.map(option => (
                            <Radio 
                              key={option.value} 
                              value={option.value}
                              style={{ 
                                color: '#000000',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '4px'
                              }}
                            >
                              {option.label}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </Form.Item>

                      {/* Other Profile Field */}
                      {currentProfile === "Other" && (
                        <Form.Item
                          name="visitor_profile_other"
                          rules={[
                            { required: true, message: 'Please specify!' },
                            { max: 255, message: 'Max 255 chars!' }
                          ]}
                          style={{ 
                            marginBottom: '10px',
                          }}
                        >
                          <Input 
                            placeholder="Specify other profile"
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
                      )}

                      {/* 4. Diisi Oleh (Staff) - NEW DROPDOWN */}
                      <Form.Item
                        label={
                          <span style={{ 
                            color: '#000000',
                            fontWeight: 600, 
                            fontSize: '14px' 
                          }}>
                            Diisi Oleh (Staff) <span style={{ color: '#ff4d4f' }}>*</span>
                          </span>
                        }
                        name="staff_id"
                        rules={[
                          { required: true, message: 'Please select a staff member!' }
                        ]}
                        style={{ marginBottom: '10px' }}
                        className="visitor-form-item"
                      >
                        <Select
                          placeholder="Select staff"
                          loading={staffLoading}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                          style={{ 
                            width: '100%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                          }}
                          dropdownStyle={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                          }}
                        >
                          <Option value="" disabled>
                            {staffLoading ? "Loading staff..." : "Select a staff member"}
                          </Option>
                          {staffOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Selected Staff Info */}
                      {selectedStaff && (
                        <div style={{
                          marginBottom: '16px',
                          padding: '12px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #e8e8e8',
                          borderRadius: '4px',
                          fontSize: '13px',
                          color: '#333'
                        }}>
                          <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                            Selected Staff: {selectedStaff.name}
                          </div>
                          <div>
                            Phone: {selectedStaff.phone_number}
                          </div>
                          {selectedStaff.active === false && (
                            <div style={{ color: '#d93025', marginTop: '4px' }}>
                              ⚠️ This staff is inactive
                            </div>
                          )}
                        </div>
                      )}
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
                                {!visitorData ? "Submit" : "Save"}
                              </Button>
                              
                              {visitorData && !visitorData.checked_out_at && !isStandalone && (
                                <Button 
                                  onClick={handleCheckout}
                                  style={{ 
                                    backgroundColor: '#FFFFFF',
                                    borderColor: '#000000',
                                    color: '#000000',
                                    height: '36px',
                                    padding: '0 20px',
                                    borderRadius: '4px',
                                    fontWeight: 500,
                                    fontSize: '14px'
                                  }}
                                >
                                  Checkout
                                </Button>
                              )}
                              
                              {visitorData && !isStandalone && (
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
                                  onClick={() => history.push("/visitors")}
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