"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface MonthNavigatorProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function MonthNavigator({ currentDate, setCurrentDate }: MonthNavigatorProps) {
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-primary">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
