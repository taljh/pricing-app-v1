/**
 * مساعدات التنسيق للحاسبة
 * أدوات مساعدة لتنسيق الأرقام والعملات بالشكل المناسب للغة العربية
 */

/**
 * تنسيق الرقم بالعملة (الريال)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * تنسيق الرقم كنسبة مئوية
 */
export function formatPercent(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount / 100);
}

/**
 * تقريب الرقم لأقرب 5 ريالات
 */
export function roundToNearest5(amount: number): number {
  return Math.ceil(amount / 5) * 5;
}

/**
 * تنسيق رقم عادي
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('ar-SA').format(amount);
}

/**
 * حساب النسبة المئوية
 */
export function calculatePercentage(amount: number, total: number): number {
  if (total === 0) return 0;
  return (amount / total) * 100;
}

/**
 * تقريب رقم لعدد معين من الخانات العشرية
 */
export function roundToDecimal(amount: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}