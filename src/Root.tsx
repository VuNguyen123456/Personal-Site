import { Outlet } from "react-router-dom";
import { CompactEmptySpacerSection, EmptySpacerSection, SectionDiagonalGap } from "./PersonalHomepage";
import { DividerIndexProvider } from "./dividerIndex";
import { ThemeProvider } from "./useDarkMode";

export default function Root() {
  return (
    <ThemeProvider>
      <DividerIndexProvider>
      <div className="min-h-screen bg-white transition-colors duration-300 ease-in-out dark:bg-black">
        <EmptySpacerSection className="bg-white dark:bg-black" />
        <SectionDiagonalGap />
        <CompactEmptySpacerSection className="bg-white dark:bg-black" />
        <SectionDiagonalGap />
        <Outlet />
      </div>
      </DividerIndexProvider>
    </ThemeProvider>
  );
}
