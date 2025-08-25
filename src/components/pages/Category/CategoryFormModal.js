import Modal from 'react-bootstrap/Modal';
import { Button, message, Flex, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from "prop-types";
import swal from "../../reusable/CustomSweetAlert";
import Category from 'models/CategoryModel';

CategoryFormModal.propTypes = {
    close: PropTypes.func,
    isOpen: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    categoryData: PropTypes.object,
};


export default function CategoryFormModal({ isOpen, close, isNewRecord, categoryData }) {
    const [form] = Form.useForm();


    const onSubmit = async () => {

        try {
            let result;
            let body = form.getFieldsValue();
            let msg = ''
            console.log(body);
            if (isNewRecord) {
                await Category.create(body)
                msg = "Successfully added new category"
            } else {
                await Category.edit(categoryData?.id, body)
                msg = "Successfully updated category"
            }

            message.success(msg)
            handleClose(true)
        } catch (e) {
            console.log(e)
            let errorMessage = "An Error Occured"
            await swal.fire({
                title: 'Error',
                text: e.error_message ? e.error_message : "An Error Occured",
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
                id: categoryData?.id,
                name: categoryData?.name,
                description: categoryData?.description,
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
        <Modal.Header style={{ paddingBottom: "0" }}>
            <div className={'d-flex w-100 justify-content-between'}>
                <Modal.Title>{isNewRecord ? 'Add Category' : `Update Category`}</Modal.Title>
                <Button onClick={() => {
                    close()
                }} style={{ position: 'relative', top: -5, color: '#fff', fontWeight: 800 }} type="link" shape="circle"
                    icon={<CloseOutlined />} />
            </div>
        </Modal.Header>
        <Modal.Body style={{ paddingTop: "0" }}>
            <Form
                layout='vertical'
                form={form}
                onFinish={onSubmit}
                validateTrigger="onSubmit"
                autoComplete='off'
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
                    label={"Description"}
                    name={"description"}
                >
                    <Input.TextArea variant='filled' />
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