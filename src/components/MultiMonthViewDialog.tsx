
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppData } from "@/lib/types";
import { getPaymentsForMonth } from "@/lib/paymentUtils";
import { format, addMonths, isSameMonth } from "date-fns";
import { CalendarRange, Tag } from "lucide-react";

interface MultiMonthViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData | null;
  currentDashboardDate: Date;
}

export function MultiMonthViewDialog({
  isOpen,
  onClose,
  appData,
  currentDashboardDate,
}: MultiMonthViewDialogProps) {
  const currentMonthCardRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null); // Ref for the ScrollArea's viewport if needed, but direct element scroll is often simpler

  useEffect(() => {
    if (isOpen && currentMonthCardRef.current) {
      // Timeout helps ensure the element is fully rendered and layout is complete
      setTimeout(() => {
        currentMonthCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center", // "start", "center", "end", or "nearest"
        });
      }, 100); // Small delay, adjust if necessary
    }
  }, [isOpen]);

  if (!isOpen || !appData) return null;

  const monthsToShow: Date[] = [];
  for (let i = -6; i <= 6; i++) {
    monthsToShow.push(addMonths(currentDashboardDate, i));
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl w-full h-[90vh] flex flex-col bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center">
            <CalendarRange className="mr-2 h-5 w-5" /> Extended Payment Timeline
          </DialogTitle>
          <DialogDescription>
            View payments from {format(monthsToShow[0], "MMMM yyyy")} to {format(monthsToShow[monthsToShow.length - 1], "MMMM yyyy")}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow p-1 -mx-4 pr-3" viewportRef={scrollAreaRef}>
          <div className="space-y-6 p-4">
            {monthsToShow.map((monthDate) => {
              const paymentsForThisMonth = getPaymentsForMonth(appData.payments, monthDate, appData.categories);
              const salaryForThisMonth = appData.monthlySalaries[format(monthDate, 'yyyy-MM')] || 0;
              const totalExpensesThisMonth = paymentsForThisMonth.reduce((sum, p) => sum + p.amount, 0);
              const isCurrentFocusedMonth = isSameMonth(monthDate, currentDashboardDate);

              return (
                <Card 
                  key={format(monthDate, "yyyy-MM")} 
                  className={`shadow-md ${isCurrentFocusedMonth ? 'border-2 border-primary ring-2 ring-primary/50' : ''}`}
                  ref={isCurrentFocusedMonth ? currentMonthCardRef : null}
                >
                  <CardHeader className="bg-secondary/30 rounded-t-lg p-3">
                    <CardTitle className="text-lg text-primary">
                      {format(monthDate, "MMMM yyyy")}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        (Income: ${salaryForThisMonth.toFixed(2)} | Expenses: ${totalExpensesThisMonth.toFixed(2)})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {paymentsForThisMonth.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">No payments this month.</p>
                    ) : (
                      <ul className="space-y-2">
                        {paymentsForThisMonth.map((payment) => (
                          <li key={`${payment.id}-${payment.instanceDate}`} className="text-sm p-2 border-b last:border-b-0 flex justify-between items-center hover:bg-muted/30 rounded">
                            <div>
                              <span className="font-medium">{payment.name}</span>
                              {payment.categoryName && (
                                <span className="ml-2 text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-full inline-flex items-center">
                                  <Tag className="h-3 w-3 mr-1"/>{payment.categoryName}
                                </span>
                              )}
                              {payment.isInstance && payment.installmentNumber && payment.totalInstallments && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (Inst. {payment.installmentNumber}/{payment.totalInstallments})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                               <span className={`font-semibold ${payment.isPaidInMonth ? 'text-green-600' : 'text-red-600'}`}>
                                ${payment.amount.toFixed(2)}
                               </span>
                               {payment.isPaidInMonth && <CheckCircle className="h-4 w-4 ml-1 text-green-500" />}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4 p-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Minimal CheckCircle icon for use within the component to avoid circular dependencies or large imports
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
