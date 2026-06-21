import { Alert } from "@mui/material"
import { useState } from "react";
import "./Alert.css";

const ErrorAlert = ({textForError, page}) => {
    const [showNotif, setShowNotif] = useState(true)

    return (
        <>
        {showNotif &&
        <div className={`alert-corner-right ${page}`}>
            <Alert severity="error" onClose={() => setShowNotif(false)}>
                Error : {textForError}
            </Alert>
        </div>
        }
        </> 
    )
}

export default ErrorAlert