import { Alert } from "@mui/material"
import "./Alert.css";

const ConfirmationAlert = ({questionMessage, onConfirm, onCancel, page}) => {

    return (
        <div className={`alert-confirmation-center ${page}`}>
            <Alert severity="warning" icon={false}  >
                {questionMessage}
                <div className="alert-button-display">
                    <button className="alert-button left"  type="button" onClick={() => onConfirm()}>
                        Aceptar
                    </button>
                    <button className="alert-button right" type="button" onClick={() => onCancel()}>
                        Cancelar
                    </button>
                </div>
                
            </Alert>
        </div>
    )
}

export default ConfirmationAlert