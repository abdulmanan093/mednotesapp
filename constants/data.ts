import { Year, Block, Subject, Chapter } from '../types/database';

export const STATIC_YEARS: Year[] = [
  { id: 'year-1', name: 'First Year', order_index: 1, color: '#3B82F6', created_at: new Date().toISOString() },
  { id: 'year-2', name: 'Second Year', order_index: 2, color: '#A855F7', created_at: new Date().toISOString() },
  { id: 'year-3', name: 'Third Year', order_index: 3, color: '#10B981', created_at: new Date().toISOString() },
  { id: 'year-4', name: 'Fourth Year', order_index: 4, color: '#F97316', created_at: new Date().toISOString() },
];

export const STATIC_BLOCKS: Block[] = [
  { id: 'block-1', year_id: 'year-1', name: 'Anatomy Basics', is_free: true, order_index: 1, created_at: new Date().toISOString() },
  { id: 'block-2', year_id: 'year-1', name: 'Physiology I', is_free: true, order_index: 2, created_at: new Date().toISOString() },
  { id: 'block-3', year_id: 'year-1', name: 'Biochemistry', is_free: false, order_index: 3, created_at: new Date().toISOString() },
  { id: 'block-4', year_id: 'year-2', name: 'Pathology', is_free: true, order_index: 1, created_at: new Date().toISOString() },
  { id: 'block-5', year_id: 'year-2', name: 'Pharmacology', is_free: false, order_index: 2, created_at: new Date().toISOString() },
];

export const STATIC_SUBJECTS: Subject[] = [
  { id: 'sub-1', block_id: 'block-1', name: 'Upper Limb', icon_name: 'book', color: '#3B82F6', order_index: 1, created_at: new Date().toISOString() },
  { id: 'sub-2', block_id: 'block-1', name: 'Lower Limb', icon_name: 'book', color: '#A855F7', order_index: 2, created_at: new Date().toISOString() },
  { id: 'sub-3', block_id: 'block-2', name: 'Cardiovascular', icon_name: 'activity', color: '#10B981', order_index: 1, created_at: new Date().toISOString() },
  { id: 'sub-4', block_id: 'block-3', name: 'Carbohydrates', icon_name: 'box', color: '#F59E0B', order_index: 1, created_at: new Date().toISOString() },
];

export const STATIC_CHAPTERS: Chapter[] = [
  { id: 'note-1', subject_id: 'sub-1', name: 'Bones of Upper Limb', description: 'Overview of Clavicle, Scapula, Humerus', duration_minutes: 15, order_index: 1, created_at: new Date().toISOString() },
  { id: 'note-2', subject_id: 'sub-1', name: 'Muscles of Pectoral Region', description: 'Pectoralis Major and Minor', duration_minutes: 10, order_index: 2, created_at: new Date().toISOString() },
  { id: 'note-3', subject_id: 'sub-3', name: 'Cardiac Cycle', description: 'Phases of the cardiac cycle', duration_minutes: 20, order_index: 1, created_at: new Date().toISOString() },
];
