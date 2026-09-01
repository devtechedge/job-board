import { useEffect, type ReactNode } from "react";
import { attachScrollParallax } from "@/lib/motion";

const ENTER = ".page-enter-header, .page-enter-main, .page-enter-footer";

export function PageMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stopParallax = attachScrollParallax();
    const finish = () => {
      document.querySelectorAll(ENTER).forEach((node) => {
        node.classList.add("page-enter-done");
      });
    };
    const timer = window.setTimeout(finish, 1100);
    return () => {
      window.clearTimeout(timer);
      stopParallax();
    };
  }, []);
  return <>{children}</>;
}
