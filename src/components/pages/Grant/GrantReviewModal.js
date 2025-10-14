import React, { useState } from 'react';
import { Modal, Button, Flex, Image, Tag, Segmented, Typography, Space, message, Input, Form } from 'antd';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import Grant from 'models/GrantModel';
import moment from 'moment';
import { useForm } from 'antd/es/form/Form';
import swal from 'components/reusable/CustomSweetAlert';

const GrantReviewModal = ({ open, grant, onApprove, onReject, onClose }) => {
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [loadings, setLoadings] = useState({
    approve: false,
    reject: false,
  });
  const [form] = useForm();
  const rejectReason = Form.useWatch("reject_reason", form)

  if (!grant) return null;

  const bioBoxStyle = {
    marginTop: '5px',
    padding: '10px',
    background: '#000',
    borderRadius: '6px',
    border: '1px solid #fff',
    color: '#fff',
    maxHeight: '150px',
    overflowY: 'auto'
  };

  const infoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  };

  const toggleLoading = (action) => {
    setLoadings((prevLoadings) => {
      const newLoadings = { ...prevLoadings }
      newLoadings[action] = !prevLoadings[action];
      return newLoadings;
    })
  }

  const handleApprove = async (id) => {
    toggleLoading("approve")
    await onApprove(id)
    form.setFieldValue("reject_reason", "")
    toggleLoading("approve")
    // await swal.fire({
    //   title: 'Success',
    //   text: "Grant approved successfully.",
    //   icon: "success",
    //   confirmButtonText: 'Okay'
    // })
  }

  const handleReject = async (id) => {
    toggleLoading("reject")
    handleCloseRejectModal();
    await onReject(id, rejectReason);
    form.setFieldValue("reject_reason", "")
    toggleLoading("reject")
    // await swal.fire({
    //   title: 'Success',
    //   text: "Grant rejected successfully.",
    //   icon: "success",
    //   confirmButtonText: 'Okay'
    // })
  }

  const handleCloseReviewModal = () => {
    form.setFieldValue("reject_reason", "")
    onClose()
  }

  const handleOpenRejectModal = () => {
    setOpenRejectModal(true)
  }

  const handleCloseRejectModal = () => {
    setOpenRejectModal(false)
  }

  const handleOpenDocument = (document_url) => {
    window.open(document_url, "_blank")
  }

  return (
    <>
      <Modal
        title="Review Grant Request"
        open={open}
        onCancel={handleCloseReviewModal}
        footer={[
        ]}
        width={600}
      >
        <Flex vertical gap="20px" align="start">
          <div style={{ flex: 1, color: '#fff', marginTop: "12px" }} className='container-fluid p-0'>
            <h3>Grant Details</h3>
            <div style={infoStyle}>
              <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Book Title:</strong> {grant.book_title || "-"}</p>
              <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Target Language:</strong> {grant.target_language || "-"}</p>
              <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Applicants Name:</strong> {`${grant.members.first_name} ${grant.members.last_name}` || "-"}</p>
              <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Status:</strong> <strong>{grant.status || "-"}</strong></p>
              {grant?.status == "APPROVED" ? (
                <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}>
                  <strong>Approved At:</strong>
                  <strong>{moment(grant.approved_at).format("DD MMMM YYYY") || "-"}</strong>
                </p>
              ) : grant?.status == "REJECTED" ? (
                <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}>
                  <strong>Rejected At:</strong>
                  <strong>{moment(grant.rejected_at).format("DD MMMM YYYY") || "-"}</strong>
                </p>
              ) : (
                <></>
              )}
              {grant?.status == "REJECTED" ? (
                <>
                  <div className='' style={{ marginBottom: "8px" }}>
                    <p className='' style={{ marginBottom: "4px" }}>
                      <strong>Reject Reason</strong>
                    </p>
                    <Input.TextArea disabled value={grant?.reject_reason} onChange={() => null} className='text-white' />
                  </div>
                </>
              ) : (
                <></>
              )}
              <span>
                <a href={"#"} target="_blank" rel="noopener noreferrer" onClick={() => handleOpenDocument(grant?.document_url)}>
                  <Button type='default'>
                    <p style={{ margin: 0 }}><strong>Download Document</strong></p>
                  </Button>
                </a>
              </span>
            </div>
          </div>

          {grant?.status == "WAITING" ? (
            <Flex justify='end' className='container-fluid p-0' style={{ marginTop: "16px" }}>
              <Space size="small">
                <Button type='text' className='bg-danger' onClick={() => handleOpenRejectModal(grant?.id)} loading={loadings["reject"]}>
                  Reject
                </Button>
                <Button type='text' className='bg-success' onClick={() => handleApprove(grant?.id)} loading={loadings["approve"]}>
                  Approve
                </Button>
              </Space>
            </Flex>
          ) : (
            <></>
          )}
        </Flex>
      </Modal >

      <Modal
        title="Reject Confirmation"
        open={openRejectModal}
        onCancel={handleCloseRejectModal}
        footer={[
        ]}
        width={500}
      >
        <Flex vertical gap="20px" align="start">
          <div style={{ flex: 1, color: '#fff', marginTop: "12px" }} className='container-fluid p-0'>
            <Form
              form={form}
              layout='vertical'
            >
              <Form.Item
                label="Reject Reason"
                name="reject_reason"
              >
                <Input.TextArea
                  defaultValue={""}
                  variant='filled'
                  rows={4}
                  maxLength={200}
                  showCount={true}
                />
              </Form.Item>
            </Form>
          </div>

          <Flex justify='end' className='container-fluid p-0' style={{ marginTop: "16px" }}>
            <Space size="small">
              <Button type='text' className='bg-white text-dark' onClick={handleCloseRejectModal}>
                Cancel
              </Button>
              <Button type='text' className='bg-danger' onClick={() => handleReject(grant?.id)}>
                Confirm
              </Button>
            </Space>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
};

export default GrantReviewModal;
