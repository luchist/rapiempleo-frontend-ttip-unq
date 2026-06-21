import { Alert } from "@mui/material"
import { useState } from "react";
import "./Alert.css";

const ConfirmationAlert = ({questionMessage, onConfirm, onCancel}) => {
    const [showNotif, setShowNotif] = useState(true)

    return (
        <>
        {showNotif &&
        <div className={`alert-confirmation-center`}>
            <Alert severity="warning" icon={false}  >
                {questionMessage}
                <div className="alert-button-display">
                    <button className="alert-button left" onClick={() => onConfirm()}>
                        Aceptar
                    </button>
                    <button className="alert-button right" onClick={() => onCancel()}>
                        Cancelar
                    </button>
                </div>
                
            </Alert>
        </div>
        }
        </> 
    )
}

export default ConfirmationAlert