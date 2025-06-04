import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatCardNumber(value: string): string {
  if (value === "1" || value === "2" || value === "3") {
    return value;
  }

  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
}

export function formatExpiryDate(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

  if (v.length >= 2) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }

  return v;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-.()+]+$/;
  const digitsOnly = phone.replace(/\D/g, "");
  return phoneRegex.test(phone) && digitsOnly.length === 10;
}

export function isValidCardNumber(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s+/g, "");
  if (sanitized === "1" || sanitized === "2" || sanitized === "3") {
    return true;
  }
  return /^\d{16}$/.test(sanitized);
}

export function isValidExpiryDate(expiryDate: string): boolean {
  const [month, year] = expiryDate.split("/");

  if (!month || !year || month.length !== 2 || year.length !== 2) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = Number.parseInt(month, 10);
  const expYear = Number.parseInt(year, 10);

  if (expMonth < 1 || expMonth > 12) {
    return false;
  }

  if (
    expYear < currentYear ||
    (expYear === currentYear && expMonth < currentMonth)
  ) {
    return false;
  }

  return true;
}

export function isValidCVV(cvv: string): boolean {
  return /^\d{3}$/.test(cvv);
}

export function isValidZipCode(zipCode: string): boolean {
  return /^\d{5,7}$/.test(zipCode);
}
