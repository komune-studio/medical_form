import Modal from 'react-bootstrap/Modal';
import { Button, message, Flex, Form, Input } from "antd";
// import { Form } from 'react-bootstrap';
import { useEffect, useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import Publisher from 'models/PublisherModel';

PublisherFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    publisherData: PropTypes.object,
};


export default function PublisherFormModal({ isOpen, close, isNewRecord, publisherData }) {
    const [form] = Form.useForm()


    const onSubmit = async () => {

        try {
            let result;
            let body = form.getFieldsValue()
            let msg = ''
            if (isNewRecord) {
                await Publisher.create(body)
                msg = "Successfully added new Publisher"
            } else {
                await Publisher.edit(publisherData?.id, body)
                msg = "Successfully updated Publisher"
            }

            message.success(msg)
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : errorMessage,
                icon: 'error',
                confirmButtonText: 'Okay'
            })
        }

    }

    const handleClose = (refresh) => {
        close(refresh)
    }

    const initForm = () => {
        if (!isNewRecord) {
            form.setFieldsValue({
                id: publisherData?.id,
                name: publisherData?.name,
                address: publisherData?.address,
                phone: publisherData?.phone,
                email: publisherData?.email,
            })
        }

    }
    useEffect(() => {
        if (isNewRecord) {
            reset()
        } else {
            initForm()
        }


    }, [isOpen])

    const reset = () => {
        form.resetFields();
    }

    return <Modal
        show={isOpen}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{isNewRecord ? 'Create Publisher' : `Update Publisher`}</Modal.Title>
                <Button onClick={() => {
                    close()
                }} style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                    icon={<CloseOutlined />} />
            </div>
        </Modal.Header>
        <Modal.Body>
            <Form
                layout='vertical'
                form={form}
                onFinish={onSubmit}
                validateTrigger="onSubmit"
                autoComplete="off"
            >
                <Form.Item
                    label={"Name"}
                    name={"name"}
                    rules={[{
                        required: true,
                    }]}
                >
                    <Input variant='filled' />
                </Form.Item>
                <Form.Item
                    label={"Address"}
                    name={"address"}
                >
                    <Input variant='filled' />
                </Form.Item>
                <Form.Item
                    label={"Phone Number"}
                    name={"phone"}
                    rules={[
                        {
                            pattern: /^[0-9-]+$/g,
                            message: "Phone Number can only include numbers"
                        }
                    ]}
                >
                    <Input variant='filled' />
                </Form.Item>
                <Form.Item
                    label={"Email"}
                    name={"email"}
                    rules={[
                        {
                            type: "email",
                            message: "Please enter a valid email"
                        }
                    ]}
                >
                    <Input variant='filled' />
                </Form.Item>

                <div className={"d-flex flex-row justify-content-end"}>
                    <Form.Item>
                        <Button className={'text-white'} type={'link'} size="sm" variant="outline-danger"
                            onClick={() => handleClose()} style={{ marginRight: '5px' }}>
                            Cancel
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button size="sm" type='primary' variant="primary" htmlType='submit'>
                            {isNewRecord ? 'Add' : 'Save'}
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </Modal.Body>
    </Modal>
}