"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { AlertCircle, Percent, TrendingDown, DollarSign } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface DiscountAnalysisCardProps {
  basePrice: number
  directCosts: number
  marketingCost: number
  profitMargin: number
  fixedCostsPerUnit: number
}

export default function DiscountAnalysisCard({
  basePrice,
  directCosts,
  marketingCost,
  profitMargin,
  fixedCostsPerUnit,
}: DiscountAnalysisCardProps) {
  // إجمالي التكاليف مع هامش الربح
  const totalCosts = useMemo(() => {
    return directCosts + marketingCost + fixedCostsPerUnit
  }, [directCosts, marketingCost, fixedCostsPerUnit])

  // قيمة هامش الربح الفعلية
  const profitAmount = useMemo(() => {
    return basePrice - totalCosts
  }, [basePrice, totalCosts])

  // نسبة هامش الربح الفعلية
  const actualProfitMargin = useMemo(() => {
    return (profitAmount / basePrice) * 100
  }, [profitAmount, basePrice])

  // حساب أقصى نسبة خصم ممكنة قبل الخسارة
  const maxDiscountBeforeLoss = useMemo(() => {
    const breakEvenPoint = totalCosts
    const maxDiscountAmount = basePrice - breakEvenPoint
    return (maxDiscountAmount / basePrice) * 100
  }, [basePrice, totalCosts])

  // نسبة الخصم المثالية (مع الحفاظ على هامش ربح معقول)
  const idealDiscount = useMemo(() => {
    // نسبة الخصم التي تبقي على نصف الربح الأصلي
    const halfProfitMargin = actualProfitMargin / 2
    const idealDiscountPercent = maxDiscountBeforeLoss - halfProfitMargin
    return Math.max(0, Math.min(40, idealDiscountPercent)) // لا تتجاوز 40% كحد أقصى
  }, [actualProfitMargin, maxDiscountBeforeLoss])

  // حساب أقصى تكلفة استحواذ للعميل (CAC)
  const maxCAC = useMemo(() => {
    // أقصى تكلفة استحواذ للعميل = هامش الربح الإجمالي للطلب الواحد
    return profitAmount
  }, [profitAmount])

  // حساب نقطة التعادل للإعلان
  const advertisingBreakEven = useMemo(() => {
    // نسبة تحويل متوسطة (افتراضية 3%)
    const avgConversionRate = 0.03
    // تكلفة الاستحواذ المقبولة مقسومة على نسبة التحويل = أقصى تكلفة نقرة يمكن دفعها
    return maxCAC * avgConversionRate
  }, [maxCAC])

  // حساب السعر المقترح بعد الخصم
  const suggestedDiscountedPrice = useMemo(() => {
    return basePrice * (1 - idealDiscount / 100)
  }, [basePrice, idealDiscount])

  // حالة قابلية التخفيض
  const discountStatus = useMemo(() => {
    if (maxDiscountBeforeLoss < 10) return "ضعيفة"
    if (maxDiscountBeforeLoss < 20) return "متوسطة"
    if (maxDiscountBeforeLoss < 30) return "جيدة"
    return "ممتازة"
  }, [maxDiscountBeforeLoss])

  const discountStatusColor = useMemo(() => {
    switch (discountStatus) {
      case "ضعيفة":
        return "bg-red-100 text-red-800 border-red-200"
      case "متوسطة":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "جيدة":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ممتازة":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }, [discountStatus])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-2 border-indigo-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-6 py-5 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              تحليل الخصومات والربحية
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">تحليل شامل لأقصى خصم ممكن وتكلفة الاستحواذ المثالية</p>
          </div>
          <Badge className={`${discountStatusColor} px-3 py-1.5 text-xs rounded-full`}>
            قابلية التخفيض: {discountStatus}
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* قسم نسب الخصم */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-600" />
              تحليل الخصومات
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 mb-1.5">أقصى نسبة خصم قبل الخسارة</p>
                <p className="text-2xl font-bold text-blue-700">{maxDiscountBeforeLoss.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 mt-1">
                  {basePrice * parseFloat((maxDiscountBeforeLoss / 100).toFixed(2))} ريال كحد أقصى
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <p className="text-sm text-gray-600 mb-1.5">نسبة الخصم المثالية</p>
                <p className="text-2xl font-bold text-emerald-700">{idealDiscount.toFixed(1)}%</p>
                <p className="text-xs text-emerald-600 mt-1">
                  السعر بعد الخصم: {suggestedDiscountedPrice.toFixed(2)} ريال
                </p>
              </div>

              <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
                <p className="text-sm text-gray-600 mb-1.5">هامش الربح الفعلي</p>
                <p className="text-2xl font-bold text-violet-700">{actualProfitMargin.toFixed(1)}%</p>
                <p className="text-xs text-violet-600 mt-1">{profitAmount.toFixed(2)} ريال لكل وحدة</p>
              </div>
            </div>

            {/* مقياس الخصومات */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>0%</span>
                <span>نسبة الخصم المثالية</span>
                <span>نقطة التعادل</span>
                <span>100%</span>
              </div>
              <div className="h-6 w-full bg-gray-100 rounded-full relative">
                {/* شريط نسبة الخصم المثالية */}
                <div
                  className="absolute h-full bg-emerald-500 rounded-l-full"
                  style={{ width: `${idealDiscount}%` }}
                ></div>
                {/* شريط أقصى نسبة خصم قبل الخسارة */}
                <div
                  className="absolute h-full bg-blue-500 rounded-l-full border-r-2 border-white"
                  style={{ width: `${maxDiscountBeforeLoss}%` }}
                ></div>

                {/* مؤشرات على المقياس */}
                <div
                  className="absolute top-full mt-1 -ml-1 text-xs text-emerald-600 font-medium"
                  style={{ left: `${idealDiscount}%` }}
                >
                  {idealDiscount.toFixed(1)}%
                </div>
                <div
                  className="absolute top-full mt-1 -ml-1 text-xs text-blue-600 font-medium"
                  style={{ left: `${maxDiscountBeforeLoss}%` }}
                >
                  {maxDiscountBeforeLoss.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* قسم تكلفة الاستحواذ */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              تكلفة الاستحواذ على العملاء
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-gray-600 mb-1.5">أقصى تكلفة استحواذ للعميل (CAC)</p>
                <p className="text-2xl font-bold text-amber-700">{maxCAC.toFixed(2)} ريال</p>
                <p className="text-xs text-amber-600 mt-1">الحد الأقصى المقبول لتكلفة استقطاب عميل جديد</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                <p className="text-sm text-gray-600 mb-1.5">تكلفة النقرة المقبولة</p>
                <p className="text-2xl font-bold text-rose-700">{advertisingBreakEven.toFixed(2)} ريال</p>
                <p className="text-xs text-rose-600 mt-1">بافتراض متوسط نسبة تحويل 3%</p>
              </div>
            </div>

            {/* توصيات تسويقية */}
            <Alert variant="default" className="bg-indigo-50 border-indigo-200 text-indigo-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>توصيات لزيادة الأرباح</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    يمكن تقديم خصم بنسبة {idealDiscount.toFixed(1)}% في المناسبات والمواسم للحفاظ على هامش ربح جيد
                  </li>
                  <li>يفضل عدم تجاوز تكلفة الإعلان عن {advertisingBreakEven.toFixed(2)} ريال للنقرة</li>
                  {maxDiscountBeforeLoss < 15 && (
                    <li className="text-red-600 font-medium">هامش الربح منخفض، ينصح بمراجعة التكاليف أو رفع السعر</li>
                  )}
                  {maxDiscountBeforeLoss > 30 && (
                    <li className="text-green-600 font-medium">
                      هناك فرصة لتقديم عروض وخصومات جذابة مع الحفاظ على ربحية ممتازة
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
