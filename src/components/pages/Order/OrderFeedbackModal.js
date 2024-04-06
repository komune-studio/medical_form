import Modal from "react-bootstrap/Modal";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import Palette from "utils/Palette";
import { useHistory } from "react-router-dom";

OrderFeedbackModal.propTypes = {
    isOpen: PropTypes.bool,
    handleClose: PropTypes.func,
    feedback: PropTypes.object,
};

export function OrderFeedbackModal({ isOpen, handleClose, feedback, navigateBackToOrders=false }) {
    const history = useHistory();

    return (
        <Modal size={"lg"} show={isOpen} backdrop={"static"} keyboard={false}>
            <Modal.Header>
                <div className="d-flex w-100 justify-content-between">
                    <Modal.Title>System Response</Modal.Title>
                </div>
                <Button
                    onClick={() => {
                        handleClose()
                        if (feedback.code === 200) history.push("/orders")
                    }}
                    style={{
                        position: "relative",
                        top: -5,
                        color: "#fff",
                        fontWeight: 800,
                    }}
                    type="link"
                    shape="circle"
                    icon={<CloseOutlined />}
                />
            </Modal.Header>
            <Modal.Body>
                <div
                    style={{
                        color:
                            feedback.code === 200
                                ? Palette.THEME_GREEN
                                : Palette.THEME_RED,
                    }}
                >
                    {feedback.message} ({feedback.code})
                </div>
            </Modal.Body>
        </Modal>
    );
}
