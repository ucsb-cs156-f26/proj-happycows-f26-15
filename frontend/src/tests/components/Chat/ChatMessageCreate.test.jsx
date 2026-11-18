import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";

const mockToastError = vi.hoisted(() => vi.fn());
vi.mock("react-toastify", async () => {
  const actual = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...actual,
    toast: { ...actual.toast, error: mockToastError },
  };
});

describe("ChatMessageCreate", () => {
  const gameId = 1;

  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    mockToastError.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/chat/get")
      .reply(200, { content: chatMessageFixtures.oneChatMessage });
  });

  test("renders without crashing", async () => {
    // arrange
    const submitAction = vi.fn();

    //act
    render(
      <QueryClientProvider client={queryClient}>
        <ChatMessageCreate submitAction={submitAction} />
      </QueryClientProvider>,
    );

    //assert

    await waitFor(() => {
      expect(screen.getByText(/Send/)).toBeInTheDocument();
    });

    expect(screen.getByTestId("ChatMessageCreate-Message")).toBeInTheDocument();
    expect(screen.getByTestId("ChatMessageCreate-Send")).toBeInTheDocument();

    expect(screen.getByTestId("ChatMessageCreate")).toHaveStyle(
      "display: flex",
    );
    expect(screen.getByTestId("ChatMessageCreate")).toHaveStyle(
      "justifyContent: space-between",
    );
    expect(screen.getByTestId("ChatMessageCreate")).toHaveStyle(
      "alignItems: center",
    );
  });

  test("shows an error when the message input is empty", async () => {
    // arrange
    const submitAction = vi.fn();

    //act
    render(
      <QueryClientProvider client={queryClient}>
        <ChatMessageCreate submitAction={submitAction} />
      </QueryClientProvider>,
    );

    //assert
    const sendButton = screen.getByTestId("ChatMessageCreate-Send");

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Message cannot be empty")).toBeInTheDocument();
    });
  });

  test("calls the correct submit action on successful submission", async () => {
    // arrange
    const submitAction = vi.fn();
    const messageText = "Hello, World!";

    //act
    render(
      <QueryClientProvider client={queryClient}>
        <ChatMessageCreate submitAction={submitAction} />
      </QueryClientProvider>,
    );

    const messageInput = screen.getByTestId("ChatMessageCreate-Message");
    const sendButton = screen.getByTestId("ChatMessageCreate-Send");

    fireEvent.change(messageInput, { target: { value: messageText } });
    fireEvent.click(sendButton);

    // Wait for submit action to be called
    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });
  });

  test("When you fill in the message form and click submit, the right things happen", async () => {
    const messageText = "Hello World";
    const expectedMessage = {
      content: "Hello%20World",
      gameId: "1",
    };

    axiosMock
      .onPost("/api/chat/post?gameId=1&content=Hello%20World")
      .reply(200, chatMessageFixtures.oneChatMessage[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <ChatMessageCreate gameId={gameId} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Send/)).toBeInTheDocument();
    });

    const messageInput = screen.getByTestId("ChatMessageCreate-Message");
    const sendButton = screen.getByTestId("ChatMessageCreate-Send");

    fireEvent.change(messageInput, { target: { value: messageText } });
    fireEvent.click(sendButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify(expectedMessage),
    );

    await waitFor(() => expect(messageInput.value).toEqual(""));
  });

  describe("send errors", () => {
    const postUrl = "/api/chat/post?gameId=1&content=Hello%20World";

    const sendHello = async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ChatMessageCreate gameId={gameId} />
        </QueryClientProvider>,
      );
      const messageInput = screen.getByTestId("ChatMessageCreate-Message");
      fireEvent.change(messageInput, { target: { value: "Hello World" } });
      fireEvent.click(screen.getByTestId("ChatMessageCreate-Send"));
      await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
      return messageInput;
    };

    test("shows a cooldown popup with the remaining time and keeps the typed message", async () => {
      axiosMock.onPost(postUrl).reply(429, {
        message: "You are on chat cooldown for 125 more seconds",
        remainingSeconds: 125,
      });

      const messageInput = await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          "You are on a chat cooldown. You can send messages again in 2 minutes 5 seconds.",
        ),
      );
      expect(mockToastError).toHaveBeenCalledTimes(1);
      expect(messageInput.value).toEqual("Hello World");
    });

    test("falls back to the backend message when a 429 has no numeric remainingSeconds", async () => {
      axiosMock
        .onPost(postUrl)
        .reply(429, { message: "Slow down", remainingSeconds: "5" });

      await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith("Slow down"),
      );
    });

    test("uses the backend message for non-429 errors even if remainingSeconds is present", async () => {
      axiosMock
        .onPost(postUrl)
        .reply(403, { message: "Forbidden", remainingSeconds: 5 });

      await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith("Forbidden"),
      );
    });

    test("shows a generic message when the error response has no message", async () => {
      axiosMock.onPost(postUrl).reply(403);

      await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith("Unable to send message."),
      );
    });

    test("shows a generic message for a 429 with no response body", async () => {
      axiosMock.onPost(postUrl).reply(429);

      await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith("Unable to send message."),
      );
    });

    test("shows a generic message on a network error with no response", async () => {
      axiosMock.onPost(postUrl).networkError();

      await sendHello();

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith("Unable to send message."),
      );
    });
  });
});
