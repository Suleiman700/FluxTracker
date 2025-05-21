
"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DollarSign, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";


interface SalaryInputProps {
  salaryForCurrentMonth: number;
  currentMonthYear: string; // YYYY-MM
  onSalaryUpdate: (monthYear: string, newSalary: number) => Promise<void>;
}

export function SalaryInput({ salaryForCurrentMonth, currentMonthYear, onSalaryUpdate }: SalaryInputProps) {
  const [salary, setSalary] = useState<string>(salaryForCurrentMonth.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSalary(salaryForCurrentMonth.toString());
  }, [salaryForCurrentMonth, currentMonthYear]);

  const handleSave = async () => {
    const newSalary = parseFloat(salary);
    if (isNaN(newSalary) || newSalary < 0) {
      toast({
        title: "Invalid Salary",
        description: "Please enter a valid positive number for salary.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await onSalaryUpdate(currentMonthYear, newSalary);
      const displayMonth = format(parse(currentMonthYear, 'yyyy-MM', new Date()), 'MMMM yyyy');
      toast({
        title: "Salary Updated",
        description: `Monthly salary for ${displayMonth} set to $${newSalary.toFixed(2)}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update salary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const displayMonthLabel = useMemo(() => {
    try {
      return format(parse(currentMonthYear, 'yyyy-MM', new Date()), 'MMMM yyyy');
    } catch (e) {
      return "Selected Month"; // Fallback
    }
  }, [currentMonthYear]);

  return (
    <div className="space-y-2">
      <Label htmlFor="salary" className="text-sm font-medium">
        Monthly Salary ({displayMonthLabel})
      </Label>
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <Input
          id="salary"
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Enter salary for this month"
          className="flex-grow"
          aria-label={`Monthly salary for ${displayMonthLabel}`}
        />
      </div>
       <Button onClick={handleSave} disabled={isLoading} className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save className="mr-2 h-4 w-4" /> {isLoading ? "Saving..." : "Set Salary"}
        </Button>
    </div>
  );
}

