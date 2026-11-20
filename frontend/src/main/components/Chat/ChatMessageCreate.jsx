import React from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useBackendMutation } from "main/utils/useBackend";
import { cooldownErrorMessage } from "main/utils/chatCooldownUtils";

const ChatMessageCreate = ({ gameId, submitAction }) => {
  const testid = "ChatMessageCreate";
  const initialMessagePageSize = 10;

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const objectToAxiosParams = (newMessage) => ({
    // Stryker disable next-line all : axiosMock post test works when mutated
    url: `/api/chat/post?gameId=${newMessage.gameId}&content=${newMessage.content}`,
    method: "POST",
    data: newMessage,
  });

  const onError = (error) => {
    const data = error.response?.data;
    if (
      error.response?.status === 429 &&
      typeof data?.remainingSeconds === "number"
    ) {
      toast.error(cooldownErrorMessage(data.remainingSeconds));
    } else {
      toast.error(data?.message || "Unable to send message.");
    }
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess: () => reset(), onError },
    // Stryker disable all : hard to set up test for caching
    [`/api/chat/get?page=0&size=${initialMessagePageSize}&gameId=${gameId}`],
    // Stryker restore all
  );

  submitAction =
    submitAction ||
    (async (data) => {
      const escapedContent = encodeURIComponent(data.message);
      const escapedGameId = encodeURIComponent(Number(gameId));
      const params = { content: escapedContent, gameId: escapedGameId };
      mutation.mutate(params);
    });

  return (
    <Form
      data-testid={testid}
      onSubmit={handleSubmit(submitAction)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Form.Control
        data-testid={`${testid}-Message`}
        id="message"
        type="text"
        {...register("message", { required: "Message cannot be empty" })}
      />
      <Form.Control.Feedback type="invalid">
        {errors.message?.message}
      </Form.Control.Feedback>
      <Button type="submit" data-testid={`${testid}-Send`}>
        Send
      </Button>
    </Form>
  );
};

export default ChatMessageCreate;
