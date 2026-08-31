import type { Ats } from "@/lib/ats/types";

export type SeedCompany = {
  slug: string;
  name: string;
  ats: Ats;
  boardToken: string;
  careersUrl: string;
  website: string;
};

/** Tokens confirmed against live public board APIs during implementation. */
export const SEED_COMPANIES: SeedCompany[] = [
  {
    slug: "stripe",
    name: "Stripe",
    ats: "greenhouse",
    boardToken: "stripe",
    careersUrl: "https://stripe.com/jobs",
    website: "https://stripe.com",
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    ats: "greenhouse",
    boardToken: "anthropic",
    careersUrl: "https://job-boards.greenhouse.io/anthropic",
    website: "https://www.anthropic.com",
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    ats: "greenhouse",
    boardToken: "airbnb",
    careersUrl: "https://careers.airbnb.com",
    website: "https://www.airbnb.com",
  },
  {
    slug: "coinbase",
    name: "Coinbase",
    ats: "greenhouse",
    boardToken: "coinbase",
    careersUrl: "https://www.coinbase.com/careers",
    website: "https://www.coinbase.com",
  },
  {
    slug: "discord",
    name: "Discord",
    ats: "greenhouse",
    boardToken: "discord",
    careersUrl: "https://discord.com/careers",
    website: "https://discord.com",
  },
  {
    slug: "figma",
    name: "Figma",
    ats: "greenhouse",
    boardToken: "figma",
    careersUrl: "https://www.figma.com/careers",
    website: "https://www.figma.com",
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    ats: "greenhouse",
    boardToken: "cloudflare",
    careersUrl: "https://www.cloudflare.com/careers",
    website: "https://www.cloudflare.com",
  },
  {
    slug: "databricks",
    name: "Databricks",
    ats: "greenhouse",
    boardToken: "databricks",
    careersUrl: "https://www.databricks.com/company/careers",
    website: "https://www.databricks.com",
  },
  {
    slug: "vercel",
    name: "Vercel",
    ats: "greenhouse",
    boardToken: "vercel",
    careersUrl: "https://vercel.com/careers",
    website: "https://vercel.com",
  },
  {
    slug: "dropbox",
    name: "Dropbox",
    ats: "greenhouse",
    boardToken: "dropbox",
    careersUrl: "https://jobs.dropbox.com",
    website: "https://www.dropbox.com",
  },
  {
    slug: "robinhood",
    name: "Robinhood",
    ats: "greenhouse",
    boardToken: "robinhood",
    careersUrl: "https://careers.robinhood.com",
    website: "https://robinhood.com",
  },
  {
    slug: "block",
    name: "Block",
    ats: "greenhouse",
    boardToken: "block",
    careersUrl: "https://block.xyz/careers",
    website: "https://block.xyz",
  },
  {
    slug: "lyft",
    name: "Lyft",
    ats: "greenhouse",
    boardToken: "lyft",
    careersUrl: "https://www.lyft.com/careers",
    website: "https://www.lyft.com",
  },
  {
    slug: "openai",
    name: "OpenAI",
    ats: "ashby",
    boardToken: "openai",
    careersUrl: "https://jobs.ashbyhq.com/openai",
    website: "https://openai.com",
  },
  {
    slug: "ramp",
    name: "Ramp",
    ats: "ashby",
    boardToken: "ramp",
    careersUrl: "https://jobs.ashbyhq.com/ramp",
    website: "https://ramp.com",
  },
  {
    slug: "linear",
    name: "Linear",
    ats: "ashby",
    boardToken: "linear",
    careersUrl: "https://linear.app/careers",
    website: "https://linear.app",
  },
  {
    slug: "notion",
    name: "Notion",
    ats: "ashby",
    boardToken: "notion",
    careersUrl: "https://jobs.ashbyhq.com/notion",
    website: "https://www.notion.so",
  },
  {
    slug: "cursor",
    name: "Cursor",
    ats: "ashby",
    boardToken: "cursor",
    careersUrl: "https://jobs.ashbyhq.com/cursor",
    website: "https://cursor.com",
  },
  {
    slug: "palantir",
    name: "Palantir",
    ats: "lever",
    boardToken: "palantir",
    careersUrl: "https://jobs.lever.co/palantir",
    website: "https://www.palantir.com",
  },
  {
    slug: "wealthfront",
    name: "Wealthfront",
    ats: "lever",
    boardToken: "wealthfront",
    careersUrl: "https://jobs.lever.co/wealthfront",
    website: "https://www.wealthfront.com",
  },
];

export const STARTER_SLUGS = [
  "stripe",
  "anthropic",
  "discord",
  "figma",
  "coinbase",
  "cloudflare",
] as const;
