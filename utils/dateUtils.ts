import {
  format,
  differenceInDays,
  parseISO,
  isAfter,
  isBefore,
  addDays,
} from "date-fns";

export const formatDate = (
  date: string | Date,
  formatStr: string = "MMM dd, yyyy"
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const calculateDays = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
  return differenceInDays(end, start) + 1;
};

export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const checkDate = typeof date === "string" ? parseISO(date) : date;
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
  return (
    (isAfter(checkDate, start) || checkDate.getTime() === start.getTime()) &&
    (isBefore(checkDate, end) || checkDate.getTime() === end.getTime())
  );
};

export const getNextBusinessDay = (date: Date): Date => {
  let nextDay = addDays(date, 1);
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};
