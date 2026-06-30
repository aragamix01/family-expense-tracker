export type PeriodStatus = "open" | "closed";

export type Member = {
  id: string;
  name: string;
  line_user_id: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
};

export type Period = {
  id: string;
  name: string;
  status: PeriodStatus;
  closed_at: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  period_id: string;
  description: string;
  amount: number;
  category_id: string;
  date: string;
  created_at: string;
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
};

export type Database = {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: { name: string; line_user_id?: string | null };
        Update: { name?: string; line_user_id?: string | null };
      };
      categories: {
        Row: Category;
        Insert: { name: string; is_default?: boolean };
        Update: { name?: string; is_default?: boolean };
      };
      periods: {
        Row: Period;
        Insert: { name: string; status?: PeriodStatus };
        Update: { name?: string; status?: PeriodStatus; closed_at?: string | null };
      };
      expenses: {
        Row: Expense;
        Insert: { period_id: string; description: string; amount: number; category_id: string; date: string };
        Update: { description?: string; amount?: number; category_id?: string; date?: string };
      };
      expense_splits: {
        Row: ExpenseSplit;
        Insert: { expense_id: string; member_id: string; amount: number };
        Update: { amount?: number };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
