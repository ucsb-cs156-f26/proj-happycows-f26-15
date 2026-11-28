import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminBannedWordsPage from "main/pages/AdminBannedWordsPage";
import { bannedWordsFixtures } from "fixtures/bannedWordsFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";
import { vi } from "vitest";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  const toast = (x) => mockToast(x);
  toast.error = (x) => mockToast(x);
  return {
    __esModule: true,
    ...originalModule,
    toast,
  };
});

describe("AdminBannedWordsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "BannedWordsTable";

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockToast.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <AdminBannedWordsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  test("shows the heading, description, form, and words from the backend", async () => {
    axiosMock
      .onGet("/api/admin/bannedwords/all")
      .reply(200, bannedWordsFixtures.threeBannedWords);

    renderPage();

    expect(screen.getByText("Banned Words")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Words on this list are replaced with asterisks when they are sent in chat.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("BannedWordForm-word")).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-word`),
    ).toHaveTextContent("darn");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-word`),
    ).toHaveTextContent("shoot");
  });

  test("shows an empty table when the list is empty", async () => {
    axiosMock.onGet("/api/admin/bannedwords/all").reply(200, []);

    renderPage();

    await waitFor(() =>
      expect(
        axiosMock.history.get.some(
          (r) => r.url === "/api/admin/bannedwords/all",
        ),
      ).toBe(true),
    );
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("adding a word posts it, shows a toast, and refreshes the list", async () => {
    axiosMock
      .onGet("/api/admin/bannedwords/all")
      .replyOnce(200, [])
      .onGet("/api/admin/bannedwords/all")
      .reply(200, [bannedWordsFixtures.oneBannedWord]);
    axiosMock
      .onPost("/api/admin/bannedwords/post")
      .reply(200, bannedWordsFixtures.oneBannedWord);

    renderPage();

    fireEvent.change(screen.getByTestId("BannedWordForm-word"), {
      target: { value: "darn" },
    });
    fireEvent.click(screen.getByTestId("BannedWordForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    expect(axiosMock.history.post[0].params).toEqual({ word: "darn" });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith('Banned word "darn" added'),
    );
    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-word`),
    ).toHaveTextContent("darn");
  });

  test("adding a duplicate word shows the backend error in a toast", async () => {
    axiosMock
      .onGet("/api/admin/bannedwords/all")
      .reply(200, [bannedWordsFixtures.oneBannedWord]);
    axiosMock
      .onPost("/api/admin/bannedwords/post")
      .reply(400, { message: "Word 'darn' is already banned" });

    renderPage();

    fireEvent.change(screen.getByTestId("BannedWordForm-word"), {
      target: { value: "darn" },
    });
    fireEvent.click(screen.getByTestId("BannedWordForm-submit"));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith("Word 'darn' is already banned"),
    );
  });

  test("deleting a word sends DELETE and shows the backend message", async () => {
    axiosMock
      .onGet("/api/admin/bannedwords/all")
      .reply(200, bannedWordsFixtures.threeBannedWords);
    axiosMock
      .onDelete("/api/admin/bannedwords")
      .reply(200, { message: "BannedWord with id 1 deleted" });

    renderPage();

    fireEvent.click(
      await screen.findByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith("BannedWord with id 1 deleted"),
    );
  });

  test("shows an empty table when the backend is unavailable", async () => {
    axiosMock.onGet("/api/admin/bannedwords/all").timeout();
    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() =>
      expect(
        axiosMock.history.get.some(
          (r) => r.url === "/api/admin/bannedwords/all",
        ),
      ).toBe(true),
    );
    restoreConsole();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });
});
