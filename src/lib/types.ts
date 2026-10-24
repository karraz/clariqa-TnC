export type Role = "student" | "admin";
export type CourseStatus = "draft" | "published" | "closed";
export type CourseMode = "online" | "physical" | "hybrid";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const COURSE_CATEGORIES = ["SPSS", "Statistics", "R", "Python", "Excel", "Power BI", "AI"] as const;

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  organisation: string | null;
  role: Role;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  description_md: string | null;
  price_myr: number;
  start_date: string | null;
  end_date: string | null;
  mode: CourseMode;
  venue: string | null;
  seats: number | null;
  cover_url: string | null;
  status: CourseStatus;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: PaymentStatus;
  payment_method: string | null;
  amount_myr: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Material {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  cover_url: string | null;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  topic: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}
