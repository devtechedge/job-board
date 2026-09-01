const FALLBACK = "https://job-board-devtechedge1.vercel.app";

export const API_BASE = (process.env.EXPO_PUBLIC_API_URL || FALLBACK).replace(/\/$/, "");
