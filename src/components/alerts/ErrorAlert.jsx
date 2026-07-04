import { useEffect } from "react";
import { Alert } from "@mui/material"
import "./Alert.css";

const ErrorAlert = ({textForError, page, onAlertClose}) => {

    useEffect(() => {
    const timer = setTimeout(() => {
        onAlertClose()
    }, 15000)

    return () => clearTimeout(timer)
}, [onAlertClose])

    return (
        <div className={`alert-corner-right ${page}`}>
            <Alert severity="error" onClose={onAlertClose}>
                Error : {textForError}
            </Alert>
        </div>
    )
}

export default ErrorAlert