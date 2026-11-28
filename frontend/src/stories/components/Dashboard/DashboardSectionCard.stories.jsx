import DashboardSectionCard from "main/components/Dashboard/DashboardSectionCard";
import { fn } from "storybook/test";

const meta = {
  title: "components/Dashboard/DashboardSectionCard",
  component: DashboardSectionCard,
  args: {
    title: "Example Dashboard Section",
    testid: "example-dashboard-section",
    children: <p>Example dashboard content</p>,
    onToggleVisible: fn(),
  },
};

export default meta;

export const AdminVisible = {
  args: {
    visible: true,
    isAdminView: true,
  },
};

export const AdminHidden = {
  args: {
    visible: false,
    isAdminView: true,
  },
};

export const StudentVisible = {
  args: {
    visible: true,
    isAdminView: false,
  },
};

export const StudentHidden = {
  args: {
    visible: false,
    isAdminView: false,
  },
};
