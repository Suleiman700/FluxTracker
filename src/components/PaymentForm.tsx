
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Payment, Category } from "@/lib/types";
import { useEffect } from "react";
import { CalendarIcon, Save, Tag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const paymentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.date({ required_error: "Payment date is required." }),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(["monthly"]).optional(),
  recurrenceInstallments: z.coerce.number().int().positive().optional(),
  categoryId: z.string().optional(),
}).refine(data => {
  if (data.isRecurring) {
    return data.recurrenceFrequency && data.recurrenceInstallments && data.recurrenceInstallments > 0;
  }
  return true;
}, {
  message: "Recurring payments require frequency and number of installments.",
  path: ["recurrenceInstallments"], 
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Payment, 'id' | 'paidInstallments' | 'paid'>) => Promise<void>;
  initialData?: Payment;
  categories: Category[];
  currentDashboardDate?: Date; // To set default date for new payments
}

export function PaymentForm({ isOpen, onClose, onSubmit, initialData, categories, currentDashboardDate }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      name: "",
      amount: 0,
      description: "",
      date: currentDashboardDate || new Date(), // Initial default
      isRecurring: false,
      categoryId: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) { // Only reset when dialog opens or initialData/currentDashboardDate changes while open
      if (initialData) {
        form.reset({
          name: initialData.name,
          amount: initialData.amount,
          description: initialData.description || "",
          date: parseISO(initialData.date),
          isRecurring: initialData.isRecurring,
          recurrenceFrequency: initialData.recurrence?.frequency,
          recurrenceInstallments: initialData.recurrence?.installments,
          categoryId: initialData.categoryId,
        });
      } else {
        form.reset({
          name: "",
          amount: 0,
          description: "",
          date: currentDashboardDate || new Date(), // Default to current viewed month or today
          isRecurring: false,
          recurrenceFrequency: "monthly",
          recurrenceInstallments: undefined,
          categoryId: undefined,
        });
      }
    }
  }, [initialData, form, isOpen, currentDashboardDate]);


  const isRecurring = form.watch("isRecurring");

  const handleSubmit = async (data: PaymentFormData) => {
    const paymentData: Omit<Payment, 'id' | 'paidInstallments' | 'paid'> = {
      name: data.name,
      amount: data.amount,
      description: data.description,
      date: format(data.date, "yyyy-MM-dd"),
      isRecurring: data.isRecurring,
      categoryId: data.categoryId,
      ...(data.isRecurring && data.recurrenceFrequency && data.recurrenceInstallments && {
        recurrence: {
          frequency: data.recurrenceFrequency,
          installments: data.recurrenceInstallments,
        },
      }),
    };
    await onSubmit(paymentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px] bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{initialData ? "Edit Payment" : "Add New Payment"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update the details of your payment." : "Enter the details for your new payment."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <ScrollArea className="max-h-[70vh] p-4 -mx-4"> 
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6"> 
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rent, Groceries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{isRecurring ? "Start Date" : "Payment Date"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                          defaultMonth={field.value} // Ensures calendar opens to selected month
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {categories.length > 0 && (
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UNCATEGORIZED_PLACEHOLDER_NO_CATEGORY_ID_VALUE"><em>Uncategorized</em></SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Monthly rent payment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isRecurring"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="isRecurring" className="font-medium">
                        Is this a recurring payment?
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
              {isRecurring && (
                <div className="space-y-4 p-4 border rounded-md bg-secondary/30">
                  <FormField
                    control={form.control}
                    name="recurrenceFrequency"
                    render={({ field }) => ( (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Input value="Monthly" disabled readOnly />
                        <FormMessage />
                      </FormItem>
                    ))}
                  />
                  <FormField
                    control={form.control}
                    name="recurrenceInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Installments</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" placeholder="e.g., 12 for 12 months" {...field} 
                           onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> {initialData ? "Save Changes" : "Add Payment"}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
