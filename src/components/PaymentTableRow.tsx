
"use client";

import { useState } from "react";
import type { DisplayPayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit3, Trash2, Tag, Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentTableRowProps {
  payment: DisplayPayment;
  onEdit: (payment: DisplayPayment) => void;
  onTogglePaid: (paymentId: string, paid: boolean, instanceDate?: string) => Promise<void>;
  onDelete: (paymentId: string) => Promise<void>;
}

export function PaymentTableRow({ payment, onEdit, onTogglePaid, onDelete }: PaymentTableRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleTogglePaid = async (checked: boolean) => {
    await onTogglePaid(payment.id, checked, payment.isInstance ? payment.instanceDate : undefined);
  };

  const handleDeleteConfirm = async () => {
    await onDelete(payment.id);
    setIsDeleteDialogOpen(false);
  };

  const paymentDate = parseISO(payment.instanceDate);

  return (
    <>
      <TableRow className="hover:bg-muted/20">
        <TableCell>
          <Checkbox
            checked={payment.isPaidInMonth}
            onCheckedChange={handleTogglePaid}
            aria-label={payment.isPaidInMonth ? "Mark as unpaid" : "Mark as paid"}
            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
        </TableCell>
        <TableCell>
          <div className="font-medium">{payment.name}</div>
          {payment.isRecurring && payment.isInstance && payment.totalInstallments && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Repeat className="mr-1 h-3 w-3" /> Installment {payment.installmentNumber} of {payment.totalInstallments}
            </div>
          )}
        </TableCell>
        <TableCell className="text-accent font-semibold">${payment.amount.toFixed(2)}</TableCell>
        <TableCell>{format(paymentDate, "MMM dd, yyyy")}</TableCell>
        <TableCell>
          {payment.categoryName ? (
            <Badge variant="secondary" className="flex items-center w-fit text-xs">
              <Tag className="mr-1 h-3 w-3" /> {payment.categoryName}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground italic">Uncategorized</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => onEdit(payment)} aria-label="Edit payment" className="h-8 w-8">
            <Edit3 className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90"
            aria-label="Delete payment"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment
              "{payment.name}". If this is a recurring payment, all its past and future
              instances will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
