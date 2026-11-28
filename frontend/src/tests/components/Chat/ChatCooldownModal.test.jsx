import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, beforeEach, expect } from "vitest";
import ChatCooldownModal from "main/components/Chat/ChatCooldownModal";

describe("ChatCooldownModal", () => {
  const onClose = vi.fn();
  const onSubmit = vi.fn();
  const testId = "ChatCooldownModal";

  const renderModal = (props = {}) =>
    render(
      <ChatCooldownModal
        show={true}
        username="Alice"
        onClose={onClose}
        onSubmit={onSubmit}
        {...props}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders nothing when show is false", () => {
    renderModal({ show: false });
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
  });

  test("renders title with username, labeled input defaulting to 5, and buttons", () => {
    renderModal();

    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-title`)).toHaveTextContent(
      "Chat cooldown for Alice",
    );

    const input = screen.getByLabelText("Cooldown duration (minutes)");
    expect(input).toBe(screen.getByTestId(`${testId}-minutes`));
    expect(input).toHaveValue(5);
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");
    expect(input).not.toHaveClass("is-invalid");

    const cancel = screen.getByTestId(`${testId}-cancel`);
    expect(cancel).toHaveTextContent("Cancel");
    expect(cancel).toHaveClass("btn-secondary");

    const submit = screen.getByTestId(`${testId}-submit`);
    expect(submit).toHaveTextContent("Set cooldown");
    expect(submit).toHaveClass("btn-warning");
  });

  test("title omits username when none is given", () => {
    renderModal({ username: undefined });
    expect(screen.getByTestId(`${testId}-title`)).toHaveTextContent(
      /^Chat cooldown$/,
    );
  });

  test("submitting converts minutes to seconds and closes", () => {
    renderModal();

    fireEvent.change(screen.getByTestId(`${testId}-minutes`), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(600);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("submitting the minimum of 1 minute is allowed", () => {
    renderModal();

    fireEvent.change(screen.getByTestId(`${testId}-minutes`), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(onSubmit).toHaveBeenCalledWith(60);
  });

  test.each(["0", "-3", "1.5", ""])(
    "rejects invalid duration %j without submitting or closing",
    (value) => {
      renderModal();

      fireEvent.change(screen.getByTestId(`${testId}-minutes`), {
        target: { value },
      });
      fireEvent.click(screen.getByTestId(`${testId}-submit`));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(
        screen.getByText(
          "Please enter a whole number of minutes greater than 0.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`${testId}-minutes`)).toHaveClass("is-invalid");
    },
  );

  test("cancel closes without submitting", () => {
    renderModal();
    fireEvent.click(screen.getByTestId(`${testId}-cancel`));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("header close button closes without submitting", () => {
    renderModal();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("closing resets the input and clears the error", () => {
    const { rerender } = renderModal();

    fireEvent.change(screen.getByTestId(`${testId}-minutes`), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));
    expect(screen.getByTestId(`${testId}-minutes`)).toHaveClass("is-invalid");

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    rerender(
      <ChatCooldownModal
        show={true}
        username="Alice"
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByTestId(`${testId}-minutes`)).toHaveValue(5);
    expect(screen.getByTestId(`${testId}-minutes`)).not.toHaveClass(
      "is-invalid",
    );
    expect(
      screen.queryByText(
        "Please enter a whole number of minutes greater than 0.",
      ),
    ).not.toBeInTheDocument();
  });
});
