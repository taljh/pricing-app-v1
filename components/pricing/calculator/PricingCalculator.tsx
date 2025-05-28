"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calculator, 
  Package, 
  Tag, 
  Scissors, 
  CircleDollarSign, 
  CheckCircle2, 
  BarChart3,
  Save,
  Info,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  Plus,
  Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRTL } from "@/lib/rtl-context" // إضافة استيراد سياق RTL
import { useScreenInfo } from "@/hooks/use-mobile" // إضافة استيراد معلومات الشاشة للتوافق مع الجوال

// استيراد المكونات الفرعية
import CompetitivePricing from "./components/CompetitivePricing"
import CostDetailsCard from "./components/CostDetailsCard"
// import CostDetailsCardplus from "./components/CostDetailsCardplus"

// استيراد أدوات المساعدة
import { roundToNearest5 } from "./utils/format-helpers"

// استيراد المكونات الجديدة
import AddProductModal from "@/components/products/AddProductModal"
import ProductSelector from "@/components/products/ProductSelector"
import ProductSelectorStep from "@/components/products/ProductSelectorStep"

interface Costs {
  fabricMainCost: number;
  fabricSecondaryCost: number;
  turhaMainCost: number;
  turhaSecondaryCost: number;
  tailoringCost: number;
  packagingCost: number;
  deliveryCost: number;
  extraExpenses: number;
  fixedCosts: number;
  directCosts: number;
  marketingCost: number;
  profitAmount: number;
  paymentGatewayFees: number;
  finalPrice: number;
}

interface PricingFormData {
  name: string;
  sku: string;
  fabric_main_cost: number;
  has_secondary_fabric: boolean;
  fabric_secondary_cost: number;
  has_turha: boolean;
  turha_main_cost: number;
  has_secondary_turha: boolean;
  turha_secondary_cost: number;
  tailoring_cost: number;
  packaging_cost: number;
  delivery_cost: number;
  extra_expenses: number;
  fixed_costs: number;
  profit_margin: number;
  marketing_costs: number;
  marketing_type: "fixed" | "percentage";
  target_segment: "economic" | "medium" | "luxury";
  target_audience: string;
  category: string;
}

interface PricingCalculatorProps {
  onClose?: () => void;
}

export default function PricingCalculator({ onClose }: PricingCalculatorProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('product_id')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(false) // تم تغيير القيمة الافتراضية
  const [isProductSelectorVisible, setIsProductSelectorVisible] = useState(!productId) // حالة جديدة لإظهار محدد المنتج
  const [costs, setCosts] = useState<Costs>({
    fabricMainCost: 0,
    fabricSecondaryCost: 0,
    turhaMainCost: 0,
    turhaSecondaryCost: 0,
    tailoringCost: 0,
    packagingCost: 0,
    deliveryCost: 0,
    extraExpenses: 0,
    fixedCosts: 0,
    directCosts: 0,
    marketingCost: 0,
    profitAmount: 0,
    paymentGatewayFees: 0,
    finalPrice: 0
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PricingFormData>({
    defaultValues: {
      name: "",
      sku: "",
      fabric_main_cost: 0,
      has_secondary_fabric: false,
      fabric_secondary_cost: 0,
      has_turha: false,
      turha_main_cost: 0,
      has_secondary_turha: false,
      turha_secondary_cost: 0,
      tailoring_cost: 0,
      packaging_cost: 0,
      delivery_cost: 0,
      extra_expenses: 0,
      fixed_costs: 0,
      profit_margin: 30,
      target_segment: "medium",
      target_audience: "medium",
      category: "",
      marketing_type: "fixed"
    }
  })

  const watchRequiredFields = watch()

  // حساب التكاليف
  useEffect(() => {
    const subscription = watch((value) => {
      const formData = value as PricingFormData;
      const newCosts = calculateCosts(formData);
      setCosts(newCosts);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: PricingFormData) => {
    setIsSubmitting(true)
    try {
      if (!selectedProduct?.id) {
        toast.error('يجب اختيار منتج أولاً')
        return
      }

      const supabase = createClientComponentClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        toast.error('يجب تسجيل الدخول لحفظ التسعير')
        return
      }

      // حساب التكاليف النهائية
      const calculatedCosts = calculateCosts(data)

      // التحقق من صحة البيانات قبل الحفظ
      if (isNaN(calculatedCosts.finalPrice) || calculatedCosts.finalPrice <= 0) {
        toast.error('قيمة السعر النهائي غير صالحة')
        return
      }

      console.log('تبدأ عملية الحفظ...')

      // التحقق من وجود تسعير سابق للمنتج
      const { data: existingPricing, error: checkError } = await supabase
        .from('pricings')
        .select('id')
        .eq('product_id', selectedProduct.id)
        .maybeSingle()

      if (checkError) {
        console.error('خطأ في التحقق من التسعير الحالي:', checkError)
        toast.error(`حدث خطأ أثناء التحقق من التسعير الحالي: ${checkError.message}`)
        return
      }

      const pricingData = {
        user_id: user.id,
        product_id: selectedProduct.id,
        fabric_main_cost: data.fabric_main_cost || 0,
        fabric_secondary_cost: data.fabric_secondary_cost || 0,
        has_secondary_fabric: data.has_secondary_fabric || false,
        turha_main_cost: data.turha_main_cost || 0,
        turha_secondary_cost: data.turha_secondary_cost || 0,
        has_turha: data.has_turha || false,
        has_secondary_turha: data.has_secondary_turha || false,
        tailoring_cost: data.tailoring_cost || 0,
        packaging_cost: data.packaging_cost || 0,
        delivery_cost: data.delivery_cost || 0,
        extra_expenses: data.extra_expenses || 0,
        fixed_costs: data.fixed_costs || 0,
        profit_margin: data.profit_margin || 30,
        marketing_costs: data.marketing_costs || 0,
        marketing_type: data.marketing_type || 'fixed',
        target_segment: data.target_segment || 'medium',
        target_audience: data.target_audience || '',
        payment_gateway_fees: calculatedCosts.paymentGatewayFees,
        suggested_price: calculatedCosts.finalPrice,
        final_price: calculatedCosts.finalPrice,
        created_at: new Date().toISOString()
      }

      console.log('بيانات التسعير:', pricingData)

      let pricingError;
      
      // إذا كان هناك تسعير سابق، نقوم بالتحديث
      if (existingPricing?.id) {
        console.log('تحديث التسعير الحالي:', existingPricing.id)
        const { error } = await supabase
          .from('pricings')
          .update(pricingData)
          .eq('id', existingPricing.id)
          
        pricingError = error
      } else {
        // إنشاء تسعير جديد
        console.log('إنشاء تسعير جديد')
        const { error } = await supabase
          .from('pricings')
          .insert([pricingData])
          
        pricingError = error
      }

      if (pricingError) {
        console.error('تفاصيل خطأ التسعير:', pricingError)
        toast.error(`حدث خطأ أثناء حفظ التسعير: ${pricingError.message}`)
        return
      }

      // تحديث حالة المنتج
      console.log('تحديث حالة المنتج')
      const { error: productError } = await supabase
        .from('products')
        .update({ 
          has_pricing: true,
          price: calculatedCosts.finalPrice,
          initial_price: calculatedCosts.directCosts
        })
        .eq('id', selectedProduct.id)

      if (productError) {
        console.error('تفاصيل خطأ تحديث المنتج:', productError)
        toast.error(`تم حفظ التسعير ولكن حدث خطأ أثناء تحديث حالة المنتج: ${productError.message}`)
        return
      }

      console.log('تم الحفظ بنجاح')
      toast.success('تم حفظ التسعير بنجاح')
      
      // تحديث واجهة المستخدم
      setSelectedProduct({
        ...selectedProduct,
        has_pricing: true,
        price: calculatedCosts.finalPrice,
        initial_price: calculatedCosts.directCosts
      })

      // إغلاق النافذة إذا طلب ذلك
      if (onClose) {
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('خطأ في حفظ التسعير:', error)
      if (error instanceof Error) {
        toast.error(`حدث خطأ غير متوقع: ${error.message}`)
      } else {
        toast.error('حدث خطأ غير متوقع أثناء حفظ التسعير')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPricingComplete = () => {
    const requiredFields = [
      watchRequiredFields.fabric_main_cost,
      watchRequiredFields.tailoring_cost,
      watchRequiredFields.packaging_cost,
      watchRequiredFields.profit_margin
    ]
    return requiredFields.every(field => field && field > 0)
  }

  // بيانات المنتج الأساسية
  const [productName, setProductName] = useState("")
  const [productCode, setProductCode] = useState("")
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
  const [showPricingDetails, setShowPricingDetails] = useState(false)
  
  // متوسط سعر المنافسين
  const [competitorAvgPrice, setCompetitorAvgPrice] = useState(0)
  
  // التكاليف الأساسية
  const [fabricMainCost, setFabricMainCost] = useState(0)
  const [fabricPricePerMeter, setFabricPricePerMeter] = useState(0)
  const [fabricQuantity, setFabricQuantity] = useState(0)
  const [hasSecondaryFabric, setHasSecondaryFabric] = useState(false)
  const [fabricSecondaryCost, setFabricSecondaryCost] = useState(0)
  
  // الطرحة
  const [hasTurha, setHasTurha] = useState(false)
  const [turhaMainCost, setTurhaMainCost] = useState(0)
  const [hasSecondaryTurha, setHasSecondaryTurha] = useState(false)
  const [turhaSecondaryCost, setTurhaSecondaryCost] = useState(0)
  
  // تكاليف الخياطة
  const [tailoringCost, setTailoringCost] = useState(0)
  const [embroideryDetails, setEmbroideryDetails] = useState({
    hasEmbroidery: false,
    embroideryCost: 0
  })
  
  // التكاليف الإضافية
  const [packagingCost, setPackagingCost] = useState(0)
  const [deliveryCost, setDeliveryCost] = useState(0)
  const [extraExpenses, setExtraExpenses] = useState(0)
  
  // تكلفة التسويق
  const [marketingCostType, setMarketingCostType] = useState<"percentage" | "fixed">("fixed")
  const [marketingCostPercentage, setMarketingCostPercentage] = useState(0)
  const [marketingCostFixed, setMarketingCostFixed] = useState(0)
  
  // الربحية والفئة المستهدفة
  const [profitMargin, setProfitMargin] = useState(30)
  const [targetSegment, setTargetSegment] = useState("")

  // التحقق من اكتمال البيانات المطلوبة
  const [isFormComplete, setIsFormComplete] = useState(false)
  
  // حساب التكاليف الثابتة
  const fixedCosts = 35

  // تحديث سعر القماش الرئيسي عند تغيير الكمية أو السعر
  useEffect(() => {
    if (fabricPricePerMeter > 0 && fabricQuantity > 0) {
      setFabricMainCost(fabricPricePerMeter * fabricQuantity);
    }
  }, [fabricPricePerMeter, fabricQuantity]);

  // إدارة تغييرات كمية القماش
  const handleFabricQuantityChange = (quantity: number) => {
    setFabricQuantity(quantity);
  };

  // حساب تكلفة التسويق
  const calculatedMarketingCost = marketingCostType === "percentage" 
    ? ((fabricMainCost + (hasSecondaryFabric ? fabricSecondaryCost : 0) + 
        (hasTurha ? turhaMainCost : 0) + (hasSecondaryTurha ? turhaSecondaryCost : 0) + 
        tailoringCost + packagingCost + deliveryCost + extraExpenses + 
        (embroideryDetails.hasEmbroidery ? embroideryDetails.embroideryCost : 0)) * marketingCostPercentage / 100)
    : marketingCostFixed

  // التحقق من اكتمال البيانات المطلوبة
  useEffect(() => {
    const isComplete = productName.trim() !== "" && fabricMainCost > 0 && tailoringCost > 0;
    setIsFormComplete(isComplete);
  }, [productName, fabricMainCost, tailoringCost]);

  // احتساب السعر
  const calculatePrice = () => {
    const directCosts = [
      fabricMainCost, 
      hasSecondaryFabric ? fabricSecondaryCost : 0,
      hasTurha ? turhaMainCost : 0,
      hasSecondaryTurha ? turhaSecondaryCost : 0,
      tailoringCost,
      embroideryDetails.hasEmbroidery ? embroideryDetails.embroideryCost : 0,
      packagingCost,
      deliveryCost,
      extraExpenses,
      fixedCosts,
      calculatedMarketingCost
    ].reduce((sum, cost) => sum + cost, 0);
    
    const profitAmount = (directCosts * profitMargin) / 100;
    const priceBeforeFees = directCosts + profitAmount;
    
    // حساب رسوم قنوات الدفع (تمارا وتابي)
    const paymentGatewayFees = 1.50 + (priceBeforeFees * 0.0699); // 1.50 ريال ثابت + 6.99% من السعر
    
    const finalPrice = priceBeforeFees + paymentGatewayFees;
    
    setCalculatedPrice(finalPrice);
    setSuggestedPrice(roundToNearest5(finalPrice));
    setShowPricingDetails(true);
  };

  const handleSavePrice = () => {
    console.log("Saving price to database...");
    alert("تم حفظ السعر بنجاح!");
  };

  // التعامل مع تحديثات أسعار المنافسين
  const handleCompetitorsUpdate = (avgPrice: number) => {
    setCompetitorAvgPrice(avgPrice);
  };

  // تعديل دالة handleInputChange لتجنب التحديثات المتكررة
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    
    // تحديث القيمة في النموذج
    setValue(name as keyof PricingFormData, numValue);
    
    // تحديث التكاليف مباشرة
    setCosts(prev => {
      const newCosts = { ...prev };
      switch (name) {
        case 'fabric_main_cost':
          newCosts.fabricMainCost = numValue;
          break;
        case 'fabric_secondary_cost':
          newCosts.fabricSecondaryCost = numValue;
          break;
        case 'turha_main_cost':
          newCosts.turhaMainCost = numValue;
          break;
        case 'turha_secondary_cost':
          newCosts.turhaSecondaryCost = numValue;
          break;
        case 'tailoring_cost':
          newCosts.tailoringCost = numValue;
          break;
        case 'packaging_cost':
          newCosts.packagingCost = numValue;
          break;
        case 'delivery_cost':
          newCosts.deliveryCost = numValue;
          break;
        case 'extra_expenses':
          newCosts.extraExpenses = numValue;
          break;
        case 'fixed_costs':
          newCosts.fixedCosts = numValue;
          break;
      }
      return newCosts;
    });
  };

  // تعديل دالة handleProfitMarginChange
  const handleProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValue('profit_margin', value);
    setProfitMargin(value);
  };

  // تعديل دالة handleTargetSegmentChange
  const handleTargetSegmentChange = (value: "economic" | "medium" | "luxury") => {
    setValue('target_segment', value);
    setTargetSegment(value);
  };

  // تعديل دالة handleMarketingCostsChange
  const handleMarketingCostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setValue('marketing_costs', value);
    setCosts(prev => ({
      ...prev,
      marketingCost: value
    }));
  };

  // حالة اختيار المنتج
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // وظيفة لمعالجة اختيار منتج
  const handleProductSelected = async (productId: string): Promise<void> => {
    try {
      setIsInitialLoading(true);
      
      // في حالة كان المكون مدمجًا في الصفحة، نخفي محدد المنتج ونستمر في التسعير
      if (isProductSelectorVisible) {
        setIsProductSelectorVisible(false);
        
        // إضافة معرف المنتج إلى عنوان URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('product_id', productId);
        window.history.pushState({}, '', newUrl);
      }
      
      const supabase = createClientComponentClient()
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        toast.error('حدث خطأ أثناء تحميل بيانات المنتج')
        return
      }

      if (!product) {
        toast.error('لم يتم العثور على المنتج')
        return
      }

      setSelectedProduct(product)
      setValue('sku', product.sku || '')
      setValue('category', product.category || '')
      
      // تحميل بيانات التسعير السابقة إذا وجدت
      const { data: existingPricing, error: pricingError } = await supabase
        .from('pricings')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (!pricingError && existingPricing) {
        // تحديث النموذج ببيانات التسعير السابقة
        setValue('fabric_main_cost', existingPricing.fabric_main_cost)
        setValue('has_secondary_fabric', existingPricing.has_secondary_fabric)
        setValue('fabric_secondary_cost', existingPricing.fabric_secondary_cost)
        setValue('has_turha', existingPricing.has_turha)
        setValue('turha_main_cost', existingPricing.turha_main_cost)
        setValue('has_secondary_turha', existingPricing.has_secondary_turha)
        setValue('turha_secondary_cost', existingPricing.turha_secondary_cost)
        setValue('tailoring_cost', existingPricing.tailoring_cost)
        setValue('packaging_cost', existingPricing.packaging_cost)
        setValue('delivery_cost', existingPricing.delivery_cost)
        setValue('extra_expenses', existingPricing.extra_expenses)
        setValue('fixed_costs', existingPricing.fixed_costs)
        setValue('profit_margin', existingPricing.profit_margin)
        setValue('marketing_costs', existingPricing.marketing_costs)
        setValue('marketing_type', existingPricing.marketing_type)
        setValue('target_segment', existingPricing.target_segment)
        setValue('target_audience', existingPricing.target_audience)
      }

      toast.success('تم تحميل بيانات المنتج بنجاح')
    } catch (err) {
      console.error('Error loading product:', err)
      toast.error('حدث خطأ أثناء تحميل بيانات المنتج')
    } finally {
      setIsInitialLoading(false)
    }
  }

  // التعامل مع العودة لاختيار منتج آخر
  const handleChangeProduct = () => {
    setSelectedProduct(null);
    setValue('sku', '');
    setValue('category', '');
    setIsProductSelectorVisible(true);
    
    // حذف معرف المنتج من عنوان URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('product_id');
    window.history.pushState({}, '', newUrl);
  }

  // التأكد من وجود معرف المنتج، وإلا إظهار محدد المنتج
  useEffect(() => {
    if (productId) {
      setIsInitialLoading(true);
      handleProductSelected(productId).finally(() => {
        setIsInitialLoading(false);
      });
    }
  }, [productId]);

  // في حالة كانت صفحة اختيار المنتج مرئية، نعرض مكون اختيار المنتج
  if (isProductSelectorVisible) {
    return (
      <div className="container mx-auto py-8">
        <ProductSelectorStep 
          onProductSelected={handleProductSelected}
          onClose={onClose}
        />
      </div>
    );
  }

  // إضافة حالة التحميل في بداية الرندر
  if (isInitialLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2 order-2 lg:order-1">
        {/* معلومات المنتج */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-l from-indigo-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">معلومات المنتج</h2>
                <p className="text-sm text-gray-500 mt-1">معلومات المنتج الذي تقوم بتسعيره</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="p-6">
            {selectedProduct ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 flex flex-wrap items-center gap-2">
                        {selectedProduct.name}
                        {selectedProduct.category && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {selectedProduct.category}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">SKU: {selectedProduct.sku || 'غير محدد'}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangeProduct}
                  >
                    تغيير المنتج
                  </Button>
                </div>
                {selectedProduct.has_pricing && (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <Check className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      هذا المنتج تم تسعيره مسبقاً وأنت تقوم بتعديل التسعير الحالي.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-5 text-center sm:flex sm:items-center sm:text-right sm:justify-between sm:p-6">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">لم يتم اختيار منتج بعد</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-md">
                      يجب عليك اختيار منتج موجود لاستكمال عملية التسعير أو إنشاء منتج جديد
                    </p>
                  </div>
                  <img src="/placeholder-product.svg" alt="اختر منتج" className="h-24 w-24 mx-auto sm:mx-0" />
                </div>

                <Button
                  variant="default"
                  className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                  onClick={() => setIsProductSelectorVisible(true)}
                >
                  <Package className="h-5 w-5" />
                  <span>اختيار منتج</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* باقي النموذج يظهر فقط عند اختيار منتج */}
        {selectedProduct && (
          <>
            {/* التكاليف الأساسية */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Scissors className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold">التكاليف الأساسية</h3>
              </div>
              <div className="space-y-4">
                {/* كرت تكاليف القماش */}
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">تكاليف القماش</h4>
                    <div>
                      <Label>
                        تكلفة القماش الرئيسي
                        <Badge className="me-2" variant="secondary">مطلوب</Badge>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("fabric_main_cost", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="has_secondary_fabric"
                          checked={watchRequiredFields.has_secondary_fabric}
                          onCheckedChange={(checked) => {
                            setValue('has_secondary_fabric', checked);
                            if (!checked) setValue('fabric_secondary_cost', 0);
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
                              className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                              placeholder="0.00"
                              dir="ltr"
                            />
                            <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                              ريال
                            </span>
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
                          setValue('has_turha', checked);
                          if (!checked) {
                            setValue('turha_main_cost', 0);
                            setValue('has_secondary_turha', false);
                            setValue('turha_secondary_cost', 0);
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
                              className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                              placeholder="0.00"
                              dir="ltr"
                            />
                            <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                              ريال
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              id="has_secondary_turha"
                              checked={watchRequiredFields.has_secondary_turha}
                              onCheckedChange={(checked) => {
                                setValue('has_secondary_turha', checked);
                                if (!checked) setValue('turha_secondary_cost', 0);
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
                                  className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                                  placeholder="0.00"
                                  dir="ltr"
                                />
                                <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
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

                {/* كرت تكاليف الخياطة */}
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">تكاليف الخياطة</h4>
                    <div>
                      <Label>
                        تكلفة الخياطة
                        <Badge className="me-2" variant="secondary">مطلوب</Badge>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("tailoring_cost", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* تكاليف التغليف والتوصيل */}
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">تكاليف التغليف والتوصيل</h4>
                    
                    <div>
                      <Label>تكلفة التغليف</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("packaging_cost", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>تكلفة التوصيل</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("delivery_cost", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* تكاليف إضافية */}
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">تكاليف إضافية</h4>
                    
                    <div>
                      <Label>مصاريف إضافية أخرى</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("extra_expenses", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>التكاليف الثابتة</Label>
                      <div className="relative mt-1.5">
                        <Input
                          type="number"
                          step="0.01"
                          {...register("fixed_costs", { valueAsNumber: true })}
                          className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                          placeholder="0.00"
                          defaultValue="35"
                          dir="ltr"
                        />
                        <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                          ريال
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* هامش الربح والتسويق */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <CircleDollarSign className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold">الربحية والتسويق</h3>
              </div>
              <div className="space-y-4">
                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">هامش الربح</h4>
                    
                    <div className="space-y-2">
                      <Label>
                        نسبة هامش الربح
                        <Badge className="me-2" variant="secondary">مطلوب</Badge>
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          {...register("profit_margin", { valueAsNumber: true })}
                          className="text-center"
                          placeholder="30"
                          dir="ltr"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[15, 20, 25, 30, 35, 40, 45, 50].map(value => (
                          <Button 
                            key={value}
                            variant={watchRequiredFields.profit_margin === value ? "secondary" : "outline"} 
                            size="sm"
                            onClick={() => setValue("profit_margin", value)}
                            className={watchRequiredFields.profit_margin === value ? "bg-indigo-100 border-indigo-300" : ""}
                          >
                            {value}%
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/30">
                  <div className="space-y-4">
                    <h4 className="font-medium border-b pb-2">تكاليف التسويق</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <Label htmlFor="marketing_type">نوع تكلفة التسويق</Label>
                        <Select
                          value={watchRequiredFields.marketing_type}
                          onValueChange={(value: "fixed" | "percentage") => setValue("marketing_type", value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="اختر نوع التكلفة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                            <SelectItem value="percentage">نسبة مئوية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {watchRequiredFields.marketing_type === "fixed" ? (
                        <div>
                          <Label>تكلفة التسويق (مبلغ ثابت)</Label>
                          <div className="relative mt-1.5">
                            <Input
                              type="number"
                              step="0.01"
                              {...register("marketing_costs", { valueAsNumber: true })}
                              className={document.documentElement.dir === "rtl" ? "pe-16" : "ps-16"}
                              placeholder="0.00"
                              dir="ltr"
                            />
                            <span className={`absolute ${document.documentElement.dir === "rtl" ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500`}>
                              ريال
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>تكلفة التسويق (نسبة مئوية)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              {...register("marketing_costs", { valueAsNumber: true })}
                              className="text-center"
                              placeholder="0"
                              dir="ltr"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </>
        )}
        
        {/* زر حساب وحفظ السعر */}
        {selectedProduct && (
          <div className="flex items-center justify-center gap-4 mb-8 lg:mb-0 sticky bottom-0 py-3 bg-white/80 backdrop-blur-sm border-t lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting || !isPricingComplete()}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 me-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className={`h-4 w-4 ${document.documentElement.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  حساب وحفظ السعر
                </>
              )}
            </Button>
          </div>
        )}
      </form>

      {/* عرض التفاصيل والسعر النهائي - نقدم للموبايل ليظهر أولا */}
      {selectedProduct && (
        <div className="lg:col-span-1 order-1 lg:order-2">
          <CostDetailsCard costs={costs} />
        </div>
      )}
    </div>
  )
}
// تعديل حساب التكاليف
const calculateCosts = (data: PricingFormData): Costs => {
  const directCosts = (data.fabric_main_cost || 0) +
    (data.fabric_secondary_cost || 0) +
    (data.turha_main_cost || 0) +
    (data.turha_secondary_cost || 0) +
    (data.tailoring_cost || 0) +
    (data.packaging_cost || 0) +
    (data.delivery_cost || 0) +
    (data.extra_expenses || 0);

  const fixedCosts = data.fixed_costs || 0;
  
  // حساب تكلفة التسويق بناءً على النوع
  const marketingCost = data.marketing_type === 'percentage'
    ? (directCosts * (data.marketing_costs || 0) / 100)
    : (data.marketing_costs || 0);

  const profitAmount = (directCosts + marketingCost + fixedCosts) * (data.profit_margin / 100);
  const priceBeforeFees = directCosts + marketingCost + fixedCosts + profitAmount;
  
  // حساب رسوم قنوات الدفع (تمارا وتابي)
  const paymentGatewayFees = 1.50 + (priceBeforeFees * 0.0699); // 1.50 ريال ثابت + 6.99% من السعر
  
  const finalPrice = priceBeforeFees + paymentGatewayFees;

  return {
    fabricMainCost: data.fabric_main_cost || 0,
    fabricSecondaryCost: data.fabric_secondary_cost || 0,
    turhaMainCost: data.turha_main_cost || 0,
    turhaSecondaryCost: data.turha_secondary_cost || 0,
    tailoringCost: data.tailoring_cost || 0,
    packagingCost: data.packaging_cost || 0,
    deliveryCost: data.delivery_cost || 0,
    extraExpenses: data.extra_expenses || 0,
    fixedCosts: fixedCosts,
    directCosts: directCosts,
    marketingCost: marketingCost,
    profitAmount: profitAmount,
    paymentGatewayFees: paymentGatewayFees,
    finalPrice: finalPrice
  };
};
