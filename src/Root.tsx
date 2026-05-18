import { Outlet } from "react-router-dom";
import { CompactEmptySpacerSection, EmptySpacerSection, SectionDiagonalGap } from "./PersonalHomepage";
import { ThemeProvider } from "./useDarkMode";

export default function Root() {
  return (
    <ThemeProvider>
    <div className="min-h-screen bg-white transition-colors dark:bg-black">
      <EmptySpacerSection className="bg-white dark:bg-black" />
      <SectionDiagonalGap />
      <CompactEmptySpacerSection className="bg-white dark:bg-black" />
      <SectionDiagonalGap />
      <Outlet />
    </div>
    </ThemeProvider>
  );
}
