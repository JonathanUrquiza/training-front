// User types
export interface User {
  id: number;
  email: string;
  name: string;
  currentLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  workoutsCompleted: number;
  levelProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Workout types
export interface Exercise {
  id: number;
  nombre: string;
  grupoMuscular: string;
  nivel: string;
  order: number;
  completed: boolean;
}

export interface WorkoutBlock {
  block: string;
  duration: number;
  exercises: Exercise[];
}

export interface Workout {
  id: number;
  userId: number;
  date: string;
  level: string;
  duration: number;
  exercises: WorkoutBlock[];
  completed: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPreview {
  level: string;
  totalMinutes: number;
  blocks: {
    key: string;
    name: string;
    duration: number;
    exerciseCount: number;
  }[];
}

export interface WorkoutStats {
  total: {
    totalWorkouts: number;
    completedWorkouts: number;
    totalDuration: number;
    avgDuration: number;
  };
  weekly: {
    week: string;
    count: number;
    totalDuration: number;
  }[];
  byLevel: Record<string, number>;
}

// Goal types
export interface Goal {
  id: number;
  userId: number;
  description: string;
  type: 'weight' | 'reps' | 'time' | 'workouts' | 'custom';
  targetValue: number;
  currentValue: number;
  progress: number;
  deadline: string | null;
  completed: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
}

// Record (PR) types
export interface PersonalRecord {
  id: number;
  userId: number;
  exercise: string;
  type: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  unit: string;
  notes: string;
  isPR: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordResult {
  record: PersonalRecord;
  isPR: boolean;
  previousBest: number | null;
  improvement: {
    absolute: number;
    percentage: string;
    isPositive: boolean;
  } | null;
}

export interface ExerciseHistory {
  history: PersonalRecord[];
  bestRecord: PersonalRecord | null;
  totalEntries: number;
}

export interface RecordStats {
  [key: string]: {
    totalRecords: number;
    prs: number;
  };
}

// Calendar types
export interface CalendarDay {
  date: string;
  level: string;
  completed: boolean;
  duration: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
  };
}

