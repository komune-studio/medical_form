import Dropzone, {useDropzone} from "react-dropzone";
import {Button, Row, Spinner} from "react-bootstrap";
import React, {useState} from "react";

export default function FileUpload(props) {

    const isLoading = props.isLoading

    const onDrop = (image) => {

        console.log(image)
        console.log(image[0].type)

        if(props.allowedType){
            if(!props.allowedType.includes(image[0].type)){
                alert("Please upload file with the type  : " + props.allowedType)
                return
            }
        }

        props.onDrop(image)

    }

    return (
        <>

            <Dropzone
                noDrag={true}
                onDrop={onDrop}>
                {({getRootProps, getInputProps}) => (
                    <div
                        style={{
                            display : "flex",
                            flexDirection : "row",
                            alignItems : "center",
                        }}
                        {...getRootProps()}>

                        <Button
                            style={{
                                fontSize : "0.8em",
                                // fontFamily : "Poppins",
                                textTransform : "none",
                                ...props.buttonStyle
                            }}
                            disabled={isLoading}
                            variant={"primary"}>
                            <input {
                                       ...getInputProps()
                                   }
                            />
                            {props.text ? props.text : "+ Upload File"}
                        </Button>


                        {
                            props.hideSpinner ?
                                null
                                :
                                <Spinner
                                    size={"sm"}
                                    style={{
                                        marginLeft : " 0.5em", color: "white", display: isLoading ? "inline" : "none"
                                    }}
                                    animation="border"/>
                        }

                    </div>
                )}
            </Dropzone>

        </>

    )
}
