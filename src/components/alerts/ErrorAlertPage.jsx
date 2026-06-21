import { Alert } from "@mui/material"
import { useState } from "react";
import "./Alert.css";

const ErrorAlertPage = ({textForError}) => {

    return (
        <div className="alert-center-top">
            <Alert severity="error" >
                Error : {textForError}
            </Alert>
        </div>    
    )
}

export default ErrorAlertPage