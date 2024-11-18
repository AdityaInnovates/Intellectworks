import { FieldValue } from 'firebase-admin/firestore';

export interface UserRequest {
  userId?: string;
  email?: string;
  password?: string;
  name?: string;
}

export interface UserData {
  name: string;
  email: string;
  createdAt: FieldValue;
  updatedAt?: FieldValue;
}

export interface NoteRequest {
  userId: string;
  title: string;
  content: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: FieldValue;
} 