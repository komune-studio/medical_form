import React, { useState } from 'react';
import { Modal, Button, Flex, Image, Tag, Segmented, Typography } from 'antd';
import { Link } from 'react-router-dom';
import HTMLReactParser from "html-react-parser";
import Iconify from "../../reusable/Iconify";

const AuthorDetailModal = ({ open, author, onClose }) => {
  const [language, setLanguage] = useState("ID");

  if (!author) return null;

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
    gap: '4px', 
    marginTop: '8px',
  };

  return (
    <Modal
      title="Author Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Link key="edit" to={`/authors/${author?.id}/edit`}>
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
          {author.profile_picture ? (
            <Image 
              width="100%" 
              height="100%" 
              style={{ objectFit: 'cover' }} 
              src={author.profile_picture} 
              alt={author.name}
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
          <h3 style={{ margin: 0 }}>{author.name}</h3>
          
          <div style={infoStyle}>
            <p style={{ margin: 0 }}><strong>Email:</strong> {author.email || "-"}</p>
            <p style={{ margin: 0 }}><strong>Phone:</strong> {author.phone || "-"}</p>
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
            author.biography ? (
              <div>
                <strong>Biography:</strong>
                <p style={bioBoxStyle}>
                  {author.biography}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in Indonesian</Typography.Text>
            )
          ) : (
            author.biography_tl ? (
              <div>
                <strong>Biography (English):</strong>
                <p style={bioBoxStyle}>
                  {author.biography_tl}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No biography available in English</Typography.Text>
            )
          )}

          {author.awards ? (
              <div>
                <strong>Awards:</strong>
                <p>
                  {HTMLReactParser(String(author.awards))}
                </p>
              </div>
            ) : (
              <Typography.Text type="secondary">No awards</Typography.Text>
            )}
          
          <div style={{ marginTop: '15px' }}>
            <h4>Social Media:</h4>
            <Flex gap="10px" wrap="wrap">
              {author.facebook && (
                <Tag color="blue">
                  <a href={author.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </Tag>
              )}
              {author.instagram && (
                <Tag color="purple">
                  <a href={`https://instagram.com/${author.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram: @{author.instagram}
                  </a>
                </Tag>
              )}
              {author.tiktok && (
                <Tag color="black">
                  <a href={`https://tiktok.com/@${author.tiktok}`} target="_blank" rel="noopener noreferrer">
                    TikTok: @{author.tiktok}
                  </a>
                </Tag>
              )}
              {author.twitter && (
                <Tag color="cyan">
                  <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer">
                    Twitter: @{author.twitter}
                  </a>
                </Tag>
              )}
              {author.youtube && (
                <Tag color="red">
                  <a href={author.youtube} target="_blank" rel="noopener noreferrer">
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

export default AuthorDetailModal;
