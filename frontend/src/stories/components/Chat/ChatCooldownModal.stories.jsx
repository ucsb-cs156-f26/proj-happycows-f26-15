import React from "react";
import ChatCooldownModal from "main/components/Chat/ChatCooldownModal";

export default {
  title: "components/Chat/ChatCooldownModal",
  component: ChatCooldownModal,
};

const Template = (args) => <ChatCooldownModal {...args} />;

export const WithUsername = Template.bind({});
WithUsername.args = {
  show: true,
  username: "Alice",
  onClose: () => window.alert("onClose"),
  onSubmit: (durationSeconds) =>
    window.alert(`onSubmit: durationSeconds=${durationSeconds}`),
};

export const WithoutUsername = Template.bind({});
WithoutUsername.args = {
  ...WithUsername.args,
  username: undefined,
};
