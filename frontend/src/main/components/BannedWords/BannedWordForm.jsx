import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function BannedWordForm({ submitAction }) {
  const testIdPrefix = "BannedWordForm";

  // Stryker disable all
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: { word: "" } });
  // Stryker restore all

  const onSubmit = (data) => {
    submitAction(data);
    reset();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      <Form.Label htmlFor="word">Add a banned word</Form.Label>
      <InputGroup hasValidation>
        <Form.Control
          data-testid={`${testIdPrefix}-word`}
          id="word"
          type="text"
          placeholder="e.g. darn"
          isInvalid={Boolean(errors.word)}
          {...register("word", {
            required: "Word is required.",
            validate: (value) =>
              value.trim().length > 0 || "Word must not be blank.",
          })}
        />
        <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
          Add
        </Button>
        <Form.Control.Feedback type="invalid">
          {errors.word?.message}
        </Form.Control.Feedback>
      </InputGroup>
    </Form>
  );
}
