import React from "react";

import FarmStats from "main/components/Game/FarmStats";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Game/FarmStats",
  component: FarmStats,
};

const Template = (args) => {
  return <FarmStats {...args} />;
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  farmer: farmerFixtures.oneFarmer[0],
};

export const HealthyCow = Template.bind({});

HealthyCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 100,
  },
};

export const NeutralCow = Template.bind({});

NeutralCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 70,
  },
};

export const ConfusedCow = Template.bind({});

ConfusedCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 50,
  },
};

export const SadCow = Template.bind({});

SadCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 30,
  },
};

export const AngryCow = Template.bind({});

AngryCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 10,
  },
};

export const DeadCow = Template.bind({});

DeadCow.args = {
  farmer: {
    ...farmerFixtures.oneFarmer[0],
    cowHealth: 0,
  },
};
