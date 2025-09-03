import React, { useState } from 'react';
import { Modal, Button, Flex, Image, Tag, Segmented, Typography } from 'antd';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";

const IllustratorDetailModal = ({ open, illustrator, onClose }) => {
  const [language, setLanguage] = useState("ID");

  if (!illustrator) return null;

  const bioBoxStyle = {
    marginTop: '5px',
    padding: '10px',
    background: '#000', // hitam
    borderRadius: '6px',
    border: '1px solid #fff', // border putih
    color: '#fff', // teks putih biar terbaca
    maxHeight: '150px',
    overflowY: 'auto'
  };

  const infoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px', // jarak antar email & phone lebih rapih
    marginTop: '8px',
  };

  return (
    <Modal
      title="Illustrator Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Link key="edit" to={`/illustrators/${illustrator?.id}/edit`}>
          <Button 
            type="primary" 
            onClick={onClose}
            style={{ marginLeft: 8 }}
          >
            Edit
          </Button>
        </Link>
      ]}
      width={700}
      maskStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
      styles={{
        content: { background: 'transparent', boxShadow: 'none', paddingBottom: 16 },
        header: { background: 'transparent', borderBottom: 'none', color: '#fff' },
        body: { background: 'transparent', paddingBottom: 12 },
        footer: { background: 'transparent', borderTop: 'none', paddingTop: 12 }
      }}
    >
      <Flex gap="20px" align="start">
        <div style={{ 
          width: '150px', 
          height: '200px', 
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          {illustrator.profile_picture ? (
            <Image 
              width="100%" 
              height="100%" 
              style={{ objectFit: 'cover' }} 
              src={illustrator.profile_picture} 
              alt={illustrator.name}
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f0f0f0',
              borderRadius: '8px'
            }}>
              <Iconify icon={"material-symbols:hide-image-outline"} style={{ fontSize: "48px" }} />
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, color: '#fff' }}>
          <h3 style={{ margin: 0 }}>{illustrator.name}</h3>
          
          <div style={infoStyle}>
            <p style={{ margin: 0 }}><strong>Email:</strong> {illustrator.email || "-"}</p>
            <p style={{ margin: 0 }}><strong>Phone:</strong> {illustrator.phone_number || "-"}</p>
          </div>
          
          <Flex justify="flex-end" style={{ margin: '10px 0' }}>
            <Segmented
              value={language}
              onChange={setLanguage}
              options={[
                { label: 'ID', value: 'ID' },
                { label: 'EN', value: 'EN' }
              ]}
              size="small"
            />
          </Flex>
          
          {language === "ID" ? (
            illustrator.biography ? (
              <div>
                <strong>Biography:</strong>
                <p style={bioBoxStyle}>
                  {illustrator.biography}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in Indonesian</Typography.Text>
            )
          ) : (
            illustrator.biography_tl ? (
              <div>
                <strong>Biography (English):</strong>
                <p style={bioBoxStyle}>
                  {illustrator.biography_tl}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in English</Typography.Text>
            )
          )}
          
          <div style={{ marginTop: '15px' }}>
            <h4>Social Media:</h4>
            <Flex gap="10px" wrap="wrap">
              {illustrator.facebook && (
                <Tag color="blue">
                  <a href={illustrator.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </Tag>
              )}
              {illustrator.instagram && (
                <Tag color="purple">
                  <a href={`https://instagram.com/${illustrator.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram: @{illustrator.instagram}
                  </a>
                </Tag>
              )}
              {illustrator.tiktok && (
                <Tag color="black">
                  <a href={`https://tiktok.com/@${illustrator.tiktok}`} target="_blank" rel="noopener noreferrer">
                    TikTok: @{illustrator.tiktok}
                  </a>
                </Tag>
              )}
              {illustrator.twitter && (
                <Tag color="cyan">
                  <a href={`https://twitter.com/${illustrator.twitter}`} target="_blank" rel="noopener noreferrer">
                    Twitter: @{illustrator.twitter}
                  </a>
                </Tag>
              )}
              {illustrator.youtube && (
                <Tag color="red">
                  <a href={illustrator.youtube} target="_blank" rel="noopener noreferrer">
                    YouTube
                  </a>
                </Tag>
              )}
            </Flex>
          </div>
        </div>
      </Flex>
    </Modal>
  );
};

export default IllustratorDetailModal;