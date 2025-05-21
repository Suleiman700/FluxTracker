
"use client";

import type { DisplayPayment } from "@/lib/types";
import { PaymentItem } from "./PaymentItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

interface PaymentListProps {
  paymentsForMonth: DisplayPayment[];
  onEditPayment: (payment: DisplayPayment) => void;
  onTogglePaid: (paymentId: string, paid: boolean, instanceDate?: string) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export function PaymentList({ paymentsForMonth, onEditPayment, onTogglePaid, onDeletePayment }: PaymentListProps) {
  if (paymentsForMonth.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Payments This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No payments scheduled for this month.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Payments This Month</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paymentsForMonth.map((payment) => (
          <PaymentItem
            key={`${payment.id}-${payment.instanceDate}`}
            payment={payment}
            onEdit={onEditPayment}
            onTogglePaid={onTogglePaid}
            onDelete={onDeletePayment}
          />
        ))}
      </CardContent>
    </Card>
  );
}
