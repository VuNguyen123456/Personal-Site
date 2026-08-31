import { Outlet } from "react-router-dom";
import { CompactEmptySpacerSection, EmptySpacerSection, SectionDiagonalGap } from "./PersonalHomepage";
import { ThemeProvider } from "./useDarkMode";

export default function Root() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white transition-colors duration-300 ease-in-out dark:bg-black">
        <EmptySpacerSection className="bg-white dark:bg-black" />
        <SectionDiagonalGap index={0} />
        <CompactEmptySpacerSection className="bg-white dark:bg-black" />
        <SectionDiagonalGap index={1} />
        <Outlet />
      </div>
    </ThemeProvider>
  );
}
