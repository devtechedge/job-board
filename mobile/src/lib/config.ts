const FALLBACK = "https://jobrow.vercel.app";

export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || FALLBACK).replace(/\/$/, "");
