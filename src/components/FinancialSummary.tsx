
"use client";

import type { DisplayPayment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface FinancialSummaryProps {
  salary: number; // This will now be the salary for the current month
  paymentsForMonth: DisplayPayment[];
}

export function FinancialSummary({ salary, paymentsForMonth }: FinancialSummaryProps) {
  const totalPaid = paymentsForMonth
    .filter(p => p.isPaidInMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUnpaid = paymentsForMonth
    .filter(p => !p.isPaidInMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalExpensesForMonth = paymentsForMonth.reduce((sum, p) => sum + p.amount, 0);
  const remainingSalary = salary - totalExpensesForMonth;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <SummaryItem icon={<TrendingUp className="text-green-500" />} title="Total Paid" value={formatCurrency(totalPaid)} />
        <SummaryItem icon={<TrendingDown className="text-red-500" />} title="Total Unpaid" value={formatCurrency(totalUnpaid)} />
        <SummaryItem icon={<Wallet className="text-blue-500" />} title="Remaining Salary" value={formatCurrency(remainingSalary)} 
          subtext={remainingSalary < 0 ? "(Over Budget)" : "(After all listed expenses)"}
          valueColor={remainingSalary < 0 ? "text-red-500" : "text-green-500"}
        />
      </CardContent>
    </Card>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtext?: string;
  valueColor?: string;
}

function SummaryItem({ icon, title, value, subtext, valueColor = "text-foreground" }: SummaryItemProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-card rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}
