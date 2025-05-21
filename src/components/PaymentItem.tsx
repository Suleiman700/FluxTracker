
"use client";

import { useState } from "react";
import type { DisplayPayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Tag, CalendarDays, Repeat, CheckCircle, Circle, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge"; // Added for category display

interface PaymentItemProps {
  payment: DisplayPayment;
  onEdit: (payment: DisplayPayment) => void;
  onTogglePaid: (paymentId: string, paid: boolean, instanceDate?: string) => Promise<void>;
  onDelete: (paymentId: string) => Promise<void>;
}

export function PaymentItem({ payment, onEdit, onTogglePaid, onDelete }: PaymentItemProps) {
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
      <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-primary flex items-center">
              {payment.isPaidInMonth ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <Circle className="mr-2 h-5 w-5 text-muted-foreground" />}
              {payment.name}
            </CardTitle>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => onEdit(payment)} aria-label="Edit payment">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive/90" 
                aria-label="Delete payment"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" /> Due: {format(paymentDate, "MMMM do, yyyy")}
          </CardDescription>
           {payment.categoryName && (
            <div className="mt-1">
                <Badge variant="secondary" className="flex items-center w-fit">
                    <Tag className="mr-1 h-3 w-3" /> {payment.categoryName}
                </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="py-2 space-y-2 flex-grow">
          <p className="text-2xl font-semibold text-accent">${payment.amount.toFixed(2)}</p>
          {payment.description && (
            <p className="text-sm text-foreground flex items-start">
              <Tag className="mr-2 h-4 w-4 mt-1 shrink-0 opacity-0" /> {/* Hidden tag for alignment if needed */} {payment.description}
            </p>
          )}
          {payment.isRecurring && payment.isInstance && payment.totalInstallments && (
            <p className="text-xs text-muted-foreground flex items-center">
              <Repeat className="mr-2 h-3 w-3" /> Installment {payment.installmentNumber} of {payment.totalInstallments}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`paid-${payment.id}-${payment.instanceDate}`}
              checked={payment.isPaidInMonth}
              onCheckedChange={handleTogglePaid}
              aria-label={payment.isPaidInMonth ? "Mark as unpaid" : "Mark as paid"}
            />
            <label
              htmlFor={`paid-${payment.id}-${payment.instanceDate}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {payment.isPaidInMonth ? "Paid" : "Mark as Paid"}
            </label>
          </div>
        </CardFooter>
      </Card>

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
