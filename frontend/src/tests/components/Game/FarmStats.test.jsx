import { render, screen, waitFor } from "@testing-library/react";
import FarmStats from "main/components/Game/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

describe("FarmStats tests", () => {
  test("renders without crashing", () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);
  });

  test("contains correct content", async () => {
    render(<FarmStats farmer={farmerFixtures.oneFarmer[0]} />);

    await waitFor(() => {
      expect(screen.getByText(/Total Wealth: \$1000/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Cow Health: 98%/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Bought: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Total Cows Sold: 5/)).toBeInTheDocument();
    expect(screen.getByText(/💀 Cow Deaths: 5/)).toBeInTheDocument();
  });

  test.each([
    [100, "Happy cow", "happy_cow.png"],
    [81, "Happy cow", "happy_cow.png"],
    [80, "Neutral cow", "neutral_cow.png"],
    [61, "Neutral cow", "neutral_cow.png"],
    [60, "Confused cow", "confused_cow.png"],
    [41, "Confused cow", "confused_cow.png"],
    [40, "Sad cow", "sad_cow.png"],
    [21, "Sad cow", "sad_cow.png"],
    [20, "Angry cow", "angry_cow.png"],
    [1, "Angry cow", "angry_cow.png"],
    [0, "Dead cow", "dead_cow.png"],
  ])("renders correct cow sprite at %i%% health", (health, label, filename) => {
    const farmer = {
      ...farmerFixtures.oneFarmer[0],
      cowHealth: health,
    };

    render(<FarmStats farmer={farmer} />);

    const sprite = screen.getByTestId("cow-health-sprite");

    expect(sprite).toHaveAttribute("alt", label);
    expect(sprite.getAttribute("src")).toContain(filename);
  });

  test("updates cow sprite when health changes", () => {
    const healthyFarmer = {
      ...farmerFixtures.oneFarmer[0],
      cowHealth: 98,
    };

    const { rerender } = render(<FarmStats farmer={healthyFarmer} />);

    expect(screen.getByTestId("cow-health-sprite")).toHaveAttribute(
      "alt",
      "Happy cow",
    );

    const unhealthyFarmer = {
      ...farmerFixtures.oneFarmer[0],
      cowHealth: 25,
    };

    rerender(<FarmStats farmer={unhealthyFarmer} />);

    expect(screen.getByTestId("cow-health-sprite")).toHaveAttribute(
      "alt",
      "Sad cow",
    );
  });
});
