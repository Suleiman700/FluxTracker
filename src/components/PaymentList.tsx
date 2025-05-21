
"use client";

import type { DisplayPayment } from "@/lib/types";
import type { PaymentViewMode } from "./FluxTrackerDashboard"; // Import the type
import { PaymentItem } from "./PaymentItem";
import { PaymentTableRow } from "./PaymentTableRow"; // New component for table rows
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow as UiTableRow } from "@/components/ui/table"; // Renamed TableRow to UiTableRow
import { ListChecks } from "lucide-react";

interface PaymentListProps {
  paymentsForMonth: DisplayPayment[];
  viewMode: PaymentViewMode;
  onEditPayment: (payment: DisplayPayment) => void;
  onTogglePaid: (paymentId: string, paid: boolean, instanceDate?: string) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export function PaymentList({ paymentsForMonth, viewMode, onEditPayment, onTogglePaid, onDeletePayment }: PaymentListProps) {
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
      <CardContent className={viewMode === 'table' ? 'p-0' : ''}> {/* Remove padding for table view to use table's own spacing */}
        {viewMode === 'cards' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentsForMonth.map((payment) => (
              <PaymentItem
                key={`${payment.id}-${payment.instanceDate}`}
                payment={payment}
                onEdit={onEditPayment}
                onTogglePaid={onTogglePaid}
                onDelete={onDeletePayment}
              />
            ))}
          </div>
        )}
        {viewMode === 'table' && (
          <Table>
            <TableHeader>
              <UiTableRow>
                <TableHead className="w-[50px]">Paid</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </UiTableRow>
            </TableHeader>
            <TableBody>
              {paymentsForMonth.map((payment) => (
                <PaymentTableRow
                  key={`${payment.id}-${payment.instanceDate}`}
                  payment={payment}
                  onEdit={onEditPayment}
                  onTogglePaid={onTogglePaid}
                  onDelete={onDeletePayment}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
