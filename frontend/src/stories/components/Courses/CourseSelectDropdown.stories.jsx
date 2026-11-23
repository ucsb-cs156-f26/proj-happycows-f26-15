import { useForm } from "react-hook-form";
import { http, HttpResponse } from "msw";
import CourseSelectDropdown from "main/components/Courses/CourseSelectDropdown";
import { coursesFixtures } from "fixtures/coursesFixtures";

export default {
  title: "components/Courses/CourseSelectDropdown",
  component: CourseSelectDropdown,
  render: function CourseSelectStory(args) {
    const { register } = useForm();
    return <CourseSelectDropdown {...args} register={register} />;
  },
  parameters: {
    msw: [
      http.get("/api/course/all", () =>
        HttpResponse.json(coursesFixtures.threeCourses),
      ),
    ],
  },
};

export const RequiredCourse = {};

export const OptionalCourse = {
  args: {
    includeNoCourseOption: true,
  },
};
