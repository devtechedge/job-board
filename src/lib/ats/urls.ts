/** Public board JSON endpoints. HTML career-page scraping is not the happy path. */

import { BOARD_TOKEN_RE } from "../safe.ts";

function token(value: string): string {
  if (!BOARD_TOKEN_RE.test(value)) throw new Error("invalid board token");
  return encodeURIComponent(value);
}

export function greenhouseListUrl(board: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${token(board)}/jobs?content=true`;
}

export function greenhouseDetailUrl(board: string, id: string): string {
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(id)) throw new Error("invalid job id");
  return `https://boards-api.greenhouse.io/v1/boards/${token(board)}/jobs/${encodeURIComponent(id)}`;
}

export function ashbyListUrl(board: string): string {
  return `https://api.ashbyhq.com/posting-api/job-board/${token(board)}?includeCompensation=true`;
}

export function leverListUrl(board: string): string {
  return `https://api.lever.co/v0/postings/${token(board)}?mode=json`;
}

export function workableListUrl(board: string): string {
  return `https://apply.workable.com/api/v1/widget/accounts/${token(board)}`;
}
