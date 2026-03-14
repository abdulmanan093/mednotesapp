const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const text = await res.text();
  let json: T;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `API returned non-JSON from ${url} (status ${res.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!res.ok) {
    throw new Error((json as Record<string, string>).error || "Request failed");
  }

  return json;
}

// ─── Types for API responses ─────────────────────────────

import { Block, Subject, Chapter } from "@/types/database";

export interface NoteWithUrl {
  id: string;
  chapter_id: string;
  subject_id: string;
  block_id: string;
  pdf_file_name: string;
  pdf_file_key: string;
  file_size: string | null;
  upload_date: string | null;
  created_at: string;
  pdf_url: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  university: string | null;
  mbbs_year: number | null;
  access_end: string | null;
  status: string;
  assignedBlocks: string[];
}

// ─── API functions ───────────────────────────────────────

export interface DeviceInfo {
  model: string;
  os: string;
  platform: string;
}

export async function apiLogin(email: string, device?: DeviceInfo) {
  return request<{ user: AuthUser }>("/api/mobile/login", {
    method: "POST",
    body: JSON.stringify({ email, device }),
  });
}

export async function apiGetBlocks(year?: number) {
  const params = year ? `?year=${year}` : "";
  return request<{ blocks: Block[] }>(`/api/mobile/blocks${params}`);
}

export async function apiGetSubjects(blockId: string) {
  return request<{ block: Block; subjects: Subject[] }>(
    `/api/mobile/subjects?block_id=${encodeURIComponent(blockId)}`,
  );
}

export async function apiGetChapters(subjectId: string) {
  return request<{
    subject: Subject;
    chapters: Chapter[];
    notes: NoteWithUrl[];
  }>(`/api/mobile/chapters?subject_id=${encodeURIComponent(subjectId)}`);
}

export interface LibraryResponse {
  blocks: Block[];
  subjects: Subject[];
  chapters: Chapter[];
  notes: NoteWithUrl[];
}

export async function apiGetLibrary(cacheBuster?: number | string) {
  const qs = cacheBuster ? `?t=${encodeURIComponent(String(cacheBuster))}` : "";
  return request<LibraryResponse>(`/api/mobile/library${qs}`);
}

export interface LibraryVersionResponse {
  version: string | null;
}

export async function apiGetLibraryVersion() {
  // Add a cache-buster to avoid any intermediate caching (CDN/proxies)
  return request<LibraryVersionResponse>(
    `/api/mobile/library-version?t=${Date.now()}`,
  );
}
