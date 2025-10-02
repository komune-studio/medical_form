import React, { useState } from 'react';
import { Modal, Button, Flex, Image, Tag, Segmented, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";

const GrantReviewModal = ({ open, grant, onClose }) => {
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

  return (
    <Modal
      title="Review Grant Request"
      open={open}
      onCancel={onClose}
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
            <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Applicant Name:</strong> {`${grant.members.first_name} ${grant.members.last_name}` || "-"}</p>
            <p style={{ margin: 0, display: "flex", justifyContent: "space-between" }}><strong>Status:</strong> <strong>{grant.status || "-"}</strong></p>
            <a href={grant.document_url} className='' target="_blank" rel="noopener noreferrer">
              <Button type='default'>
                <p style={{ margin: 0 }}><strong>Document Link</strong></p>
              </Button>
            </a>
          </div>
        </div>

        {grant?.status == "WAITING" ? (
          <Flex justify='end' className='container-fluid p-0' style={{ marginTop: "16px" }}>
            <Space size="small">
              <Button type='text' className='bg-danger'>
                Reject
              </Button>
              <Button type='text' className='bg-success'>
                Approve
              </Button>
            </Space>
          </Flex>
        ) : (
          <></>
        )}
      </Flex>
    </Modal >
  );
};

export default GrantReviewModal;
