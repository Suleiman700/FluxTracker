
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { DisplayPayment, Category } from "@/lib/types";
import { BarChart2 } from "lucide-react";

interface SpendingByCategoryChartProps {
  paymentsForMonth: DisplayPayment[];
  categories: Category[];
}

interface ChartDataPoint {
  name: string; // Category name
  total: number; // Total amount spent
  fill: string; // Color for the bar
}

// Using the chart color palette from globals.css
const chartColorPalette = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  // Add more if you expect more categories frequently, or cycle through them
  "hsl(var(--primary))", 
  "hsl(var(--accent))",
];

export function SpendingByCategoryChart({ paymentsForMonth, categories }: SpendingByCategoryChartProps) {
  const chartData = useMemo(() => {
    const spending: { [categoryIdOrUncategorized: string]: { name: string; total: number } } = {};

    paymentsForMonth.forEach(payment => {
      if (payment.isPaidInMonth) { // Only include paid expenses
        const categoryId = payment.categoryId || "uncategorized";
        const categoryName = payment.categoryName || "Uncategorized";

        if (!spending[categoryId]) {
          spending[categoryId] = { name: categoryName, total: 0 };
        }
        spending[categoryId].total += payment.amount;
      }
    });

    return Object.values(spending)
      .map((item, index) => ({
        ...item,
        fill: chartColorPalette[index % chartColorPalette.length],
      }))
      .sort((a, b) => b.total - a.total); // Sort by highest spending
  }, [paymentsForMonth, categories]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
     chartData.forEach(item => {
      config[item.name] = { // Use category name as key for config
        label: item.name,
        color: item.fill, 
      };
    });
    // Generic config for the 'total' datakey in the Bar, though color is per-cell
    config.total = { 
        label: "Spent ($)",
    };
    return config;
  }, [chartData]);


  if (chartData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center"><BarChart2 className="mr-2 h-5 w-5" />Spending by Category</CardTitle>
          <CardDescription>Monthly spending distribution.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No paid expenses with categories this month to display in chart.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center"><BarChart2 className="mr-2 h-5 w-5" />Spending by Category</CardTitle>
        <CardDescription>Visual breakdown of your paid expenses by category for the current month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 35)}> {/* Dynamic height */}
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" dataKey="total" tickFormatter={(value) => `$${value.toFixed(0)}`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                stroke="hsl(var(--muted-foreground))"
                width={120} // Increased width for category names
                interval={0} // Show all labels
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                // props.payload contains the original data point {name, total, fill}
                                return (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{props.payload.name}</span>
                                        <span>Spent: ${Number(value).toFixed(2)}</span>
                                    </div>
                                );
                            }}
                         />}
              />
              <Bar dataKey="total" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} name={entry.name} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

