import React from "react";
import BannedWordsTable from "main/components/BannedWords/BannedWordsTable";
import { bannedWordsFixtures } from "fixtures/bannedWordsFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/BannedWords/BannedWordsTable",
  component: BannedWordsTable,
};

const Template = (args) => {
  return <BannedWordsTable {...args} />;
};

export const Empty = Template.bind({});
Empty.args = {
  bannedWords: [],
};

export const ThreeWords = Template.bind({});
ThreeWords.args = {
  bannedWords: bannedWordsFixtures.threeBannedWords,
};
ThreeWords.parameters = {
  msw: [
    http.delete("/api/admin/bannedwords", ({ request }) => {
      window.alert("DELETE: " + JSON.stringify(request.url));
      return HttpResponse.json({ message: "deleted" }, { status: 200 });
    }),
  ],
};
