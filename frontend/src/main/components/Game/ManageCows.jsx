import React from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { useParams } from "react-router";

const ManageCows = ({ farmer, game, setMessage, openModal }) => {
  const { data: currentUser } = useCurrentUser();
  let { userId } = useParams();
  userId = userId ? parseInt(userId, 10) : NaN;

  // Stryker disable all
  const isViewOnly = hasRole(currentUser, "ROLE_ADMIN") && !isNaN(userId);
  // Stryker restore all

  return (
    <Card data-testid="ManageCows">
      <Card.Header as="h5" className="woodenboardtable">
        Manage Cows
      </Card.Header>
      <Card.Body
        style={
          // Stryker disable next-line all: don't test CSS params
          { backgroundColor: "rgb(245, 210, 140)" }
        }
      >
        <Card.Title className="text-center">
          💵 Market Cow Price: ${game?.cowPrice}
        </Card.Title>
        <Card.Title className="text-center">
          🐮 Number of Cows: {farmer.numOfCows}
        </Card.Title>
        <Card.Title className="text-center">
          🥛 Current Milk Price: ${game?.milkPrice}
        </Card.Title>

        {/* Display purchase and selling fees to players */}
        <p
          className="text-center small mb-1"
          data-testid="ManageCows-purchase-fee"
        >
          Purchase Fee: ${game?.purchaseFee ?? 0} per cow
        </p>
        <p
          className="text-center small mb-3"
          data-testid="ManageCows-selling-fee"
        >
          Selling Fee: ${game?.sellingFee ?? 0} per cow
        </p>

        {/* When viewing another user's farm as admin, hide buy/sell buttons */}
        {isViewOnly ? (
          <>
            <p data-testid="ManageCows-ViewOnly">
              This page is for viewing only, cannot buy and sell cows.
            </p>
          </>
        ) : (
          <>
            <Row>
              <Col className="text-center">
                <Button
                  variant="outline-success"
                  onClick={() => {
                    setMessage("buy");
                    openModal();
                  }}
                  data-testid="buy-cow-button"
                >
                  Buy cows
                </Button>
              </Col>
              <Col className="text-center">
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    setMessage("sell");
                    openModal();
                  }}
                  data-testid="sell-cow-button"
                >
                  Sell cows
                </Button>
              </Col>
            </Row>
            <div className="mt-2">
              <b>Note:</b>
              <ul>
                <li>
                  Buying cows costs the current cow price plus the purchase fee
                  per cow.
                </li>
                <li>
                  Selling cows earns the current cow price multiplied by average
                  cow health (as a percentage), minus the selling fee per cow.
                </li>
              </ul>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ManageCows;
