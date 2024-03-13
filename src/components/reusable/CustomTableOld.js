import {Table} from "antd";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import Iconify from "./Iconify";
import {Col, Form, InputGroup} from "react-bootstrap";
import {Button, Row} from "reactstrap";

CustomTableOld.propTypes = {
    loading: PropTypes.bool,
    columns: PropTypes.array,
    dataSource: PropTypes.array
};

export default function CustomTableOld({loading, columns, dataSource, toolBar}) {

    console.log("datasource", dataSource)

    const [keyword, setKeyword] = useState("");
    const [filters, setFilters] = useState([])

    useEffect(()=>{
        let temp = []

        for(let c of columns){
            if(c.filter){
                temp.push(c.dataIndex)
            }
        }
        setFilters(temp)
    },[columns])


    const filteredData = keyword !== "" ? dataSource?.filter((value) => {
        for(let f of filters){
            if(!value[f]){
                continue
            }
            if(!value[f].toLowerCase) {
                continue
            }
            if(value[f]?.toLowerCase().includes(keyword?.toLowerCase())){
                return true
            }
        }
        return false
    }) : dataSource;


    return <div>
        <Row>
            <div className='d-flex flex-row col-md-6 mb-3'>

                <InputGroup>
                    <Form.Control
                        size={"sm"}
                        style={{
                            borderBottomRightRadius : 0,
                            borderTopRightRadius : 0,
                            // borderRadius : 0
                        }}
                        placeholder="Cari"
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value)
                        }}
                    />
                    {/*<Input*/}
                    {/*    */}
                    {/*/>*/}
                </InputGroup>
                <Button
                    size={"sm"}
                    color={"primary"}
                    style={{
                        borderBottomLeftRadius : 0,
                        borderTopLeftRadius : 0,
                    }}>
                    <Iconify style={{fontSize : "1.2em"}} icon="mdi:search" />
                </Button>
                {/*<Search*/}
                {/*    enterButton*/}
                {/*    allowClear*/}
                {/*    placeholder="input search text"*/}
                {/*    onSearch={onSearch}*/}
                {/*    style={{*/}
                {/*        width: '100%',*/}
                {/*    }}*/}
                {/*/>*/}
            </div>
            <div className='col-md-6 mb-3'>
                {toolBar}
            </div>
        </Row>
        <Row>
            <Col md={12}>
                <Table
                    loading={loading} columns={columns}
                    dataSource={filteredData}
                />
            </Col>
        </Row>

    </div>

}