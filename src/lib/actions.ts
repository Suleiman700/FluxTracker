
'use server';

import fs from 'fs/promises';
import { DATA_FILE_PATH } from '@/lib/config';
import type { AppData, Payment, Category } from '@/lib/types';
import { revalidatePath } from 'next/cache';
// import { format } from 'date-fns'; // No longer needed here

async function readData(): Promise<AppData> {
  try {
    await fs.access(DATA_FILE_PATH);
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    let parsedData = JSON.parse(fileContent) as any;

    // Migrate monthlySalaries if old structure
    if (typeof parsedData.monthlySalaries === 'undefined') {
      parsedData.monthlySalaries = {};
      if (typeof parsedData.salary === 'number') {
        const defaultMonthKey = "2025-05"; 
        parsedData.monthlySalaries[defaultMonthKey] = parsedData.salary;
      }
    }
    if (parsedData.hasOwnProperty('salary')) {
      delete parsedData.salary;
    }

    // Ensure payments array exists
    if (!parsedData.payments) {
        parsedData.payments = [];
    }
    
    // Ensure categories array exists
    if (!parsedData.categories) {
        parsedData.categories = [];
    }

    return parsedData as AppData;

  } catch (error) {
    console.warn(`Data file not found or error reading. Initializing with default. Error: ${error}`);
    const defaultData: AppData = { monthlySalaries: {}, payments: [], categories: [] };
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(defaultData, null, 2));
    } catch (writeError) {
      console.error(`Failed to write initial data file: ${writeError}`);
    }
    return defaultData;
  }
}

async function writeData(data: AppData): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    revalidatePath('/'); 
  } catch (error) {
    console.error(`Failed to write data: ${error}`);
    throw new Error('Failed to save data.');
  }
}

export async function getAppData(): Promise<AppData> {
  return readData();
}

// --- Salary Actions ---
export async function updateMonthlySalary(monthYear: string, newSalary: number): Promise<AppData> {
  const data = await readData();
  if (!data.monthlySalaries) {
    data.monthlySalaries = {};
  }
  data.monthlySalaries[monthYear] = newSalary;
  await writeData(data);
  return data;
}

// --- Payment Actions ---
export async function addPayment(newPayment: Omit<Payment, 'id'>): Promise<AppData> {
  const data = await readData();
  const paymentWithId: Payment = { ...newPayment, id: crypto.randomUUID() };
  data.payments.push(paymentWithId);
  await writeData(data);
  return data;
}

export async function updatePayment(paymentId: string, updatedPaymentData: Partial<Omit<Payment, 'id'>>): Promise<AppData> {
  const data = await readData();
  const paymentIndex = data.payments.findIndex(p => p.id === paymentId);
  if (paymentIndex === -1) {
    throw new Error('Payment not found.');
  }
  data.payments[paymentIndex] = { ...data.payments[paymentIndex], ...updatedPaymentData };
  await writeData(data);
  return data;
}

export async function deletePayment(paymentId: string): Promise<AppData> {
  const data = await readData();
  data.payments = data.payments.filter(p => p.id !== paymentId);
  await writeData(data);
  return data;
}

export async function togglePaymentPaidStatus(
  paymentId: string,
  paid: boolean,
  instanceDate?: string 
): Promise<AppData> {
  const data = await readData();
  const paymentIndex = data.payments.findIndex(p => p.id === paymentId);

  if (paymentIndex === -1) {
    throw new Error('Payment not found.');
  }

  const payment = data.payments[paymentIndex];

  if (payment.isRecurring && instanceDate) {
    if (!payment.paidInstallments) {
      payment.paidInstallments = {};
    }
    payment.paidInstallments[instanceDate] = paid;
  } else if (!payment.isRecurring) {
    payment.paid = paid;
  } else {
    throw new Error('Instance date required for recurring payment.');
  }
  
  data.payments[paymentIndex] = payment;
  await writeData(data);
  return data;
}

// --- Category Actions ---
export async function addCategory(name: string): Promise<AppData> {
  const data = await readData();
  if (data.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('Category with this name already exists.');
  }
  const newCategory: Category = { id: crypto.randomUUID(), name };
  data.categories.push(newCategory);
  await writeData(data);
  return data;
}

export async function updateCategory(id: string, newName: string): Promise<AppData> {
  const data = await readData();
  const categoryIndex = data.categories.findIndex(c => c.id === id);
  if (categoryIndex === -1) {
    throw new Error('Category not found.');
  }
  if (data.categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== id)) {
    throw new Error('Another category with this name already exists.');
  }
  data.categories[categoryIndex].name = newName;
  await writeData(data);
  return data;
}

export async function deleteCategory(id: string): Promise<AppData> {
  const data = await readData();
  data.categories = data.categories.filter(c => c.id !== id);
  // Set categoryId to undefined for payments using this category
  data.payments = data.payments.map(p => {
    if (p.categoryId === id) {
      return { ...p, categoryId: undefined };
    }
    return p;
  });
  await writeData(data);
  return data;
}
