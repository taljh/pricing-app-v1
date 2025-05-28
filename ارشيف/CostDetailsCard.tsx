"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"

interface CostDetailsCardProps {
  fabricMainCost: number
  fabricSecondaryCost?: number | null
  turhaMainCost?: number | null
  turhaSecondaryCost?: number | null
  tailoringCost: number
  packagingCost: number
  deliveryCost?: number | null
  extraExpenses?: number | null
  fixedCosts: number
  profitMargin: number
}

export default function CostDetailsCard({
  fabricMainCost = 0,
  fabricSecondaryCost = 0,
  turhaMainCost = 0,
  turhaSecondaryCost = 0,
  tailoringCost = 0,
  packagingCost = 0,
  deliveryCost = 0,
  extraExpenses = 0,
  fixedCosts = 0,
  profitMargin = 0,
}: CostDetailsCardProps) {
  // حساب إجمالي التكاليف المباشرة وإجمالي السعر
  const directCosts = useMemo(() => {
    return [
      fabricMainCost,
      fabricSecondaryCost || 0,
      turhaMainCost || 0,
      turhaSecondaryCost || 0,
      tailoringCost,
      packagingCost,
      deliveryCost || 0,
      extraExpenses || 0,
      fixedCosts,
    ].reduce((sum, cost) => sum + cost, 0)
  }, [
    fabricMainCost,
    fabricSecondaryCost,
    turhaMainCost,
    turhaSecondaryCost,
    tailoringCost,
    packagingCost,
    deliveryCost,
    extraExpenses,
    fixedCosts,
  ])

  const profitAmount = (directCosts * profitMargin) / 100
  const totalPrice = directCosts + profitAmount

  // تحليل مكونات التكلفة لعرضها في رسم بياني
  const costComponents = [
    { name: "تكلفة القماش", value: fabricMainCost + (fabricSecondaryCost || 0) },
    { name: "تكلفة الطرحة", value: (turhaMainCost || 0) + (turhaSecondaryCost || 0) },
    { name: "تكلفة الخياطة", value: tailoringCost },
    { name: "تكلفة التغليف", value: packagingCost },
    { name: "تكلفة التوصيل", value: deliveryCost || 0 },
    { name: "مصاريف إضافية", value: extraExpenses || 0 },
    { name: "تكاليف ثابتة", value: fixedCosts },
  ].filter((component) => component.value > 0)

  // توزيع النسب المئوية
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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-2 border-indigo-100 shadow-lg">
        {/* رأس البطاقة */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-600"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                تفاصيل التكاليف
              </h3>
              <p className="text-sm text-gray-600">تحليل مفصل لمكونات التكلفة</p>
            </div>
          </div>

          {/* ملخص إجمالي التكاليف والهامش */}
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="bg-white bg-opacity-70 p-4 rounded-lg backdrop-blur-sm border border-indigo-100">
              <div className="text-sm text-gray-500 mb-1">إجمالي التكاليف</div>
              <div className="text-2xl font-bold text-gray-900">{directCosts.toFixed(2)} ريال</div>
            </div>
            <div className="bg-white bg-opacity-70 p-4 rounded-lg backdrop-blur-sm border border-indigo-100">
              <div className="text-sm text-gray-500 mb-1">قيمة هامش الربح</div>
              <div className="text-2xl font-bold text-indigo-600">{profitAmount.toFixed(2)} ريال</div>
            </div>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-6 bg-white">
          {/* تحليل مرئي للتكاليف */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">توزيع عناصر التكلفة</h4>

            <div className="space-y-3">
              {costPercentages.map((component, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colors[index % colors.length].bg}`}></span>
                      <span className="text-sm text-gray-600">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{component.value.toFixed(2)} ريال</span>
                      <span className="text-xs text-gray-500">({component.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <motion.div
                    className="h-2 rounded-full bg-gray-100 overflow-hidden"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className={`h-full ${colors[index % colors.length].bg}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${component.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* ملخص نهائي */}
          <div className="pt-2">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">إجمالي التكاليف:</span>
              <span className="font-semibold">{directCosts.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between mb-3 text-indigo-600">
              <span>+ هامش الربح ({profitMargin}%):</span>
              <span className="font-semibold">{profitAmount.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>= السعر النهائي:</span>
              <span>{totalPrice.toFixed(2)} ريال</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
