export interface Block {
  id: string;
  name: string;
  year: number;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  block_id: string;
  sort_order?: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  subject_id: string;
  block_id: string;
  sort_order?: number;
  created_at: string;
}

export interface Note {
  id: string;
  chapter_id: string;
  subject_id: string;
  block_id: string;
  pdf_file_name: string;
  pdf_file_key: string | null;
  file_size: string | null;
  upload_date: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  university: string | null;
  mbbs_year: number | null;
  status: "Enabled" | "Disabled";
  access_start: string | null;
  access_end: string | null;
  created_at: string;
}

export interface UserBlock {
  user_id: string;
  block_id: string;
}
