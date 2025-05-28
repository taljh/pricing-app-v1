"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import SmartPricingCard from "./SmartPricingCard"
import CostDetailsCard from "./CostDetailsCard"

// Form Schema
const formSchema = z.object({
  name: z.string(),
  sku: z.string().nullable(),
  fabric_main_cost: z.number().min(0, "تكلفة القماش الرئيسي مطلوبة"),
  has_secondary_fabric: z.boolean().default(false),
  fabric_secondary_cost: z.number().nullable().default(null),
  has_turha: z.boolean().default(false),
  turha_main_cost: z.number().nullable().default(null),
  has_secondary_turha: z.boolean().default(false),
  turha_secondary_cost: z.number().nullable().default(null),
  tailoring_cost: z.number().min(0, "تكلفة الخياطة مطلوبة"),
  packaging_cost: z.number().min(0, "تكلفة التغليف مطلوبة"),
  delivery_cost: z.number().nullable(),
  extra_expenses: z.number().nullable(),
  profit_margin: z.number().min(0).max(100),
  target_audience: z.enum(["economic", "medium", "luxury"]),
  marketing_cost: z.union([z.number().min(0), z.string().regex(/^\d+%$/)]).nullable(),
})

type FormData = z.infer<typeof formSchema>

// Move calculation functions outside component
const calculateCosts = (formData: Partial<FormData>) => {
  const directCosts = [
    Number(formData.fabric_main_cost) || 0,
    formData.has_secondary_fabric ? Number(formData.fabric_secondary_cost) || 0 : 0,
    formData.has_turha ? Number(formData.turha_main_cost) || 0 : 0,
    formData.has_secondary_turha ? Number(formData.turha_secondary_cost) || 0 : 0,
    Number(formData.tailoring_cost) || 0,
    Number(formData.packaging_cost) || 0,
    Number(formData.delivery_cost) || 0,
    Number(formData.extra_expenses) || 0,
  ].reduce((a, b) => a + b, 0)

  let marketingCost = 0
  if (formData.marketing_cost) {
    if (typeof formData.marketing_cost === "string" && formData.marketing_cost.endsWith("%")) {
      const percentage = Number.parseFloat(formData.marketing_cost) / 100
      marketingCost = directCosts * percentage
    } else {
      marketingCost = Number(formData.marketing_cost) || 0
    }
  }

  const profitMargin = Number(formData.profit_margin) || 0
  const profitAmount = (directCosts + marketingCost) * (profitMargin / 100)
  const finalPrice = directCosts + marketingCost + profitAmount

  return {
    directCosts,
    marketingCost,
    profitAmount,
    finalPrice,
  }
}

const calculateSuggestedPrice = (finalPrice: number, segment: string) => {
  const ranges = {
    economic: { min: 100, max: 300 },
    medium: { min: 301, max: 700 },
    luxury: { min: 701, max: 1500 },
  }
  const range = ranges[segment as keyof typeof ranges]
  return Math.max(range.min, Math.min(finalPrice, range.max))
}

const isPriceInRange = (finalPrice: number, segment: string) => {
  const ranges = {
    economic: { min: 100, max: 300 },
    medium: { min: 301, max: 700 },
    luxury: { min: 701, max: 1500 },
  }
  const range = ranges[segment as keyof typeof ranges]
  return finalPrice >= range.min && finalPrice <= range.max
}

export default function ProductPricingForm() {
  console.log("📦 ProductPricingForm component rendered")

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completionProgress, setCompletionProgress] = useState(0)

  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: null,
      fabric_main_cost: 0,
      has_secondary_fabric: false,
      fabric_secondary_cost: null,
      has_turha: false,
      turha_main_cost: null,
      has_secondary_turha: false,
      turha_secondary_cost: null,
      tailoring_cost: 0,
      packaging_cost: 0,
      delivery_cost: null,
      extra_expenses: null,
      profit_margin: 30,
      target_audience: "medium",
      marketing_cost: null,
    },
  })

  // Watch specific fields as an object instead of array
  const watchRequiredFields = {
    fabric_main_cost: watch("fabric_main_cost"),
    fabric_secondary_cost: watch("fabric_secondary_cost"),
    turha_main_cost: watch("turha_main_cost"),
    turha_secondary_cost: watch("turha_secondary_cost"),
    tailoring_cost: watch("tailoring_cost"),
    packaging_cost: watch("packaging_cost"),
    delivery_cost: watch("delivery_cost"),
    extra_expenses: watch("extra_expenses"),
    profit_margin: watch("profit_margin"),
    target_audience: watch("target_audience"),
    has_secondary_fabric: watch("has_secondary_fabric"),
    has_turha: watch("has_turha"),
    has_secondary_turha: watch("has_secondary_turha"),
    marketing_cost: watch("marketing_cost"),
  }

  // Memoize costs calculation
  const costs = useMemo(() => calculateCosts(watchRequiredFields), [watchRequiredFields])

  // التحقق من اكتمال النموذج
  const isPricingComplete = () => {
    const requiredFields = [
      watchRequiredFields.fabric_main_cost,
      watchRequiredFields.tailoring_cost,
      watchRequiredFields.packaging_cost,
      watchRequiredFields.profit_margin,
      watchRequiredFields.target_audience,
    ]

    const optionalChecks = [
      !watchRequiredFields.has_secondary_fabric || watchRequiredFields.fabric_secondary_cost !== null,
      !watchRequiredFields.has_turha || watchRequiredFields.turha_main_cost !== null,
      !watchRequiredFields.has_secondary_turha || watchRequiredFields.turha_secondary_cost !== null,
    ]

    return (
      requiredFields.every((field) => field !== undefined && field !== null) && optionalChecks.every((check) => check)
    )
  }

  // جلب بيانات المنتج والتسعير
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        // محاكاة بيانات المنتج
        const productResponse = {
          data: {
            id: "1",
            name: "منتج تجريبي",
            sku: "SKU-12345",
            user_id: "user-1",
          },
          error: null,
        }

        // محاكاة بيانات التسعير
        const pricingResponse = {
          data: {
            product_id: "1",
            fabric_main_cost: 100,
            fabric_secondary_cost: 50,
            turha_main_cost: 30,
            turha_secondary_cost: 15,
            tailoring_cost: 20,
            packaging_cost: 10,
            delivery_cost: 5,
            extra_expenses: 0,
            profit_margin: 30,
            target_audience: "medium",
            marketing_cost: null,
          },
          error: null,
        }

        // تعبئة بيانات المنتج
        setValue("name", productResponse.data.name)
        setValue("sku", productResponse.data.sku)

        // تعبئة بيانات التسعير
        if (pricingResponse.data) {
          const pricing = pricingResponse.data

          setValue("fabric_main_cost", pricing.fabric_main_cost)
          setValue("has_secondary_fabric", Boolean(pricing.fabric_secondary_cost))
          setValue("fabric_secondary_cost", pricing.fabric_secondary_cost)
          setValue("has_turha", Boolean(pricing.turha_main_cost))
          setValue("turha_main_cost", pricing.turha_main_cost)
          setValue("has_secondary_turha", Boolean(pricing.turha_secondary_cost))
          setValue("turha_secondary_cost", pricing.turha_secondary_cost)
          setValue("tailoring_cost", pricing.tailoring_cost)
          setValue("packaging_cost", pricing.packaging_cost)
          setValue("delivery_cost", pricing.delivery_cost)
          setValue("extra_expenses", pricing.extra_expenses)
          setValue("profit_margin", pricing.profit_margin)
          setValue("target_audience", pricing.target_audience)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب بيانات المنتج",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [setValue, toast])

  // حساب نسبة الاكتمال
  useEffect(() => {
    const requiredFields = {
      fabric_main_cost: Boolean(watchRequiredFields.fabric_main_cost),
      tailoring_cost: Boolean(watchRequiredFields.tailoring_cost),
      packaging_cost: Boolean(watchRequiredFields.packaging_cost),
      profit_margin: Boolean(watchRequiredFields.profit_margin),
      target_audience: Boolean(watchRequiredFields.target_audience),
    }

    const optionalFields = {
      fabric_secondary_cost:
        !watchRequiredFields.has_secondary_fabric || Boolean(watchRequiredFields.fabric_secondary_cost),
      turha_main_cost: !watchRequiredFields.has_turha || Boolean(watchRequiredFields.turha_main_cost),
      turha_secondary_cost:
        !watchRequiredFields.has_secondary_turha || Boolean(watchRequiredFields.turha_secondary_cost),
    }

    const totalFields = Object.values(requiredFields).length + Object.values(optionalFields).length
    const completedFields = [...Object.values(requiredFields), ...Object.values(optionalFields)].filter(Boolean).length

    setCompletionProgress((completedFields / totalFields) * 100)
  }, [watchRequiredFields])

  // نضيف هذه الدالة قبل return في المكون
  useEffect(() => {
    console.log("Switch States:", {
      secondary_fabric: watchRequiredFields.has_secondary_fabric,
      turha: watchRequiredFields.has_turha,
      secondary_turha: watchRequiredFields.has_secondary_turha,
    })
  }, [watchRequiredFields.has_secondary_fabric, watchRequiredFields.has_turha, watchRequiredFields.has_secondary_turha])

  // حفظ البيانات
  const onSubmit = async (data: FormData) => {
    console.log("🚀 Form submitted!", data)
    try {
      console.log("⏳ جاري حفظ البيانات...")
      setIsSubmitting(true)

      const costs = calculateCosts(data)
      const pricingData = Object.fromEntries(
        Object.entries({
          product_id: "1",
          user_id: "user-1",
          fabric_main_cost: data.fabric_main_cost,
          fabric_secondary_cost: data.has_secondary_fabric ? data.fabric_secondary_cost : null,
          turha_main_cost: data.has_turha ? data.turha_main_cost : null,
          turha_secondary_cost: data.has_secondary_turha ? data.turha_secondary_cost : null,
          tailoring_cost: data.tailoring_cost,
          packaging_cost: data.packaging_cost,
          delivery_cost: data.delivery_cost || null,
          extra_expenses: data.extra_expenses || null,
          profit_margin: data.profit_margin,
          target_audience: data.target_audience,
          total_direct_cost: costs.directCosts,
          final_price: costs.finalPrice,
          suggested_price: calculateSuggestedPrice(costs.finalPrice, data.target_audience),
          price_range_match: isPriceInRange(costs.finalPrice, data.target_audience),
        }).filter(([_, value]) => value !== undefined),
      )

      console.log("🧾 Prepared Data:", pricingData)

      // هنا يتم حفظ البيانات في قاعدة البيانات الحقيقية
      // const { data: savedPricing, error: pricingError } = await supabase
      //   .from("pricing_details")
      //   .upsert([pricingData], { onConflict: "product_id" })
      //   .select()

      // console.log("📦 Upsert Result:", savedPricing)

      // if (pricingError) {
      //   toast({
      //     title: "❌ خطأ في حفظ التسعير",
      //     description: "حدث خطأ أثناء حفظ تفاصيل التسعير، يرجى المحاولة مرة أخرى",
      //     duration: 5000,
      //   })
      //   throw pricingError
      // }

      // تحديث بيانات المنتج
      // const { error: productUpdateError } = await supabase
      //   .from("products")
      //   .update({
      //     has_pricing: true,
      //     sku: data.sku,
      //     updated_at: new Date().toISOString(),
      //   })
      //   .eq("id", productId)
      //   .eq("user_id", user.id)

      // if (productUpdateError) {
      //   toast({
      //     title: "⚠️ تم حفظ التسعير جزئياً",
      //     description: "تم حفظ تفاصيل التسعير لكن فشل تحديث حالة المنتج",
      //     duration: 5000,
      //   })
      // } else {
      //   toast({
      //     title: "✅ تم الحفظ",
      //     description: "تم حفظ التسعير لهذا المنتج بنجاح 🎉",
      //     duration: 3000,
      //   })

      //   // ننتظر قليلاً قبل التوجيه للصفحة الرئيسية
      //   setTimeout(() => {
      //     router.push("/dashboard/products")
      //   }, 1000)
      // }
    } catch (error) {
      console.error("❌ Error in onSubmit:", error)
      toast({
        title: "❌ خطأ في الحفظ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء حفظ البيانات",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    // Mock data to bypass Supabase dependency
    console.log("Using mock data for ProductPricingForm")
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 lg:col-span-2">
        {/* نسبة اكتمال النموذج */}
        <Card className="p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">نسبة اكتمال النموذج</h3>
              <span className="text-sm text-gray-500">{Math.round(completionProgress)}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>
        </Card>

        {/* معلومات المنتج */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">معلومات المنتج</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>اسم المنتج</Label>
              <Input {...register("name")} disabled />
            </div>
            <div>
              <Label>رمز المنتج (SKU)</Label>
              <Input {...register("sku")} placeholder="أدخل رمز المنتج" />
            </div>
          </div>
        </Card>

        {/* التكاليف الأساسية */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">التكاليف الأساسية</h3>
          <div className="space-y-4">
            {/* كرت تكاليف القماش */}
            <Card className="p-4 bg-muted/30">
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">تكاليف القماش</h4>
                <div>
                  <Label>
                    تكلفة القماش الرئيسي
                    <Badge className="ml-2" variant="secondary">
                      مطلوب
                    </Badge>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("fabric_main_cost", { valueAsNumber: true })}
                      className="pl-16"
                      placeholder="0.00"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ريال</span>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="has_secondary_fabric"
                      checked={watchRequiredFields.has_secondary_fabric}
                      onCheckedChange={(checked) => {
                        setValue("has_secondary_fabric", checked)
                        if (!checked) setValue("fabric_secondary_cost", null)
                      }}
                    />
                    <Label htmlFor="has_secondary_fabric">إضافة قماش ثانوي</Label>
                  </div>

                  {watchRequiredFields.has_secondary_fabric && (
                    <div className="animate-in slide-in-from-top duration-200 mt-4">
                      <Label>تكلفة القماش الثانوي</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("fabric_secondary_cost", { valueAsNumber: true })}
                          className="pl-16"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ريال</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* كرت تكاليف الطرحة */}
            <Card className="p-4 bg-muted/30">
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">تكاليف الطرحة</h4>
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_turha"
                    checked={watchRequiredFields.has_turha}
                    onCheckedChange={(checked) => {
                      setValue("has_turha", checked)
                      if (!checked) {
                        setValue("turha_main_cost", null)
                        setValue("has_secondary_turha", false)
                        setValue("turha_secondary_cost", null)
                      }
                    }}
                  />
                  <Label htmlFor="has_turha">إضافة طرحة</Label>
                </div>

                {watchRequiredFields.has_turha && (
                  <div className="animate-in slide-in-from-top duration-200 space-y-4">
                    <div>
                      <Label>تكلفة الطرحة الرئيسية</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("turha_main_cost", { valueAsNumber: true })}
                          className="pl-16"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ريال</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="has_secondary_turha"
                          checked={watchRequiredFields.has_secondary_turha}
                          onCheckedChange={(checked) => {
                            setValue("has_secondary_turha", checked)
                            if (!checked) setValue("turha_secondary_cost", null)
                          }}
                        />
                        <Label htmlFor="has_secondary_turha">إضافة طرحة ثانوية</Label>
                      </div>

                      {watchRequiredFields.has_secondary_turha && (
                        <div className="animate-in slide-in-from-top duration-200 mt-4">
                          <Label>تكلفة الطرحة الثانوية</Label>
                          <div className="relative mt-1.5">
                            <Input
                              type="number"
                              step="0.01"
                              {...register("turha_secondary_cost", { valueAsNumber: true })}
                              className="pl-16"
                              placeholder="0.00"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ريال
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* كرت تكلفة الخياطة */}
            <Card className="p-4 bg-muted/30">
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">تكلفة الخياطة</h4>
                <div>
                  <Label>
                    تكلفة الخياطة
                    <Badge className="ml-2" variant="secondary">
                      مطلوب
                    </Badge>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("tailoring_cost", { valueAsNumber: true })}
                      className="pl-16"
                      placeholder="0.00"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">ريال</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* تكاليف إضافية */}
        <div className="space-y-2">
          <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-xl border border-indigo-100/80 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 px-6 py-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus-circle"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </span>
                <span>تكاليف إضافية</span>
              </h3>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* تكلفة التغليف */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-gray-700 font-medium">تكلفة التغليف</Label>
                    <Badge
                      className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-200 mr-2"
                      variant="secondary"
                    >
                      مطلوب
                    </Badge>
                  </div>
                  <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("packaging_cost", { valueAsNumber: true })}
                      className="pr-16 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 shadow-sm"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 font-medium">
                      ريال
                    </span>
                  </div>
                </div>

                {/* تكلفة التوصيل */}
                <div className="group">
                  <Label className="text-gray-700 font-medium mb-2 block">تكلفة التوصيل</Label>
                  <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("delivery_cost", { valueAsNumber: true })}
                      className="pr-16 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 shadow-sm"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 font-medium">
                      ريال
                    </span>
                  </div>
                </div>

                {/* مصاريف إضافية */}
                <div className="group">
                  <Label className="text-gray-700 font-medium mb-2 block">مصاريف إضافية</Label>
                  <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                    <Input
                      type="number"
                      step="0.01"
                      {...register("extra_expenses", { valueAsNumber: true })}
                      className="pr-16 border-indigo-100 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 shadow-sm"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 font-medium">
                      ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* كرت تكاليف التسويق */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">تكاليف التسويق</h4>
              <div>
                <Label>تكلفة التسويق</Label>
                <Input type="text" {...register("marketing_cost")} placeholder="مثال: 10% أو 100" />
              </div>
            </div>
          </Card>
        </div>

        {/* الربحية والفئة المستهدفة */}
        <div className="space-y-2">
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl border border-purple-100/80 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 px-6 py-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-up-right"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
                <span>الربحية والفئة المستهدفة</span>
              </h3>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-gray-700 font-medium">هامش الربح</Label>
                    <Badge
                      className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 border-amber-200 mr-2"
                      variant="secondary"
                    >
                      مطلوب
                    </Badge>
                  </div>
                  <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      {...register("profit_margin", { valueAsNumber: true })}
                      className="pr-8 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 shadow-sm"
                      placeholder="30"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 font-medium">
                      %
                    </span>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-gray-700 font-medium">الفئة المستهدفة</Label>
                    <Badge
                      className="bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200 mr-2"
                      variant="secondary"
                    >
                      من إعدادات المشروع
                    </Badge>
                  </div>
                  <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
                    <Select
                      value={watchRequiredFields.target_audience}
                      onValueChange={(value) => setValue("target_audience", value as "economic" | "medium" | "luxury")}
                    >
                      <SelectTrigger className="border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 shadow-sm">
                        <SelectValue placeholder="اختر الفئة المستهدفة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economic" className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                          <span>اقتصادية (100-300 ريال)</span>
                        </SelectItem>
                        <SelectItem value="medium" className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                          <span>متوسطة (301-700 ريال)</span>
                        </SelectItem>
                        <SelectItem value="luxury" className="flex items-center gap-2">
                          <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                          <span>فاخرة (701-1500 ريال)</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الملخص وزر الحفظ */}
        <Card className="p-6">
          <div className="space-y-4">
            {!isPricingComplete() && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">يجب إكمال جميع الحقول المطلوبة قبل حفظ التسعير</p>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={!isPricingComplete() || isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جارِ الحفظ...</span>
                </div>
              ) : (
                "حفظ التسعير"
              )}
            </Button>
          </div>
        </Card>
      </form>

      <div className="lg:sticky lg:top-6 lg:h-fit space-y-4">
        {/* كرت تفاصيل التكلفة */}
        <CostDetailsCard
          fabricMainCost={watchRequiredFields.fabric_main_cost || 0}
          fabricSecondaryCost={watchRequiredFields.fabric_secondary_cost}
          turhaMainCost={watchRequiredFields.turha_main_cost}
          turhaSecondaryCost={watchRequiredFields.turha_secondary_cost}
          tailoringCost={watchRequiredFields.tailoring_cost || 0}
          packagingCost={watchRequiredFields.packaging_cost || 0}
          deliveryCost={watchRequiredFields.delivery_cost}
          extraExpenses={watchRequiredFields.extra_expenses}
          profitMargin={watchRequiredFields.profit_margin || 0}
        />

        {/* كرت تحليل التسعير */}
        <SmartPricingCard
          directCosts={costs.directCosts}
          finalPrice={costs.finalPrice}
          profitMargin={watchRequiredFields.profit_margin || 0}
          targetSegment={watchRequiredFields.target_audience || "medium"}
          suggestedPrice={calculateSuggestedPrice(costs.finalPrice, watchRequiredFields.target_audience || "medium")}
          isPriceInRange={isPriceInRange(costs.finalPrice, watchRequiredFields.target_audience || "medium")}
        />

        {/* كرت ملخص التسعير */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">ملخص التسعير</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>إجمالي التكاليف المباشرة:</span>
              <span>{costs.directCosts.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>تكاليف التسويق:</span>
              <span>{costs.marketingCost.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>هامش الربح:</span>
              <span>{costs.profitAmount.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>السعر النهائي:</span>
              <span>{costs.finalPrice.toFixed(2)} ريال</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
