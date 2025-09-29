"use client";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar";

interface RangeDatePickerProps {
  onDateChange?: (range: DateRange) => void;
  selectedRange?: DateRange;
  className?: string;
}

export function RangeDatePicker({
  onDateChange,
  selectedRange,
  className,
}: RangeDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>(
    selectedRange ?? {
      from: new Date(),
      to: addDays(new Date(), 7),
    }
  );

  React.useEffect(() => {
    if (selectedRange) setDate(selectedRange);
  }, [selectedRange]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range && onDateChange) onDateChange(range);
  };

  const getDateText = (date: DateRange | undefined) => {
    if (!date || !date.from) return "Pilih Tanggal";
    if (!date.to) return date.from.toLocaleDateString("id-ID");
    return `${date.from.toLocaleDateString(
      "id-ID"
    )} - ${date.to.toLocaleDateString("id-ID")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={ `w-48 justify-between font-normal bg-navy-200 text-white hover:text-white hover:bg-navy-500 ${className ?? ""}`}
        >
          {getDateText(date)}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          numberOfMonths={2}
          selected={date}
          onSelect={handleSelect}
          className="rounded-lg border shadow-sm text-xs md:text-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
