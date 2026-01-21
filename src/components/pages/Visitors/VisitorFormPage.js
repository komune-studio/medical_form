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
  Col
} from 'antd';
import { Container } from 'reactstrap';
import swal from '../../reusable/CustomSweetAlert';
import FormModel from 'models/VisitorModel';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

export default function VisitorFormPage({
  visitorData,
  disabled,
}) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form] = Form.useForm();
  const [formDisabled, setFormDisabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentProfile, setCurrentProfile] = useState("Visitor");

  const onValuesChanged = (changedValues, allValues) => {
    if (changedValues.visitor_profile) {
      setCurrentProfile(changedValues.visitor_profile);
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
      
      const validation = FormModel.validateVisitorData(body);
      if (!validation.isValid) {
        const errorMsg = Object.values(validation.errors).join(', ');
        message.error(`Validation errors: ${errorMsg}`);
        setLoadingSubmit(false);
        return;
      }

      let result;
      let msg;

      if (!visitorData) {
        msg = 'Successfully added new Visitor';
        result = await FormModel.createVisitor(body);
      } else {
        msg = 'Successfully updated Visitor';
        result = await FormModel.updateVisitor(visitorData.id, body);
      }

      if (result && result.http_code === 200) {
        message.success(msg);
        history.push("/visitors");
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
    if (visitorData) {
      form.setFieldsValue({
        visitor_name: visitorData.visitor_name,
        phone_number: visitorData.phone_number,
        visitor_profile: visitorData.visitor_profile,
        visitor_profile_other: visitorData.visitor_profile_other,
        filled_by: visitorData.filled_by,
      });
      setCurrentProfile(visitorData.visitor_profile);
    }
    
    if (disabled) {
      setFormDisabled(disabled);
    }
  }, [visitorData, form, disabled]);

  // Styles - Black & White Theme
  const containerStyle = {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '40px 20px'
  };

  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const headerCardStyle = {
    ...cardStyle,
    border: '1px solid #e0e0e0'
  };

  const cardBodyStyle = {
    padding: '32px'
  };

  const labelStyle = {
    fontSize: '16px',
    color: '#000000',
    fontWeight: 600,
    display: 'block',
    marginBottom: '8px'
  };

  const inputStyle = {
    border: 'none',
    borderBottom: '1px solid #e0e0e0',
    borderRadius: 0,
    padding: '10px 0',
    fontSize: '16px',
    boxShadow: 'none',
    background: 'transparent',
    transition: 'border-bottom-color 0.2s',
    color: '#000000'
  };

  const requiredStyle = {
    color: '#d93025',
    marginLeft: '4px'
  };

  return (
    <>
      <div style={containerStyle}>
        <Container fluid style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
            {/* Back Button */}
            <Col span={24}>
              <Link to="/visitors" style={{ color: '#000000', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>←</span> Back to Visitors List
              </Link>
            </Col>

            {/* Header Card */}
            <Col span={24}>
              <div style={headerCardStyle}>
                <div style={cardBodyStyle}>
                  <Title level={2} style={{ margin: 0, fontSize: '32px', color: '#000000', fontWeight: 600 }}>
                    {!visitorData ? "Visitor Registration Form" : "Update Visitor Information"}
                  </Title>
                  <Paragraph style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666666' }}>
                    Please fill out this form to register your visit
                  </Paragraph>
                  
                  {visitorData && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} sm={12} md={8}>
                          <Text style={{ fontSize: '13px', color: '#666666' }}>
                            <strong style={{ color: '#000000' }}>Created:</strong> {moment(visitorData.created_at).format('DD MMM YYYY HH:mm')}
                          </Text>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Text style={{ fontSize: '13px', color: '#666666' }}>
                            <strong style={{ color: '#000000' }}>Modified:</strong> {moment(visitorData.modified_at).format('DD MMM YYYY HH:mm')}
                          </Text>
                        </Col>
                        {visitorData.checked_out_at && (
                          <Col xs={24} sm={12} md={8}>
                            <Text style={{ fontSize: '13px', color: '#d93025' }}>
                              <strong>Checked out:</strong> {moment(visitorData.checked_out_at).format('DD MMM YYYY HH:mm')}
                            </Text>
                          </Col>
                        )}
                      </Row>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {loading ? (
              <Col span={24}>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '80px' }}>
                  <Spin size="large" />
                </div>
              </Col>
            ) : (
              <Col span={24}>
                <Form
                  layout='vertical'
                  form={form}
                  onFinish={onSubmit}
                  onValuesChange={onValuesChanged}
                  validateTrigger="onSubmit"
                  disabled={formDisabled}
                  autoComplete='off'
                >
                  <Row gutter={[24, 24]}>
                    <Col span={24}>
                      {/* Visitor Name */}
                      <div style={cardStyle}>
                        <div style={cardBodyStyle}>
                          <Form.Item
                            label={
                              <span style={labelStyle}>
                                Visitor Name <span style={requiredStyle}>*</span>
                              </span>
                            }
                            name="visitor_name"
                            rules={[
                              { required: true, message: 'Please input visitor name!' },
                              { max: 255, message: 'Maximum 255 characters!' }
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="Your answer"
                              style={inputStyle}
                              className="bw-form-input"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div style={cardStyle}>
                        <div style={cardBodyStyle}>
                          <Form.Item
                            label={
                              <span style={labelStyle}>
                                Phone Number <span style={requiredStyle}>*</span>
                              </span>
                            }
                            name="phone_number"
                            rules={[
                              { required: true, message: 'Please input phone number!' },
                              { 
                                pattern: /^[0-9+()-]+$/, 
                                message: 'Invalid phone number format!' 
                              },
                              { max: 20, message: 'Maximum 20 characters!' }
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="Your answer"
                              style={inputStyle}
                              className="bw-form-input"
                            />
                          </Form.Item>
                        </div>
                      </div>

                      {/* Visitor Profile */}
                      <div style={cardStyle}>
                        <div style={cardBodyStyle}>
                          <Form.Item
                            label={
                              <span style={labelStyle}>
                                Visitor Profile <span style={requiredStyle}>*</span>
                              </span>
                            }
                            name="visitor_profile"
                            rules={[{ required: true, message: 'Please select visitor profile!' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Radio.Group 
                              style={{ width: '100%' }}
                              onChange={(e) => setCurrentProfile(e.target.value)}
                            >
                              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                {profileOptions.map(option => (
                                  <Radio 
                                    key={option.value} 
                                    value={option.value}
                                    style={{ 
                                      fontSize: '15px',
                                      color: '#000000',
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '6px 0'
                                    }}
                                  >
                                    {option.label}
                                  </Radio>
                                ))}
                              </Space>
                            </Radio.Group>
                          </Form.Item>
                        </div>
                      </div>

                      {/* Other Profile Specification */}
                      {currentProfile === "Other" && (
                        <div style={cardStyle}>
                          <div style={cardBodyStyle}>
                            <Form.Item
                              label={
                                <span style={labelStyle}>
                                  Please specify <span style={requiredStyle}>*</span>
                                </span>
                              }
                              name="visitor_profile_other"
                              rules={[
                                { required: currentProfile === "Other", message: 'Please specify the profile!' },
                                { max: 255, message: 'Maximum 255 characters!' }
                              ]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input 
                                placeholder="Your answer"
                                style={inputStyle}
                                className="bw-form-input"
                              />
                            </Form.Item>
                          </div>
                        </div>
                      )}

                      {/* Filled By */}
                      <div style={cardStyle}>
                        <div style={cardBodyStyle}>
                          <Form.Item
                            label={
                              <span style={labelStyle}>
                                Staff Name <span style={requiredStyle}>*</span>
                              </span>
                            }
                            name="filled_by"
                            rules={[
                              { required: true, message: 'Please input staff name!' },
                              { max: 255, message: 'Maximum 255 characters!' }
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="Your answer"
                              style={inputStyle}
                              className="bw-form-input"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </Col>

                    {/* Action Buttons */}
                    <Col span={24}>
                      <div style={cardStyle}>
                        <div style={cardBodyStyle}>
                          {!formDisabled ? (
                            <>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                <Button 
                                  type='primary' 
                                  htmlType='submit' 
                                  loading={loadingSubmit}
                                  size="large"
                                  className="bw-primary-button"
                                  style={{ 
                                    background: '#004EEB',
                                    borderColor: '#004EEB',
                                    fontWeight: 500,
                                    height: '44px',
                                    paddingLeft: '32px',
                                    paddingRight: '32px',
                                    fontSize: '16px',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {!visitorData ? "Submit Form" : "Save Changes"}
                                </Button>
                                
                                {visitorData && !visitorData.checked_out_at && (
                                  <Button 
                                    onClick={handleCheckout}
                                    size="large"
                                    style={{ 
                                      height: '44px',
                                      paddingLeft: '32px',
                                      paddingRight: '32px',
                                      fontSize: '16px',
                                      background: '#FFFFFF',
                                      borderColor: '#000000',
                                      color: '#000000'
                                    }}
                                  >
                                    Checkout Visitor
                                  </Button>
                                )}
                                
                                {visitorData && (
                                  <Button 
                                    onClick={handleDelete}
                                    size="large"
                                    style={{ 
                                      height: '44px',
                                      paddingLeft: '32px',
                                      paddingRight: '32px',
                                      fontSize: '16px',
                                      background: '#FFFFFF',
                                      borderColor: '#000000',
                                      color: '#000000'
                                    }}
                                  >
                                    Delete Visitor
                                  </Button>
                                )}

                                <Button 
                                  type='default'
                                  onClick={() => history.push("/visitors")}
                                  size="large"
                                  style={{ 
                                    height: '44px',
                                    paddingLeft: '32px',
                                    paddingRight: '32px',
                                    fontSize: '16px',
                                    background: '#FFFFFF',
                                    borderColor: '#e0e0e0',
                                    color: '#666666'
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>

                              <div style={{ paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                                <Text style={{ fontSize: '13px', color: '#666666' }}>
                                  <span style={{ color: '#d93025' }}>*</span> Required fields
                                </Text>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Col>
            )}
          </Row>
        </Container>
      </div>

      <style>{`
        .bw-form-input:focus {
          border-bottom: 2px solid #000000 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .bw-form-input:hover {
          border-bottom-color: #666666;
        }
        .ant-input:focus,
        .ant-input-focused {
          box-shadow: none !important;
        }
        .bw-primary-button:hover {
          background: #0040c4 !important;
          border-color: #0040c4 !important;
        }
        .ant-radio-checked .ant-radio-inner {
          border-color: #000000 !important;
          background-color: #000000 !important;
        }
        .ant-radio:hover .ant-radio-inner {
          border-color: #000000 !important;
        }
        .ant-radio-wrapper:hover {
          color: #000000 !important;
        }
        .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
          display: none !important;
        }
      `}</style>
      
      <Prompt
        when={hasChanges && !loadingSubmit}
        message={"Are you sure you want to leave before saving?"}
      />
    </>
  );
}