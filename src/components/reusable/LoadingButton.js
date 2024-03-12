import Iconify from "./Iconify";
import {Button, Spinner} from "react-bootstrap";
import {useState} from "react";

export default function LoadingButton(props) {

    const [isLoading, setIsLoading] = useState(false)

    return <Button
        {...props}
        disabled={isLoading}
        onClick={async () => {
            setIsLoading(true)
            try {
                await props.onClick()
            } catch (e) {

            }
            setIsLoading(false)
        }}
        className={"d-flex flex-row align-items-center"}
        size={"sm"}>
        {props.children}
        {
            isLoading ? <Spinner style={{marginLeft : 5}} size={"sm"}/> : null
        }
    </Button>
}
