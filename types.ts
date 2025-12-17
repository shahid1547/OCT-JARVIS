export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum Stream {
  SCIENCE = 'Science',
  COMMERCE = 'Commerce',
  ENGINEERING = 'Engineering',
  ARTS = 'Arts', // Added for completeness
  SCHOOL_GENERAL = 'School (General)'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  // Student specific
  standard?: string; // "10th", "12th", "2nd Year"
  stream?: Stream;
  isPro?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: string; // Base64 or URL
  type?: 'text' | 'image' | 'voice_transcript';
}

export enum TutorMode {
  EXPLAIN = 'EXPLAIN', // Structured teaching
  PRACTICE = 'PRACTICE', // Questions + Feedback
  EXAM_PREP = 'EXAM_PREP' // Advanced: Prediction
}

export interface GraphNode {
  id: string;
  group: number;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}