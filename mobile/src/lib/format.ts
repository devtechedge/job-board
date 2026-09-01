export function n(value: number): string {
  return value.toLocaleString("en-US");
}

export function ago(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function workplaceLabel(value: string): string {
  if (value === "remote") return "Remote";
  if (value === "hybrid") return "Hybrid";
  if (value === "onsite") return "On-site";
  return "Unknown";
}

export function atsLabel(value: string): string {
  if (value === "greenhouse") return "Greenhouse";
  if (value === "ashby") return "Ashby";
  if (value === "lever") return "Lever";
  if (value === "workable") return "Workable";
  return value;
}

export function functionLabel(value: string | null | undefined): string {
  const map: Record<string, string> = {
    backend: "Backend",
    frontend: "Frontend",
    fullstack: "Full-stack",
    mobile: "Mobile",
    data: "Data",
    ml: "Machine learning",
    design: "Design",
    product: "Product",
    security: "Security",
    infra: "Infrastructure",
    research: "Research",
    engineering: "Engineering",
  };
  const key = (value ?? "").toLowerCase();
  return map[key] || value || "Unclassified";
}

export function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
