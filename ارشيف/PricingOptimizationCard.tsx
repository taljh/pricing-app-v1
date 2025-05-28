"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { CircleCheck, TrendingUp, BarChart3, CreditCard } from "lucide-react"

interface PricingOptimizationCardProps {
  basePrice: number
  totalCosts: number
  profitMargin: number
  targetSegment: "economic" | "medium" | "luxury"
  marketAveragePrice?: number
  competitorsPrices?: number[]
}

export default function PricingOptimizationCard({
  basePrice,
  totalCosts,
  profitMargin,
  targetSegment,
  marketAveragePrice = 0,
  competitorsPrices = [],
}: PricingOptimizationCardProps) {
  // تحديد النطاق السعري المناسب بناء على الفئة المستهدفة
  const priceRange = useMemo(() => {
    switch (targetSegment) {
      case "economic":
        return { min: 100, max: 300, label: "اقتصادية" }
      case "medium":
        return { min: 301, max: 700, label: "متوسطة" }
      case "luxury":
        return { min: 701, max: 1500, label: "فاخرة" }
      default:
        return { min: 301, max: 700, label: "متوسطة" }
    }
  }, [targetSegment])

  // حساب هامش الربح الحالي
  const currentProfitAmount = useMemo(() => {
    return basePrice - totalCosts
  }, [basePrice, totalCosts])

  const currentProfitPercentage = useMemo(() => {
    return (currentProfitAmount / basePrice) * 100
  }, [currentProfitAmount, basePrice])

  // حساب متوسط أسعار المنافسين (إذا توفرت)
  const averageCompetitorPrice = useMemo(() => {
    if (competitorsPrices.length === 0) return marketAveragePrice
    return competitorsPrices.reduce((sum, price) => sum + price, 0) / competitorsPrices.length
  }, [competitorsPrices, marketAveragePrice])

  // تحليل موقع السعر الحالي في السوق
  const marketPositioning = useMemo(() => {
    if (!averageCompetitorPrice) return "غير متوفر"

    const priceDifferencePercent = ((basePrice - averageCompetitorPrice) / averageCompetitorPrice) * 100

    if (priceDifferencePercent < -15) return "أقل بكثير من السوق"
    if (priceDifferencePercent < -5) return "أقل من السوق"
    if (priceDifferencePercent < 5) return "متوافق مع السوق"
    if (priceDifferencePercent < 15) return "أعلى من السوق"
    return "أعلى بكثير من السوق"
  }, [basePrice, averageCompetitorPrice])

  // حساب السعر المثالي بناء على التكاليف وهامش الربح المستهدف والسوق
  const recommendedPrice = useMemo(() => {
    // الحد الأدنى للسعر (يغطي التكاليف + هامش ربح معقول)
    const minProfitablePrice = totalCosts * (1 + profitMargin / 100)

    // أخذ متوسط السوق بعين الاعتبار إذا توفر
    let marketBasedPrice = minProfitablePrice
    if (averageCompetitorPrice > 0) {
      // اقتراح سعر قريب من متوسط السوق مع مراعاة التكاليف
      marketBasedPrice = (minProfitablePrice + averageCompetitorPrice) / 2
    }

    // تأكد من أن السعر ضمن النطاق المستهدف
    const finalPrice = Math.max(minProfitablePrice, Math.min(marketBasedPrice, priceRange.max))

    return Math.round(finalPrice)
  }, [totalCosts, profitMargin, averageCompetitorPrice, priceRange])

  // حساب الفرق بين السعر الحالي والسعر المثالي
  const priceDifference = useMemo(() => {
    const diff = recommendedPrice - basePrice
    const percentDiff = (diff / basePrice) * 100
    return {
      amount: diff,
      percent: percentDiff,
      direction: diff > 0 ? "زيادة" : diff < 0 ? "خفض" : "مناسب",
    }
  }, [recommendedPrice, basePrice])

  // تحليل تأثير السعر المقترح على الربحية
  const profitImpact = useMemo(() => {
    const currentProfit = currentProfitAmount
    const newProfit = recommendedPrice - totalCosts
    const profitDifference = newProfit - currentProfit
    const percentChange = (profitDifference / currentProfit) * 100

    return {
      currentProfit,
      newProfit,
      difference: profitDifference,
      percentChange,
    }
  }, [recommendedPrice, totalCosts, currentProfitAmount])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-2 border-emerald-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                السعر المثالي والتحليل التنافسي
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">تحليل شامل للسعر المثالي بناءً على التكاليف والسوق</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1.5 text-xs rounded-full">
              تحليل متقدم
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* عرض سعر البيع المثالي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-lg border border-emerald-100 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-emerald-600" />
                <span>السعر المثالي المقترح</span>
              </h3>

              <div className="flex items-end gap-3">
                <div className="text-3xl font-bold text-emerald-600">{recommendedPrice} ريال</div>
                <div
                  className={`text-sm font-medium ${
                    priceDifference.amount > 0
                      ? "text-green-600"
                      : priceDifference.amount < 0
                        ? "text-amber-600"
                        : "text-blue-600"
                  }`}
                >
                  {priceDifference.amount !== 0
                    ? `${priceDifference.direction} بنسبة ${Math.abs(priceDifference.percent).toFixed(1)}%`
                    : "مطابق للسعر الحالي"}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">السعر الحالي</p>
                  <p className="font-semibold">{basePrice} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">هامش الربح المستهدف</p>
                  <p className="font-semibold">{profitMargin}%</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
              <h3 className="text-base font-semibold text-gray-800 mb-3">تأثير السعر المقترح</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>الربح الحالي:</span>
                    <span className="font-medium">{profitImpact.currentProfit.toFixed(0)} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>الربح المتوقع:</span>
                    <span className="font-medium text-emerald-700">{profitImpact.newProfit.toFixed(0)} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>الفرق:</span>
                    <span className={`${profitImpact.difference >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {profitImpact.difference > 0 ? "+" : ""}
                      {profitImpact.difference.toFixed(0)} ريال ({profitImpact.difference > 0 ? "+" : ""}
                      {profitImpact.percentChange.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm mb-1.5">هامش الربح كنسبة من السعر:</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full relative">
                    <div
                      className="absolute h-full bg-blue-500 rounded-l-full"
                      style={{ width: `${Math.min(currentProfitPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    نسبة هامش الربح الحالية: {currentProfitPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* تحليل الموقع التنافسي */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              التحليل التنافسي
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-sm text-gray-600 mb-1.5">موقعك في السوق</p>
                <p className="text-xl font-bold text-gray-800">{marketPositioning}</p>

                {averageCompetitorPrice > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-1">متوسط أسعار المنافسين</p>
                    <p className="font-medium">{averageCompetitorPrice} ريال</p>

                    <div className="mt-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span>أقل من السوق</span>
                        <span>متوافق</span>
                        <span>أعلى من السوق</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full relative">
                        {/* مؤشر موقعك في السوق */}
                        <div
                          className="absolute top-0 w-3 h-3 bg-indigo-500 rounded-full -mt-0.5 transform -translate-x-1/2"
                          style={{
                            left: `${Math.min(
                              Math.max(50 + ((basePrice - averageCompetitorPrice) / averageCompetitorPrice) * 100, 0),
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-sm text-gray-600 mb-1.5">فئة التسعير المستهدفة</p>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`
                    ${
                      targetSegment === "economic"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : targetSegment === "medium"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                    }
                    px-3 py-1
                  `}
                  >
                    {priceRange.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({priceRange.min} - {priceRange.max} ريال)
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">موقع السعر ضمن الفئة</p>
                  <div className="h-2 w-full bg-gray-100 rounded-full relative mt-2">
                    <div
                      className="absolute h-full bg-indigo-500 rounded-l-full"
                      style={{
                        width: `${Math.min(
                          Math.max(((basePrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100, 0),
                          100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{priceRange.min} ريال</span>
                    <span>{priceRange.max} ريال</span>
                  </div>
                </div>
              </div>
            </div>

            {/* توصيات أخيرة */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>التوصيات النهائية</span>
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                {priceDifference.amount > 10 && (
                  <li>يوصى برفع سعر المنتج إلى {recommendedPrice} ريال لتحسين الربحية مع مراعاة موقعك في السوق</li>
                )}
                {priceDifference.amount < -10 && (
                  <li>
                    يوصى بخفض سعر المنتج إلى {recommendedPrice} ريال لتحسين القدرة التنافسية مع الحفاظ على هامش ربح
                    مقبول
                  </li>
                )}
                {Math.abs(priceDifference.amount) <= 10 && (
                  <li>سعر منتجك الحالي مناسب نسبيًا، ولا يوصى بتغييرات جوهرية</li>
                )}
                {currentProfitPercentage < 15 && (
                  <li>هامش الربح الحالي منخفض جدًا، ينصح بمراجعة التكاليف أو رفع السعر</li>
                )}
                {averageCompetitorPrice > 0 && basePrice > averageCompetitorPrice * 1.2 && (
                  <li>سعرك أعلى من متوسط السوق بشكل ملحوظ، قد يؤثر على المبيعات</li>
                )}
                {averageCompetitorPrice > 0 && basePrice < averageCompetitorPrice * 0.8 && (
                  <li>سعرك أقل من متوسط السوق بشكل ملحوظ، قد تفوت فرصة لتحسين الربحية</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
