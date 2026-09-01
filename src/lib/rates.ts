/** Public rate card. Checkout is not live; requests file to the desk. */

export const BOUND_PASS = {
  id: "bound_pass",
  name: "Bound pass",
  price: "$11",
  cadence: "per 28 days",
  blurb: "Courier mail when a saved query sees a new first-seen row, plus 14 days in the closed drawer.",
} as const;

export const RULED_PIN = {
  id: "ruled_pin",
  name: "Ruled pin",
  price: "$120",
  cadence: "28 days",
  blurb: "One role already on the register sits above matching query rows. Apply still leaves for the employer ATS.",
} as const;

export const MASTHEAD_LINE = {
  id: "masthead_line",
  name: "Masthead line",
  price: "$55",
  cadence: "next two UTC editions",
  blurb: "A one-line credit on the register masthead. Not a newsletter. Not a homepage takeover.",
} as const;

export const SEEKER_ROWS: Array<{ label: string; register: string; bound: string }> = [
  { label: "Query the register", register: "Yes", bound: "Yes" },
  { label: "Expand Jobrow summaries", register: "Yes", bound: "Yes" },
  { label: "Browser watchlist", register: "Local only", bound: "Local only" },
  { label: "Apply", register: "Employer ATS", bound: "Employer ATS" },
  { label: "Courier when first-seen matches a saved query", register: "—", bound: "Email" },
  { label: "Closed drawer (14 days after a clean miss)", register: "—", bound: "Yes" },
  { label: "Resume pipe", register: "Never", bound: "Never" },
  { label: "Price", register: "$0", bound: `${BOUND_PASS.price} ${BOUND_PASS.cadence}` },
];
