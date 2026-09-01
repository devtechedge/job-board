import { useEffect, type ReactNode } from "react";
import { attachScrollParallax } from "@/lib/motion";

export function PageMotion({ children }: { children: ReactNode }) {
  useEffect(() => attachScrollParallax(), []);
  return <>{children}</>;
}
