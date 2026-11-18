import { fireEvent, render, screen } from "@testing-library/react";
import ManageCows from "main/components/Game/ManageCows";
import farmerFixtures from "fixtures/farmerFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { useParams } from "react-router";
import * as currentUserModule from "main/utils/currentUser";
import { vi } from "vitest";

const queryClient = new QueryClient();

// Mock the useCurrentUser and hasRole functions
vi.mock("main/utils/currentUser", async () => ({
  ...(await vi.importActual("main/utils/currentUser")),
  useCurrentUser: vi.fn(),
  hasRole: vi.fn(),
}));

// Mock useParams
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useParams: vi.fn(),
}));

describe("ManageCows tests", () => {
  const mockSetMessage = vi.fn();
  const mockOpenModal = vi.fn();

  test("renders without crashing", () => {
    useParams.mockReturnValue({ userId: 1 });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {},
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          onBuy={(farmer) => {
            console.log("onBuy called:", farmer);
          }}
          onSell={(farmer) => {
            console.log("onSell called:", farmer);
          }}
        />
      </QueryClientProvider>,
    );
  });

  test("renders message when admin visits other pages", async () => {
    useParams.mockReturnValue({ userId: 1 });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: 1,
          },
        },
      },
    });

    currentUserModule.hasRole.mockReturnValue(true);

    const mockBuy = vi.fn();
    const mockSell = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          onBuy={mockBuy}
          onSell={mockSell}
          userId={1}
        />
      </QueryClientProvider>,
    );

    const messageElement = screen.getByTestId("ManageCows-ViewOnly");

    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent(
      "This page is for viewing only, cannot buy and sell cows.",
    );

    const buyButton = screen.queryByTestId("buy-cow-button");
    const sellButton = screen.queryByTestId("sell-cow-button");

    expect(buyButton).toBeNull();
    expect(sellButton).toBeNull();
  });

  test('calls setMessage with "buy" when the buy button is clicked', () => {
    useParams.mockReturnValue({ userId: undefined });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: NaN,
          },
        },
      },
    });

    currentUserModule.hasRole.mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId("buy-cow-button"));

    expect(mockSetMessage).toHaveBeenCalledWith("buy");
    expect(mockOpenModal).toHaveBeenCalled();
  });

  test('calls setMessage with "sell" when the sell button is clicked', () => {
    useParams.mockReturnValue({ userId: undefined });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {
        root: {
          user: {
            id: NaN,
          },
        },
      },
    });

    currentUserModule.hasRole.mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows
          farmer={farmerFixtures.oneFarmer[0]}
          setMessage={mockSetMessage}
          openModal={mockOpenModal}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByTestId("sell-cow-button"));

    expect(mockSetMessage).toHaveBeenCalledWith("sell");
    expect(mockOpenModal).toHaveBeenCalled();
  });

  // New tests for purchase and selling fee display

  test("displays configured purchase and selling fees", () => {
    useParams.mockReturnValue({ userId: undefined });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {},
    });

    currentUserModule.hasRole.mockReturnValue(false);

    const game = {
      cowPrice: 100,
      milkPrice: 1,
      purchaseFee: 5,
      sellingFee: 3,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows farmer={farmerFixtures.oneFarmer[0]} game={game} />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("ManageCows-purchase-fee")).toHaveTextContent(
      "Purchase Fee: $5 per cow",
    );

    expect(screen.getByTestId("ManageCows-selling-fee")).toHaveTextContent(
      "Selling Fee: $3 per cow",
    );

    expect(
      screen.getByText(/Buying cows costs the current cow price plus/),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/minus the selling fee per cow/),
    ).toBeInTheDocument();
  });

  test("displays zero fees when fees are not configured", () => {
    useParams.mockReturnValue({ userId: undefined });

    currentUserModule.useCurrentUser.mockReturnValue({
      data: {},
    });

    currentUserModule.hasRole.mockReturnValue(false);

    const game = {
      cowPrice: 100,
      milkPrice: 1,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ManageCows farmer={farmerFixtures.oneFarmer[0]} game={game} />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("ManageCows-purchase-fee")).toHaveTextContent(
      "Purchase Fee: $0 per cow",
    );

    expect(screen.getByTestId("ManageCows-selling-fee")).toHaveTextContent(
      "Selling Fee: $0 per cow",
    );
  });
});
