import type { Ats, BoardAdapter } from "@/lib/ats/types";
import { ashbyAdapter } from "@/lib/ats/ashby";
import { greenhouseAdapter } from "@/lib/ats/greenhouse";
import { leverAdapter } from "@/lib/ats/lever";
import { workableAdapter } from "@/lib/ats/workable";

const adapters: Record<Ats, BoardAdapter> = {
  greenhouse: greenhouseAdapter,
  ashby: ashbyAdapter,
  lever: leverAdapter,
  workable: workableAdapter,
};

export function getAdapter(ats: Ats): BoardAdapter {
  return adapters[ats];
}

export { adapters };
