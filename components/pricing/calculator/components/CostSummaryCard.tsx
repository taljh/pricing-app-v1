"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Info, CheckCircle2, AlertCircle, Download, Share2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmbroideryDetails {
  hasEmbroidery: boolean
  embroideryCost: number
}

interface CostSummaryCardProps {
  productName: string
  fabricMainCost: number
  fabricSecondaryCost?: number | null
  turhaMainCost?: number | null
  turhaSecondaryCost?: number | null
  tailoringCost: number
  embroideryDetails: EmbroideryDetails
  packagingCost: number
  deliveryCost?: number | null
  extraExpenses?: number | null
  fixedCosts: number
  marketingCost: number
  profitMargin: number
}

// طرق الدفع وقيم الرسوم - سنخزنها لاحقاً في إعدادات المشروع
const paymentMethods = [
  { id: "apple-pay", name: "ابل باي", fee: 2.9 },
  { id: "mada", name: "مدى", fee: 1.5 },
  { id: "visa", name: "فيزا", fee: 2.5 },
  { id: "mastercard", name: "ماستركارد", fee: 2.5 },
  { id: "tabby", name: "تابي", fee: 3.5 },
  { id: "tamara", name: "تمارا", fee: 3.2 },
  { id: "stcpay", name: "اس تي سي باي", fee: 2.0 },
]

// هذه ستأتي لاحقًا من إعدادات المشروع
const mockSelectedPaymentMethods = ["mada", "visa", "mastercard", "tabby"]

export default function CostSummaryCard({
  productName,
  fabricMainCost = 0,
  fabricSecondaryCost = 0,
  turhaMainCost = 0,
  turhaSecondaryCost = 0,
  tailoringCost = 0,
  embroideryDetails,
  packagingCost = 0,
  deliveryCost = 0,
  extraExpenses = 0,
  fixedCosts = 0,
  marketingCost = 0,
  profitMargin = 0,
}: CostSummaryCardProps) {
  // طريقة الدفع ذات الرسوم الأعلى
  const [highestFeeMethod, setHighestFeeMethod] = useState<{id: string, name: string, fee: number} | null>(() => {
    if (mockSelectedPaymentMethods.length > 0) {
      return paymentMethods
        .filter(method => mockSelectedPaymentMethods.includes(method.id))
        .reduce((highest, current) => {
          return current.fee > highest.fee ? current : highest
        }, paymentMethods.find(m => m.id === mockSelectedPaymentMethods[0])!)
    }
    return null
  })

  const [showFullBreakdown, setShowFullBreakdown] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // حساب تكلفة التطريز إذا كانت موجودة
  const embroideryCost = embroideryDetails.hasEmbroidery ? embroideryDetails.embroideryCost : 0

  // حساب إجمالي التكاليف المباشرة 
  const directCosts = useMemo(() => {
    return [
      fabricMainCost,
      fabricSecondaryCost || 0,
      turhaMainCost || 0,
      turhaSecondaryCost || 0,
      tailoringCost,
      embroideryCost,
      packagingCost,
      deliveryCost || 0,
      extraExpenses || 0,
      fixedCosts, // التكاليف الثابتة (مضافة كما هي من الإعدادات)
      marketingCost, // تكلفة التسويق المحسوبة
    ].reduce((sum, cost) => sum + cost, 0)
  }, [
    fabricMainCost,
    fabricSecondaryCost,
    turhaMainCost,
    turhaSecondaryCost,
    tailoringCost,
    embroideryCost,
    packagingCost,
    deliveryCost,
    extraExpenses,
    fixedCosts,
    marketingCost,
  ])

  // حساب هامش الربح
  const profitAmount = (directCosts * profitMargin) / 100
  
  // حساب السعر قبل إضافة رسوم الدفع
  const priceBeforePaymentFee = directCosts + profitAmount
  
  // حساب رسوم الدفع الإلكتروني (على السعر النهائي)
  const paymentProcessingFee = useMemo(() => {
    if (!highestFeeMethod) return 0
    
    // تطبيق النسبة على السعر قبل إضافة رسوم الدفع
    return (priceBeforePaymentFee * highestFeeMethod.fee) / 100
  }, [highestFeeMethod, priceBeforePaymentFee])
  
  // إجمالي السعر النهائي بعد إضافة رسوم الدفع
  const totalPrice = priceBeforePaymentFee + paymentProcessingFee

  // تحليل مكونات التكلفة لعرضها في رسم بياني
  const costComponents = [
    { 
      name: "تكلفة القماش", 
      icon: "🧵", 
      value: fabricMainCost + (fabricSecondaryCost || 0) 
    },
    { 
      name: "تكلفة الطرحة", 
      icon: "👗", 
      value: (turhaMainCost || 0) + (turhaSecondaryCost || 0) 
    },
    { 
      name: "تكلفة الخياطة", 
      icon: "✂️", 
      value: tailoringCost 
    },
    { 
      name: "تكلفة التطريز", 
      icon: "🧵", 
      value: embroideryCost 
    },
    { 
      name: "تكلفة التغليف", 
      icon: "📦", 
      value: packagingCost 
    },
    { 
      name: "تكلفة التوصيل", 
      icon: "🚚", 
      value: deliveryCost || 0 
    },
    { 
      name: "تكلفة التسويق", 
      icon: "📱", 
      value: marketingCost 
    },
    { 
      name: "مصاريف إضافية", 
      icon: "📝", 
      value: extraExpenses || 0 
    },
    { 
      name: "تكاليف ثابتة", 
      icon: "🏢", 
      value: fixedCosts 
    },
  ].filter((component) => component.value > 0)

  // توزيع النسب المئوية (على إجمالي التكاليف قبل الربح ورسوم الدفع)
  const costPercentages = costComponents.map((component) => ({
    ...component,
    percentage: (component.value / directCosts) * 100,
  }))

  // اختيار الألوان للمكونات
  const colors = [
    { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-100" },
    { bg: "bg-violet-500", text: "text-violet-600", light: "bg-violet-100" },
    { bg: "bg-sky-500", text: "text-sky-600", light: "bg-sky-100" },
    { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100" },
    { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100" },
    { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-100" },
    { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-100" },
  ]

  // تقريب السعر النهائي لأقرب رقم (للعرض)
  const roundedPrice = Math.ceil(totalPrice / 5) * 5

  // حساب حد السعر الأدنى والأقصى للمقارنة
  const minPrice = Math.round(totalPrice * 0.95)
  const maxPrice = Math.round(totalPrice * 1.10)

  return (
    <motion.div dir="rtl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-2 border-indigo-100 shadow-sm relative">
        {/* شريط التصنيف */}
        <div className="absolute top-0 left-10 w-36 h-8 transform -translate-y-4 -rotate-45 bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <span className="text-xs font-bold">نتيجة التحليل</span>
        </div>

        {/* رأس البطاقة - السعر النهائي */}
        <div className="bg-gradient-to-l from-indigo-500/10 to-indigo-500/5 p-4 pt-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-base font-bold text-gray-800">{productName}</h3>
              <p className="text-xs text-gray-500">تم حساب السعر المثالي بناءً على التكاليف المدخلة</p>
            </div>
            <motion.div 
              className="bg-white px-2 py-1 rounded-full border border-indigo-200 shadow-sm flex items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <span className="text-xs font-medium text-indigo-500">ربح {profitMargin}%</span>
            </motion.div>
          </div>

          {/* السعر النهائي والتكلفة */}
          <div className="grid grid-cols-3 mt-3 gap-2">
            <div className="bg-white bg-opacity-90 p-3 rounded-lg backdrop-blur-sm border border-indigo-200 text-center col-span-2">
              <div className="text-xs text-gray-500 mb-1">السعر النهائي المقترح</div>
              <motion.div 
                className="text-2xl font-bold text-indigo-700 flex items-end justify-center"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {roundedPrice.toFixed(0)}
                <span className="text-sm font-normal mr-1 mb-0.5">ريال</span>
              </motion.div>
              <div className="text-xs flex items-center justify-center gap-1 mt-1 text-gray-500">
                <span>مقترح:</span>
                <span className="text-emerald-600">{minPrice}</span>
                <span>-</span>
                <span className="text-emerald-600">{maxPrice}</span>
                <span>ريال</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="bg-white bg-opacity-70 py-2 px-3 rounded-lg backdrop-blur-sm border border-indigo-100 text-center flex-1">
                <div className="text-xs text-gray-500">التكلفة</div>
                <div className="text-lg font-bold text-gray-700">
                  {directCosts.toFixed(0)} <span className="text-xs">ريال</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-70 py-2 px-3 rounded-lg backdrop-blur-sm border border-indigo-100 text-center flex-1">
                <div className="text-xs text-gray-500">الربح</div>
                <div className="text-lg font-bold text-emerald-600">
                  {profitAmount.toFixed(0)} <span className="text-xs">ريال</span>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات السريعة */}
          <div className="flex justify-center gap-2 mt-3">
            <Button variant="outline" size="sm" className="bg-white">
              <Printer className="h-3.5 w-3.5 ml-1" />
              <span className="text-xs">طباعة</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-white">
              <Download className="h-3.5 w-3.5 ml-1" />
              <span className="text-xs">تصدير</span>
            </Button>
            <Button variant="outline" size="sm" className="bg-white">
              <Share2 className="h-3.5 w-3.5 ml-1" />
              <span className="text-xs">مشاركة</span>
            </Button>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-4 bg-white">
          {/* تفاصيل توزيع التكاليف في رسم بياني شريطي */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-1">توزيع التكاليف</h4>
            <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
              {costPercentages.map((component, index) => (
                <motion.div
                  key={index}
                  className={`h-full ${colors[index % colors.length].bg}`}
                  style={{ width: `${component.percentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${component.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  title={`${component.name}: ${component.value.toFixed(2)} ريال (${component.percentage.toFixed(1)}%)`}
                />
              ))}
            </div>
            
            {/* مفتاح الرسم البياني */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs justify-start">
              {costPercentages.map((component, index) => (
                <div key={index} className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${colors[index % colors.length].bg} ml-1`}></span>
                  <span className="text-gray-600">{component.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ملخص التكاليف */}
          <div className="space-y-1 text-sm mb-3">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">🧵</span>
                <span>المواد (قماش وطرحة)</span>
              </div>
              <span className="font-medium">
                {(
                  fabricMainCost + 
                  (fabricSecondaryCost || 0) + 
                  (turhaMainCost || 0) + 
                  (turhaSecondaryCost || 0)
                ).toFixed(0)} ريال
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">✂️</span>
                <span>الخياطة والتطريز</span>
              </div>
              <span className="font-medium">
                {(tailoringCost + embroideryCost).toFixed(0)} ريال
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">📦</span>
                <span>التغليف والتوصيل</span>
              </div>
              <span className="font-medium">
                {(packagingCost + (deliveryCost || 0)).toFixed(0)} ريال
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">📱</span>
                <span>التسويق</span>
              </div>
              <span className="font-medium">
                {marketingCost.toFixed(0)} ريال
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">🏢</span>
                <span>تكاليف ثابتة ومصاريف أخرى</span>
              </div>
              <span className="font-medium">
                {(fixedCosts + (extraExpenses || 0)).toFixed(0)} ريال
              </span>
            </div>

            <div className="flex justify-between items-center py-1 text-indigo-700 border-b border-gray-100">
              <div className="flex items-center">
                <span className="text-base ml-1">💰</span>
                <span className="font-medium">الربح ({profitMargin}%)</span>
              </div>
              <span className="font-medium">{profitAmount.toFixed(0)} ريال</span>
            </div>

            {/* رسوم الدفع الإلكتروني */}
            {highestFeeMethod && (
              <div className="flex justify-between items-center py-1 text-amber-600">
                <div className="flex items-center">
                  <span className="text-base ml-1">💳</span>
                  <span>رسوم دفع ({highestFeeMethod.name} - {highestFeeMethod.fee}%)</span>
                </div>
                <span className="font-medium">{paymentProcessingFee.toFixed(0)} ريال</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* السعر النهائي المقترح */}
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex justify-between items-center mb-2">
            <div className="flex items-center">
              <CheckCircle2 className="text-indigo-600 w-4 h-4 ml-2" />
              <div>
                <p className="text-sm font-medium text-gray-800">السعر النهائي المقترح</p>
                <p className="text-xs text-gray-500">شامل التكاليف والربح ورسوم الدفع</p>
              </div>
            </div>
            <div className="text-lg font-bold text-indigo-700">{roundedPrice.toFixed(0)} ريال</div>
          </div>

          {/* زر اقتراح سعر استراتيجي */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSuggestions(prev => !prev)}
            className="w-full mb-2 text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50"
          >
            {showSuggestions ? "إخفاء الاقتراحات" : "اقتراحات تسعير استراتيجية"}
          </Button>

          {/* اقتراحات التسعير الاستراتيجية */}
          {showSuggestions && (
            <motion.div 
              className="text-xs space-y-2 mb-3 p-3 bg-emerald-50 rounded-md border border-emerald-100"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-medium text-emerald-800">اقتراحات تسعير استراتيجية:</h4>
              
              <div className="grid grid-cols-3 gap-2 my-2">
                <div className="bg-white p-2 rounded border border-emerald-100">
                  <div className="text-center font-medium text-emerald-700">سعر تنافسي</div>
                  <div className="text-center font-bold text-lg text-emerald-800 mt-1">{minPrice} ريال</div>
                </div>
                <div className="bg-white p-2 rounded border-2 border-emerald-300 shadow-sm">
                  <div className="text-center font-medium text-emerald-700">السعر المثالي</div>
                  <div className="text-center font-bold text-lg text-emerald-800 mt-1">{roundedPrice} ريال</div>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-100">
                  <div className="text-center font-medium text-emerald-700">سعر مميز</div>
                  <div className="text-center font-bold text-lg text-emerald-800 mt-1">{maxPrice} ريال</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <p className="text-emerald-700">قد يكون السعر التنافسي مناسبًا عند الدخول للسوق أو لتعزيز المبيعات.</p>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <p className="text-emerald-700">السعر المثالي يوازن بين الربحية وجاذبية السعر للعملاء.</p>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <p className="text-emerald-700">السعر المميز مناسب للمنتجات ذات القيمة المضافة العالية والجودة المميزة.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* زر التفاصيل الكاملة */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            {showFullBreakdown ? "عرض ملخص" : "عرض التفاصيل الكاملة"}
          </Button>
          
          {/* التفاصيل الكاملة */}
          {showFullBreakdown && (
            <motion.div 
              className="text-xs space-y-2 mt-3 p-3 bg-gray-50 rounded-md border"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="font-medium text-gray-700">التفاصيل الكاملة للتكاليف:</h4>
              <div className="space-y-1">
                {fabricMainCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة القماش الرئيسي</span>
                    <span>{fabricMainCost.toFixed(2)} ريال</span>
                  </div>
                )}
                {fabricSecondaryCost && fabricSecondaryCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة القماش الثانوي</span>
                    <span>{fabricSecondaryCost.toFixed(2)} ريال</span>
                  </div>
                )}
                {turhaMainCost && turhaMainCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة الطرحة الرئيسية</span>
                    <span>{turhaMainCost.toFixed(2)} ريال</span>
                  </div>
                )}
                {turhaSecondaryCost && turhaSecondaryCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة الطرحة الثانوية</span>
                    <span>{turhaSecondaryCost.toFixed(2)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>تكلفة الخياطة</span>
                  <span>{tailoringCost.toFixed(2)} ريال</span>
                </div>
                {embroideryCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة التطريز</span>
                    <span>{embroideryCost.toFixed(2)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>تكلفة التغليف</span>
                  <span>{packagingCost.toFixed(2)} ريال</span>
                </div>
                {deliveryCost && deliveryCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة التوصيل</span>
                    <span>{deliveryCost.toFixed(2)} ريال</span>
                  </div>
                )}
                {marketingCost > 0 && (
                  <div className="flex justify-between">
                    <span>تكلفة التسويق</span>
                    <span>{marketingCost.toFixed(2)} ريال</span>
                  </div>
                )}
                {extraExpenses && extraExpenses > 0 && (
                  <div className="flex justify-between">
                    <span>مصاريف إضافية</span>
                    <span>{extraExpenses.toFixed(2)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>تكاليف ثابتة</span>
                  <span>{fixedCosts.toFixed(2)} ريال</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>إجمالي التكاليف</span>
                    <span>{directCosts.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 font-medium">
                    <span>هامش الربح ({profitMargin}%)</span>
                    <span>{profitAmount.toFixed(2)} ريال</span>
                  </div>
                  {highestFeeMethod && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>رسوم الدفع ({highestFeeMethod.fee}%)</span>
                      <span>{paymentProcessingFee.toFixed(2)} ريال</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-1 pt-2 border-t border-gray-200">
                    <span>السعر النهائي</span>
                    <span>{totalPrice.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between font-bold text-indigo-700 mt-1 pt-2 border-t border-gray-200">
                    <span>السعر المقترح (مقرب)</span>
                    <span>{roundedPrice.toFixed(0)} ريال</span>
                  </div>
                </div>
              </div>

              {/* نصائح التسعير */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span className="text-amber-700">
                    نصيحة: قم بمقارنة السعر المقترح مع أسعار السوق للمنتجات المشابهة.
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}