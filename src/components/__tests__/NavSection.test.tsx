import { test, expect } from "vitest";


test("foo", () => {
  expect(true).toBe(true);
});
// import { render, screen } from "@testing-library/react";
// import { NavSection } from "../NavSection";
// import { type TextContentEntry } from "../NavEntry";
// import { it, expect } from "vitest";

// const mockEntries: TextContentEntry[] = [
//   {
//     id: "entry1",
//     data: { id: "Entry1", section: "section1" },
//     collection: "textContent",
//   },
//   {
//     id: "entry2",
//     data: { id: "Entry2", section: "Section2" },
//     collection: "textContent",
//   },
//   {
//     id: "entry3",
//     data: { id: "Entry3", section: "Section1" },
//     collection: "textContent",
//   },
// ];

// it("renders without crashing", () => {
//   render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );
//   expect(screen.getByText("Section1")).toBeInTheDocument();
// });

// it("collapses if the sectionId is not in the pathname", () => {
//   Object.defineProperty(window, "location", {
//     value: {
//       pathname: "/foo",
//     },
//     writable: true,
//   });

//   render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );

//   expect(screen.getByText("Section1")).toHaveAttribute(
//     "aria-expanded",
//     "false"
//   );
// });

// it("expands if the sectionId is in the pathname", () => {
//   Object.defineProperty(window, "location", {
//     value: {
//       pathname: "/foo/section1",
//     },
//     writable: true,
//   });

//   render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );

//   expect(screen.getByText("Section1")).toHaveAttribute("aria-expanded", "true");
// });

// it("renders the correct number of entries", () => {
//   render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );

//   expect(screen.getAllByRole("listitem")).toHaveLength(mockEntries.length);
// });

// it("marks the correct entry as active", () => {
//   render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );

//   expect(screen.getByText("entry1")).toHaveClass("pf-m-current");
// });

// it("does not mark any entries as active if none are active", () => {
//   render(
//     <NavSection entries={mockEntries} sectionId="section1" activeItem="" />
//   );

//   expect(screen.queryByRole("listitem")).not.toHaveClass("pf-m-current");
// });

// it("matches snapshot", () => {
//   const { asFragment } = render(
//     <NavSection
//       entries={mockEntries}
//       sectionId="section1"
//       activeItem="entry1"
//     />
//   );
//   expect(asFragment()).toMatchSnapshot();
// });
