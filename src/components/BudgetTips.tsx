
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, AlertCircle } from "lucide-react";
import { suggestBudgetAdjustments, SuggestBudgetAdjustmentsInput, SuggestBudgetAdjustmentsOutput } from "@/ai/flows/suggest-budget-adjustments";
import type { DisplayPayment, SpendingByCategory, Category } from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";

interface BudgetTipsProps {
  monthlyIncome: number; 
  paymentsForMonth: DisplayPayment[];
  categories: Category[]; // Added categories
}

export function BudgetTips({ monthlyIncome, paymentsForMonth, categories }: BudgetTipsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<SuggestBudgetAdjustmentsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGetTips = async () => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    const paidExpenses = paymentsForMonth.filter(p => p.isPaidInMonth);
    const totalExpenses = paidExpenses.reduce((sum, p) => sum + p.amount, 0);

    const spendingByCategory: SpendingByCategory = paidExpenses.reduce((acc, payment) => {
      const categoryName = payment.categoryName || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + payment.amount;
      return acc;
    }, {} as SpendingByCategory);

    const input: SuggestBudgetAdjustmentsInput = {
      monthlyIncome,
      totalExpenses,
      spendingByCategory,
    };

    try {
      const response = await suggestBudgetAdjustments(input);
      setAiResponse(response);
    } catch (e) {
      console.error("Error getting budget tips:", e);
      setError("Failed to get budget tips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
          onClick={() => {
             setIsDialogOpen(true);
             if (!aiResponse && !isLoading && !error && monthlyIncome > 0) handleGetTips();
          }}
          disabled={monthlyIncome <= 0} 
        >
          <Lightbulb className="mr-2 h-4 w-4" /> AI Budget Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary flex items-center"><Lightbulb className="mr-2"/>AI Budget Insights</DialogTitle>
          <DialogDescription>
            Personalized suggestions to help you manage your finances better for the selected month.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] p-1">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="ml-2">Analyzing your budget...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {aiResponse && !isLoading && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">Summary:</h3>
                <p className="text-sm text-muted-foreground">{aiResponse.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-foreground">Suggestions:</h3>
                {aiResponse.suggestions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {aiResponse.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific suggestions at this time. Your budget looks well-managed or there isn't enough data for specific advice.</p>
                )}
              </div>
            </div>
          )}
          {!isLoading && !error && !aiResponse && monthlyIncome <= 0 && (
             <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Set Income</AlertTitle>
                <AlertDescription>Please set your monthly income to get personalized budget tips.</AlertDescription>
              </Alert>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Close</Button>
           {!isLoading && (error || aiResponse || monthlyIncome > 0) && (
             <Button onClick={handleGetTips} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={monthlyIncome <= 0}>
               <Lightbulb className="mr-2 h-4 w-4" /> Regenerate Tips
             </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
