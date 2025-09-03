import React, { useState } from 'react';
import { Modal, Button, Flex, Image, Tag, Segmented, Typography } from 'antd';
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";

const TranslatorDetailModal = ({ open, translator, onClose }) => {
  const [language, setLanguage] = useState("ID");

  if (!translator) return null;

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

  const infoRowStyle = {
    margin: '4px 0'
  };

  return (
    <Modal
      title="Translator Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Link key="edit" to={`/translators/${translator?.id}/edit`}>
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
          {translator.profile_picture ? (
            <Image
              width="100%"
              height="100%"
              style={{ objectFit: 'cover' }}
              src={translator.profile_picture}
              alt={translator.name}
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
          <h3 style={{ margin: 0 }}>{translator.name}</h3>

          {/* Email */}
          <p style={infoRowStyle}>
            <strong>Email:</strong> {translator.email || "-"}
          </p>

          {/* Phone */}
          <p style={infoRowStyle}>
            <strong>Phone:</strong> {translator.phone || "-"}
          </p>

          {/* Languages */}
          <p style={infoRowStyle}>
            <strong>Languages:</strong> {translator.languages || "-"}
          </p>

          <Flex justify="flex-end" style={{ marginBottom: '10px' }}>
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
            translator.biography ? (
              <div>
                <strong>Biography:</strong>
                <p style={bioBoxStyle}>
                  {translator.biography}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in Indonesian</Typography.Text>
            )
          ) : (
            translator.biography_tl ? (
              <div>
                <strong>Biography (English):</strong>
                <p style={bioBoxStyle}>
                  {translator.biography_tl}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in English</Typography.Text>
            )
          )}

          <div style={{ marginTop: '15px' }}>
            <h4>Social Media:</h4>
            <Flex gap="10px" wrap="wrap">
              {translator.facebook && (
                <Tag color="blue">
                  <a href={translator.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </Tag>
              )}
              {translator.instagram && (
                <Tag color="purple">
                  <a href={`https://instagram.com/${translator.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram: @{translator.instagram}
                  </a>
                </Tag>
              )}
              {translator.tiktok && (
                <Tag color="black">
                  <a href={`https://tiktok.com/@${translator.tiktok}`} target="_blank" rel="noopener noreferrer">
                    TikTok: @{translator.tiktok}
                  </a>
                </Tag>
              )}
              {translator.twitter && (
                <Tag color="cyan">
                  <a href={`https://twitter.com/${translator.twitter}`} target="_blank" rel="noopener noreferrer">
                    Twitter: @{translator.twitter}
                  </a>
                </Tag>
              )}
              {translator.youtube && (
                <Tag color="red">
                  <a href={translator.youtube} target="_blank" rel="noopener noreferrer">
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

export default TranslatorDetailModal;
