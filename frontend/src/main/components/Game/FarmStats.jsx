import React from "react";
import { Card, ProgressBar } from "react-bootstrap";

import happyCow from "../../../assets/happy_cow.png";
import neutralCow from "../../../assets/neutral_cow.png";
import confusedCow from "../../../assets/confused_cow.png";
import sadCow from "../../../assets/sad_cow.png";
import angryCow from "../../../assets/angry_cow.png";
import deadCow from "../../../assets/dead_cow.png";

import "./FarmStats.css";

const getCowSprite = (health) => {
  if (health <= 0) {
    return { image: deadCow, label: "Dead cow" };
  }
  if (health <= 20) {
    return { image: angryCow, label: "Angry cow" };
  }
  if (health <= 40) {
    return { image: sadCow, label: "Sad cow" };
  }
  if (health <= 60) {
    return { image: confusedCow, label: "Confused cow" };
  }
  if (health <= 80) {
    return { image: neutralCow, label: "Neutral cow" };
  }
  return { image: happyCow, label: "Happy cow" };
};

const FarmStats = ({ farmer }) => {
  const cowSprite = getCowSprite(farmer.cowHealth);

  return (
    <Card>
      <Card.Header as="h5" className="woodenboardtable">
        Your Farm Stats
      </Card.Header>
      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        {/* update total wealth and cow health with data from fixture */}
        <Card.Title className="text-center">
          💰 Total Wealth: ${farmer.totalWealth.toFixed(2)}
        </Card.Title>
        <Card.Text>Total Cows Bought: {farmer.cowsBought}</Card.Text>
        <Card.Text>Total Cows Sold: {farmer.cowsSold}</Card.Text>
        <Card.Title className="text-center">
          ❤️ Cow Health: {Math.round(farmer.cowHealth * 100) / 100}%
        </Card.Title>
        <ProgressBar
          now={farmer.cowHealth}
          min={0}
          max={100}
          variant="danger"
        />
        <div className="text-center my-3">
          <img
            src={cowSprite.image}
            alt={cowSprite.label}
            data-testid="cow-health-sprite"
            className="cow-health-sprite"
          />
        </div>
        <Card.Text>💀 Cow Deaths: {farmer.cowDeaths}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default FarmStats;
