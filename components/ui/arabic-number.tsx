"use client";

import React from "react";
import { useRTL } from "@/lib/rtl-context";

interface ArabicNumberProps {
  value: number;
  currency?: boolean;
  precision?: number;
  compact?: boolean;
  className?: string;
  currencyCode?: string; // "SAR", "USD", etc.
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
}

/**
 * Arabic Number Component
 * مكون متخصص لعرض الأرقام بتنسيق عربي مع دعم كامل للـ RTL وخيارات تنسيق العملة
 */
export function ArabicNumber({
  value,
  currency = false,
  precision = 0,
  compact = false,
  className = "",
  currencyCode = "SAR",
  currencyDisplay = "narrowSymbol"
}: ArabicNumberProps) {
  const { isRTL } = useRTL();
  const locale = isRTL ? "ar-SA" : "en-US";

  // عند تعذر الوصول لقيمة عددية، نعرض صفر
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  const getFormattedNumber = () => {
    const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: precision
    };

    if (compact) {
      options.notation = "compact";
    }

    if (currency) {
      options.style = "currency";
      options.currency = currencyCode;
      options.currencyDisplay = currencyDisplay;
    }

    return new Intl.NumberFormat(locale, options).format(safeValue);
  };

  return <span className={className}>{getFormattedNumber()}</span>;
}

/**
 * Format Price
 * دالة مساعدة للحصول على سلسلة نصية منسقة للأسعار بالتنسيق العربي
 * دون الحاجة لرندر مكون
 */
export function formatPrice(
  value: number, 
  currencyCode = "SAR", 
  locale = "ar-SA", 
  precision = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: precision,
    currencyDisplay: "narrowSymbol"
  }).format(value);
}

/**
 * Format Number
 * دالة مساعدة للحصول على سلسلة نصية منسقة للأرقام بالتنسيق العربي
 * دون الحاجة لرندر مكون
 */
export function formatNumber(
  value: number, 
  locale = "ar-SA", 
  precision = 0, 
  compact = false
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: precision,
    notation: compact ? "compact" : "standard"
  }).format(value);
}