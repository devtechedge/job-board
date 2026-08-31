import type { Workplace } from "./ats/types.ts";

const KEEP_TITLE =
  /\b(engineer|engineering|developer|software|designer|product manager|product design|data scien|data engineer|data analyst|research analyst|security analyst|quant|scientist|machine learning|ios|android|devops|\bsre\b|infrastructure|platform|frontend|front-end|backend|back-end|full[- ]?stack|quality assurance|\bqa\b|technical program|\btpm\b|prototyp|mobile|applied sci|\bmle\b|\betl\b|analytics engineer|growth engineer|solutions architect|architect|site reliability|developer relations|devrel|\bux\b|\bui\/ux\b|research engineer|security engineer)\b/i;

const DROP_TITLE =
  /\b(nurse|nursing|warehouse|cashier|driver|cook|therapist|retail associate|bartender|recruiter|recruiting|account executive|account manager|sales development|\bsdr\b|attorney|paralegal|customer support|customer success(?! engineer)|success manager|barista|janitor|security guard|medical assistant|pharmacist|physician|registered nurse|store manager|field technician|accountant|bookkeeper|copywriter|fp&a|financial analyst|client services|representative|coordinator|receptionist|office manager|executive assistant|chief of staff|recruiter)\b/i;


const SENIORITY_RULES: Array<[RegExp, string]> = [
  [/\b(intern|internship|university grad|student)\b/i, "intern"],
  [/\b(principal|distinguished|fellow)\b/i, "principal"],
  [/\b(staff|architect)\b/i, "staff"],
  [/\b(senior|sr\.?)\b/i, "senior"],
  [/\b(junior|jr\.?|early career|associate engineer)\b/i, "junior"],
  [/\b(manager|director|vp\b|head of|chief)\b/i, "manager"],
];

const FUNCTION_RULES: Array<[RegExp, string]> = [
  [/\b(ios|android|mobile|react native|flutter)\b/i, "mobile"],
  [/\b(machine learning|deep learning|\bml\b|\bai\b|llm|research sci|applied sci)\b/i, "ml"],
  [/\b(data engineer|analytics engineer|etl|warehouse|spark|snowflake)\b/i, "data"],
  [/\b(security|appsec|detection|identity|iam\b)\b/i, "security"],
  [/\b(sre|devops|infrastructure|platform|reliability|kubernetes|cloud engineer)\b/i, "infra"],
  [/\b(product design|designer|ux\b|ui\b|visual design|brand design)\b/i, "design"],
  [/\b(product manager|technical product|tpm\b|program manager)\b/i, "product"],
  [/\b(research scientist|research engineer|research)\b/i, "research"],
  [/\b(full[- ]?stack)\b/i, "fullstack"],
  [/\b(front[- ]?end|frontend)\b/i, "frontend"],
  [/\b(back[- ]?end|backend|server[- ]side)\b/i, "backend"],
];

const SKILL_WORDS = [
  "python",
  "typescript",
  "javascript",
  "react",
  "node",
  "golang",
  "rust",
  "java",
  "kotlin",
  "swift",
  "ruby",
  "rails",
  "postgres",
  "sql",
  "aws",
  "gcp",
  "azure",
  "kubernetes",
  "docker",
  "graphql",
  "redis",
  "spark",
  "pytorch",
  "tensorflow",
  "figma",
  "next.js",
  "vue",
  "django",
  "flask",
  "kafka",
  "terraform",
  "c++",
  "scala",
  "huggingface",
  "cuda",
];

const US_POSITIVE =
  /\b(united states|u\.s\.a?\.?|usa\b|american\b|remote[- ]us|us[- ]remote|nationwide|washington,? d\.?c\.?)\b/i;

const US_CITIES =
  /\b(new york|nyc|brooklyn|manhattan|san francisco|sf bay|south bay|bay area|seattle|austin|boston|chicago|denver|los angeles|\bla\b|palo alto|mountain view|sunnyvale|cupertino|redmond|bellevue|portland|miami|atlanta|dallas|houston|san jose|santa clara|oakland|menlo park|cambridge|somerville|irvine|santa monica|boulder|raleigh|durham|nashville|minneapolis|philadelphia|phoenix|salt lake|arlington|alexandria|mclean|reston|brooklyn|oakland)\b/i;

const US_STATE =
  /,\s*(AL|AK|AZ|AR|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|KS|KY|LA|MA|MD|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY)\b/;

const FOREIGN =
  /\b(india|bengaluru|bangalore|hyderabad|pune|gurgaon|gurugram|chennai|london|dublin|singapore|toronto|vancouver|berlin|paris|amsterdam|sydney|tokyo|seoul|mexico city|s[aã]o paulo|sao paulo|krakow|kraków|warsaw|tel aviv|munich|zurich|barcelona|madrid|stockholm|copenhagen|helsinki|lisbon|tallinn|nairobi|bogot[aá]|united kingdom|\buk\b|emea|apac|germany|france|netherlands|ireland|australia|japan|south korea|brazil|mexico|canada|poland|israel|sweden|denmark|finland|spain|portugal|switzerland|remote[- ]eu|eu[- ]only)\b/i;

export function classifySeniority(title: string): string | null {
  for (const [re, label] of SENIORITY_RULES) {
    if (re.test(title)) return label;
  }
  return "mid";
}

export function classifyFunction(title: string, department?: string | null): string | null {
  const blob = `${title} ${department ?? ""}`;
  for (const [re, label] of FUNCTION_RULES) {
    if (re.test(blob)) return label;
  }
  if (/\bengineer|developer|software\b/i.test(blob)) return "engineering";
  return null;
}

export function isTechRole(title: string, department?: string | null): boolean {
  const blob = `${title} ${department ?? ""}`;
  if (DROP_TITLE.test(blob) && !/\bengineer|technical|software\b/i.test(blob)) return false;
  if (KEEP_TITLE.test(blob)) return true;
  if (/\b(engineering|product|design|data|research|security|infrastructure)\b/i.test(department ?? "")) {
    return !DROP_TITLE.test(title);
  }
  return false;
}

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const skill of SKILL_WORDS) {
    const re = skill === "c++" ? /\bc\+\+\b/i : new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i");
    if (re.test(lower)) hits.push(skill);
  }
  return hits.slice(0, 12);
}

export function parseWorkplace(
  locationRaw: string,
  hint?: string | null,
  isRemote?: boolean | null,
): Workplace {
  const blob = `${locationRaw} ${hint ?? ""}`.toLowerCase();
  if (/\bhybrid\b/.test(blob) || hint === "hybrid") return "hybrid";
  if (
    isRemote ||
    hint === "remote" ||
    /\bremote\b/.test(blob) ||
    /\bdistributed\b/.test(blob) ||
    /\banywhere\b/.test(blob)
  ) {
    if (/\bhybrid\b/.test(blob)) return "hybrid";
    return "remote";
  }
  if (/\bon[- ]?site|in[- ]office|office\b/.test(blob) || hint === "onsite" || hint === "on-site") {
    return "onsite";
  }
  if (locationRaw.trim() && !/^n\/?a$/i.test(locationRaw.trim())) return "onsite";
  return "unknown";
}

export function isUsEligible(input: {
  locationRaw: string;
  locations: string[];
  workplace: Workplace;
  country?: string | null;
  hqCountry?: string | null;
}): boolean {
  const blob = [input.locationRaw, ...input.locations, input.country ?? ""].join(" ").trim();
  const country = (input.country ?? "").toUpperCase();
  if (country === "US" || country === "USA" || country === "UNITED STATES") return true;
  if (US_POSITIVE.test(blob) || US_CITIES.test(blob) || US_STATE.test(blob)) return true;
  if (/\bUS\b/.test(blob) || blob === "US") return true;
  const foreign = FOREIGN.test(blob);
  if (foreign && !US_POSITIVE.test(blob) && !US_CITIES.test(blob)) return false;
  if (input.workplace === "remote" && (input.hqCountry ?? "US") === "US" && !foreign) return true;
  if (!blob || /^n\/?a$/i.test(blob) || /anywhere|worldwide|global/i.test(blob)) {
    return (input.hqCountry ?? "US") === "US";
  }
  return (input.hqCountry ?? "US") === "US" && !foreign;
}

export function parseYoe(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*\+?\s*(?:years|yrs)(?:\s+of)?(?:\s+experience)?/i);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 0 || n > 30) return null;
  return n;
}

export { KEEP_TITLE, DROP_TITLE, FOREIGN, US_POSITIVE };
