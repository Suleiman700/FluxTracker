
export interface Category {
  id: string;
  name: string;
}

export interface Payment {
  id: string;
  name: string;
  description?: string;
  amount: number;
  date: string; // YYYY-MM-DD. For one-time, it's the payment date. For recurring, it's the start date of the first installment.
  isRecurring: boolean;
  recurrence?: {
    frequency: 'monthly'; // Only monthly for now
    installments: number; // Total number of installments
  };
  paid?: boolean; // For one-time payments.
  paidInstallments?: Record<string, boolean>; // Key: YYYY-MM-DD of the installment due date, Value: paid status
  categoryId?: string; // ID of the category
}

// Represents a payment instance to be displayed for a given month
export interface DisplayPayment extends Payment {
  instanceDate: string; // The actual due date for this instance in the current month
  isInstance?: boolean; // True if this is an instance of a recurring payment
  installmentNumber?: number; // e.g., 1
  totalInstallments?: number; // e.g., 8
  isPaidInMonth: boolean; // The paid status for this specific instance/month
  categoryName?: string; // Name of the category
}

export interface AppData {
  monthlySalaries: Record<string, number>; // Key: YYYY-MM, Value: salary for that month
  payments: Payment[];
  categories: Category[];
}

export interface SpendingByCategory {
  [categoryNameOrUncategorized: string]: number;
}

