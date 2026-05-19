import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";

type DividerIndexContextValue = () => number;

const DividerIndexContext = createContext<DividerIndexContextValue | null>(null);

export function DividerIndexProvider({ children }: { children: ReactNode }) {
  const counterRef = useRef(0);
  const nextIndex = useCallback(() => counterRef.current++, []);

  return (
    <DividerIndexContext.Provider value={nextIndex}>{children}</DividerIndexContext.Provider>
  );
}

/** Stable index per divider instance (0, 1, 2, … in document order). */
export function useDividerIndex(): number {
  const nextIndex = useContext(DividerIndexContext);
  if (nextIndex == null) {
    throw new Error("useDividerIndex must be used within DividerIndexProvider");
  }
  const indexRef = useRef<number | null>(null);
  if (indexRef.current == null) {
    indexRef.current = nextIndex();
  }
  return indexRef.current;
}
