import React from "react";
import BannedWordForm from "main/components/BannedWords/BannedWordForm";

export default {
  title: "components/BannedWords/BannedWordForm",
  component: BannedWordForm,
};

const Template = (args) => {
  return <BannedWordForm {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  submitAction: (data) => {
    console.log("Submit was clicked with data: ", data);
    window.alert("Submit was clicked with data: " + JSON.stringify(data));
  },
};
