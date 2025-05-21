
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileJson, Loader2, AlertTriangle, Tag, CalendarRange } from "lucide-react";
import { MonthNavigator } from "./MonthNavigator";
import { SalaryInput } from "./SalaryInput";
import { FinancialSummary } from "./FinancialSummary";
import { PaymentList } from "./PaymentList";
import { PaymentForm } from "./PaymentForm";
import { BudgetTips } from "./BudgetTips";
import { CategoryManagerDialog } from "./CategoryManagerDialog";
import { MultiMonthViewDialog } from "./MultiMonthViewDialog";
import { SpendingByCategoryChart } from "./SpendingByCategoryChart"; // Added import
import type { AppData, Payment, DisplayPayment, Category } from "@/lib/types";
import { 
  getAppData, 
  updateMonthlySalary, 
  addPayment, 
  updatePayment, 
  togglePaymentPaidStatus, 
  deletePayment,
  addCategory,
  updateCategory,
  deleteCategory
} from "@/lib/actions";
import { getPaymentsForMonth } from "@/lib/paymentUtils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function FluxTrackerDashboard() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<DisplayPayment | undefined>(undefined);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isMultiMonthViewOpen, setIsMultiMonthViewOpen] = useState(false);
  const { toast } = useToast();

  const fetchAppData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAppData();
      setAppData(data);
    } catch (e) {
      console.error("Failed to fetch app data:", e);
      setError("Could not load financial data. Please try again later.");
      toast({ title: "Error Loading Data", description: "Failed to fetch financial data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAppData();
  }, [fetchAppData]);

  const currentMonthYear = useMemo(() => format(currentDate, 'yyyy-MM'), [currentDate]);

  const salaryForCurrentMonth = useMemo(() => {
    if (appData && appData.monthlySalaries) {
      return appData.monthlySalaries[currentMonthYear] || 0;
    }
    return 0;
  }, [appData, currentMonthYear]);

  const paymentsForCurrentMonth = useMemo(() => {
    if (!appData) return [];
    return getPaymentsForMonth(appData.payments, currentDate, appData.categories || []);
  }, [appData, currentDate]);

  const handleMonthlySalaryUpdate = async (monthYear: string, newSalary: number) => {
    if (!appData) return;
    try {
      const updatedData = await updateMonthlySalary(monthYear, newSalary);
      setAppData(updatedData);
    } catch (e) {
      toast({ title: "Update Failed", description: "Could not update salary.", variant: "destructive" });
      throw e; 
    }
  };

  const handlePaymentFormSubmit = async (paymentData: Omit<Payment, 'id' | 'paidInstallments' | 'paid'>) => {
    try {
      let updatedData;
      if (editingPayment) {
        const paymentToUpdate = appData?.payments.find(p => p.id === editingPayment.id);
        if (!paymentToUpdate) throw new Error("Original payment not found for editing.");
        
        updatedData = await updatePayment(editingPayment.id, paymentData); // Pass paymentData directly
        toast({ title: "Payment Updated", description: `${paymentData.name} has been successfully updated.` });
      } else {
        updatedData = await addPayment(paymentData);
        toast({ title: "Payment Added", description: `${paymentData.name} has been successfully added.` });
      }
      setAppData(updatedData);
      setIsPaymentFormOpen(false);
      setEditingPayment(undefined);
    } catch (e) {
      console.error("Payment form submit error:", e);
      toast({ title: "Operation Failed", description: (e as Error).message || "Could not save payment details.", variant: "destructive" });
    }
  };

  const handleEditPayment = (payment: DisplayPayment) => {
    setEditingPayment(payment);
    setIsPaymentFormOpen(true);
  };
  
  const handleTogglePaid = async (paymentId: string, paid: boolean, instanceDate?: string) => {
    try {
      const updatedData = await togglePaymentPaidStatus(paymentId, paid, instanceDate);
      setAppData(updatedData);
      toast({ title: "Status Updated", description: `Payment marked as ${paid ? 'paid' : 'unpaid'}.` });
    } catch (e) {
      toast({ title: "Update Failed", description: "Could not update payment status.", variant: "destructive" });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const paymentToDelete = appData?.payments.find(p => p.id === paymentId);
      if (!paymentToDelete) return;

      const updatedData = await deletePayment(paymentId);
      setAppData(updatedData);
      toast({ title: "Payment Deleted", description: `${paymentToDelete.name} has been successfully deleted.` });
    } catch (e) {
       toast({ title: "Delete Failed", description: "Could not delete payment.", variant: "destructive" });
    }
  };

  const openAddPaymentForm = () => {
    setEditingPayment(undefined);
    setIsPaymentFormOpen(true);
  };

  const handleExportData = () => {
    if (!appData) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(appData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "fluxtracker-data.json";
    link.click();
    toast({ title: "Data Exported", description: "Your financial data has been downloaded." });
  };

  // Category Actions
  const handleAddCategory = async (name: string) => {
    const updatedData = await addCategory(name);
    setAppData(updatedData);
  };
  const handleUpdateCategory = async (id: string, newName: string) => {
    const updatedData = await updateCategory(id, newName);
    setAppData(updatedData);
  };
  const handleDeleteCategory = async (id: string) => {
    const updatedData = await deleteCategory(id);
    setAppData(updatedData);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your financial dashboard...</p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-2">{error || "An unknown error occurred."}</p>
        <Button onClick={fetchAppData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">FluxTracker</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
           <Button variant="outline" onClick={() => setIsMultiMonthViewOpen(true)} className="w-full sm:w-auto">
            <CalendarRange className="mr-2 h-4 w-4" /> View Timeline
          </Button>
          <MonthNavigator currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Settings & Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4"> {/* Reduced space-y-6 to space-y-4 */}
            <SalaryInput 
              salaryForCurrentMonth={salaryForCurrentMonth} 
              currentMonthYear={currentMonthYear}
              onSalaryUpdate={handleMonthlySalaryUpdate} 
            />
            <BudgetTips 
              monthlyIncome={salaryForCurrentMonth} 
              paymentsForMonth={paymentsForCurrentMonth} 
              categories={appData.categories || []} 
            />
            <Button variant="outline" onClick={() => setIsCategoryManagerOpen(true)} className="w-full">
              <Tag className="mr-2 h-4 w-4" /> Manage Categories
            </Button>
            <Button variant="outline" onClick={handleExportData} className="w-full">
              <FileJson className="mr-2 h-4 w-4" /> Export Data as JSON
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <FinancialSummary salary={salaryForCurrentMonth} paymentsForMonth={paymentsForCurrentMonth} />
          
          {/*<SpendingByCategoryChart */}
          {/*  paymentsForMonth={paymentsForCurrentMonth}*/}
          {/*  categories={appData.categories || []}*/}
          {/*/>*/}

          <div className="flex justify-end">
            <Button onClick={openAddPaymentForm} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Payment
            </Button>
          </div>

          <PaymentList 
            paymentsForMonth={paymentsForCurrentMonth} 
            onEditPayment={handleEditPayment}
            onTogglePaid={handleTogglePaid}
            onDeletePayment={handleDeletePayment}
          />
        </div>
      </div>

      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => { setIsPaymentFormOpen(false); setEditingPayment(undefined); }}
        onSubmit={handlePaymentFormSubmit}
        initialData={editingPayment ? appData.payments.find(p => p.id === editingPayment.id) : undefined}
        categories={appData.categories || []}
      />
      <CategoryManagerDialog
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={appData.categories || []}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
       <MultiMonthViewDialog
        isOpen={isMultiMonthViewOpen}
        onClose={() => setIsMultiMonthViewOpen(false)}
        appData={appData}
        currentDashboardDate={currentDate}
      />
    </div>
  );
}

