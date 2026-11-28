import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import BannedWordsTable from "main/components/BannedWords/BannedWordsTable";
import { bannedWordsFixtures } from "fixtures/bannedWordsFixtures";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/bannedWordUtils";
import { vi } from "vitest";

const { mockMutate, mockUseBackendMutation } = vi.hoisted(() => {
  const mutate = vi.fn();
  const useBackendMutationMock = vi.fn(() => ({ mutate }));
  return { mockMutate: mutate, mockUseBackendMutation: useBackendMutationMock };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
  };
});

describe("BannedWordsTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "BannedWordsTable";

  beforeEach(() => {
    mockMutate.mockReset();
    mockUseBackendMutation.mockClear();
  });

  const renderTable = (bannedWords) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BannedWordsTable bannedWords={bannedWords} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("renders headers and no rows for an empty list", () => {
    renderTable([]);

    expect(screen.getByText("id")).toBeInTheDocument();
    expect(screen.getByText("Word")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("renders a row for each banned word", () => {
    renderTable(bannedWordsFixtures.threeBannedWords);

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-word`),
    ).toHaveTextContent("darn");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-word`),
    ).toHaveTextContent("shoot");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("sets up the delete mutation with the right helpers and cache key", () => {
    renderTable(bannedWordsFixtures.threeBannedWords);

    expect(mockUseBackendMutation).toHaveBeenCalledWith(
      cellToAxiosParamsDelete,
      { onSuccess: onDeleteSuccess },
      ["/api/admin/bannedwords/all"],
    );
  });

  test("clicking Delete calls the delete mutation for that row", () => {
    renderTable(bannedWordsFixtures.threeBannedWords);

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const cell = mockMutate.mock.calls[0][0];
    expect(cell.row.values.id).toBe(2);
    expect(cell.row.values.word).toBe("heck");
  });
});
