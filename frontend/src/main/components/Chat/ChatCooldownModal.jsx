import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DEFAULT_MINUTES = "5";

const ChatCooldownModal = ({ show, username, onClose, onSubmit }) => {
  const testId = "ChatCooldownModal";
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [error, setError] = useState("");

  const handleClose = () => {
    setMinutes(DEFAULT_MINUTES);
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const value = Number(minutes);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Please enter a whole number of minutes greater than 0.");
      return;
    }
    onSubmit(value * 60);
    handleClose();
  };

  return (
    <Modal data-testid={testId} show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title data-testid={`${testId}-title`}>
          {username ? `Chat cooldown for ${username}` : "Chat cooldown"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label htmlFor="chatCooldownMinutes">
          Cooldown duration (minutes)
        </Form.Label>
        <Form.Control
          id="chatCooldownMinutes"
          data-testid={`${testId}-minutes`}
          type="number"
          min="1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          isInvalid={error !== ""}
        />
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Modal.Body>
      <Modal.Footer>
        <Button
          data-testid={`${testId}-cancel`}
          variant="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          data-testid={`${testId}-submit`}
          variant="warning"
          onClick={handleSubmit}
        >
          Set cooldown
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatCooldownModal;
