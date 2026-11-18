import React, { useState } from "react";
import PageSizeSelector from "main/components/Utils/PageSizeSelector";

export default {
  title: "components/Utils/PageSizeSelector",
  component: PageSizeSelector,
};

const Template = (args) => {
  const [value, setValue] = useState(args.value ?? 20);
  return <PageSizeSelector {...args} value={value} onChange={setValue} />;
};

export const Default = Template.bind({});
Default.args = {
  value: 20,
};

export const LargePageSize = Template.bind({});
LargePageSize.args = {
  value: 200,
};

export const CustomOptions = Template.bind({});
CustomOptions.args = {
  value: 10,
  options: [5, 10, 25, 50],
};
