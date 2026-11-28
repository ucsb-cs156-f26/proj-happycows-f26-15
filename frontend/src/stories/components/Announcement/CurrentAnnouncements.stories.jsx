import CurrentAnnouncements from "main/components/Announcement/CurrentAnnouncements";
import { announcementFixtures } from "fixtures/announcementFixtures";

export default {
  title: "components/Announcement/CurrentAnnouncements",
  component: CurrentAnnouncements,
};

export const ShortAnnouncement = {
  args: {
    announcements: [announcementFixtures.oneAnnouncement],
  },
};

export const ExpandableAnnouncement = {
  args: {
    announcements: [
      {
        id: 2,
        announcementText:
          "The commons will be closed for scheduled maintenance on Friday. " +
          "Please finish your farm tasks before the end of the day. " +
          "You can return to your farm when the commons reopens on Saturday morning.",
      },
    ],
  },
};
