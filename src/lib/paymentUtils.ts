
import { addMonths, format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getDate as getDayOfMonth } from 'date-fns';
import type { Payment, DisplayPayment, Category } from '@/lib/types';

export function getPaymentsForMonth(allPayments: Payment[], currentDate: Date, categories: Category[]): DisplayPayment[] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const displayPayments: DisplayPayment[] = [];

  const getCategoryName = (categoryId?: string): string | undefined => {
    if (!categoryId) return undefined;
    return categories.find(cat => cat.id === categoryId)?.name;
  };

  allPayments.forEach(payment => {
    const categoryName = getCategoryName(payment.categoryId);
    if (payment.isRecurring && payment.recurrence) {
      const startDate = parseISO(payment.date);
      const originalDay = getDayOfMonth(startDate); // Day of the month (1-31)
      
      for (let i = 0; i < payment.recurrence.installments; i++) {
        let installmentBaseDate = addMonths(startDate, i);
        
        // Adjust day of month to match original start date's day, if possible
        const daysInInstallmentMonth = getDayOfMonth(endOfMonth(installmentBaseDate));
        const targetDay = Math.min(originalDay, daysInInstallmentMonth);
        const installmentDate = new Date(installmentBaseDate.getFullYear(), installmentBaseDate.getMonth(), targetDay);

        if (isWithinInterval(installmentDate, { start: monthStart, end: monthEnd })) {
          const installmentDateString = format(installmentDate, 'yyyy-MM-dd');
          displayPayments.push({
            ...payment,
            instanceDate: installmentDateString,
            isInstance: true,
            installmentNumber: i + 1,
            totalInstallments: payment.recurrence.installments,
            isPaidInMonth: payment.paidInstallments?.[installmentDateString] ?? false,
            categoryName,
          });
        }
      }
    } else {
      // One-time payment
      const paymentDate = parseISO(payment.date);
      if (isWithinInterval(paymentDate, { start: monthStart, end: monthEnd })) {
        displayPayments.push({
          ...payment,
          instanceDate: payment.date,
          isPaidInMonth: payment.paid ?? false,
          categoryName,
        });
      }
    }
  });

  return displayPayments.sort((a, b) => getDayOfMonth(parseISO(a.instanceDate)) - getDayOfMonth(parseISO(b.instanceDate)));
}

export function generateRecurringPaymentDates(payment: Payment): string[] {
  if (!payment.isRecurring || !payment.recurrence) return [];
  const dates: string[] = [];
  const startDate = parseISO(payment.date);
  const originalDay = getDayOfMonth(startDate);

  for (let i = 0; i < payment.recurrence.installments; i++) {
    const installmentBaseDate = addMonths(startDate, i);
    const daysInMonth = getDayOfMonth(endOfMonth(installmentBaseDate));
    const targetDay = Math.min(originalDay, daysInMonth);
    dates.push(format(new Date(installmentBaseDate.getFullYear(), installmentBaseDate.getMonth(), targetDay), 'yyyy-MM-dd'));
  }
  return dates;
}
