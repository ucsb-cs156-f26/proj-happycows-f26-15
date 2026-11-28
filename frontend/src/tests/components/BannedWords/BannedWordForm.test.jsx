import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BannedWordForm from "main/components/BannedWords/BannedWordForm";
import { vi } from "vitest";

describe("BannedWordForm tests", () => {
  const testIdPrefix = "BannedWordForm";

  test("renders the label, input, and Add button", () => {
    render(<BannedWordForm submitAction={vi.fn()} />);

    expect(screen.getByText("Add a banned word")).toBeInTheDocument();
    const input = screen.getByTestId(`${testIdPrefix}-word`);
    expect(input).toHaveAttribute("placeholder", "e.g. darn");
    expect(input).toHaveAttribute("id", "word");
    expect(screen.getByTestId(`${testIdPrefix}-submit`)).toHaveTextContent(
      "Add",
    );
  });

  test("submitting a word calls submitAction and clears the input", async () => {
    const submitAction = vi.fn();
    render(<BannedWordForm submitAction={submitAction} />);

    const input = screen.getByTestId(`${testIdPrefix}-word`);
    fireEvent.change(input, { target: { value: "darn" } });
    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(submitAction.mock.calls[0][0]).toEqual({ word: "darn" });
    await waitFor(() => expect(input).toHaveValue(""));
  });

  test("submitting an empty word shows an error and does not submit", async () => {
    const submitAction = vi.fn();
    render(<BannedWordForm submitAction={submitAction} />);

    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(await screen.findByText("Word is required.")).toBeInTheDocument();
    expect(screen.getByTestId(`${testIdPrefix}-word`)).toHaveClass(
      "is-invalid",
    );
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("submitting only spaces shows an error and does not submit", async () => {
    const submitAction = vi.fn();
    render(<BannedWordForm submitAction={submitAction} />);

    fireEvent.change(screen.getByTestId(`${testIdPrefix}-word`), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByTestId(`${testIdPrefix}-submit`));

    expect(
      await screen.findByText("Word must not be blank."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("input is not marked invalid before submitting", () => {
    render(<BannedWordForm submitAction={vi.fn()} />);
    expect(screen.getByTestId(`${testIdPrefix}-word`)).not.toHaveClass(
      "is-invalid",
    );
  });
});
