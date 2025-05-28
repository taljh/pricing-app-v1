"use client"

import { useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface SmartPricingCardProps {
  directCosts: number
  finalPrice: number
  profitMargin: number
  targetSegment: "economic" | "medium" | "luxury"
  suggestedPrice: number
  isPriceInRange: boolean
  productId?: string // معرف المنتج للبيانات الديناميكية
}

const segmentRanges = {
  economic: { min: 100, max: 300, color: "green" },
  medium: { min: 301, max: 700, color: "blue" },
  luxury: { min: 701, max: 1500, color: "purple" },
}

export default function SmartPricingCard({
  directCosts,
  finalPrice,
  profitMargin,
  targetSegment,
  suggestedPrice,
  isPriceInRange,
  productId
}: SmartPricingCardProps) {
  const [animate, setAnimate] = useState(false)
  const [marketData, setMarketData] = useState({
    averagePrice: 0,
    minimumPrice: 0,
    maximumPrice: 0,
    competitorCount: 0,
  })
  const [salesProjection, setSalesProjection] = useState({
    estimated: 0,
    revenue: 0,
    profit: 0
  })
  const [activeTab, setActiveTab] = useState("pricing")
  const [isLoading, setIsLoading] = useState(false)

  // التحرك انيميشن عند تغير السعر النهائي
  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => setAnimate(false), 1000)
    return () => clearTimeout(timer)
  }, [finalPrice])
  
  // جلب بيانات السوق إذا تم تحديد معرف المنتج
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        // أولاً: جلب بيانات المنتج للحصول على الفئة
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("category")
          .eq("id", productId)
          .single();
          
        if (productError) throw productError;
        
        const category = productData?.category;
        
        if (category) {
          // جلب منتجات مشابهة من نفس الفئة
          const { data: similarProducts, error: similarError } = await supabase
            .from("products")
            .select("price, initial_price")
            .eq("category", category)
            .not("id", "eq", productId)
            .limit(20);
            
          if (similarError) throw similarError;
          
          if (similarProducts && similarProducts.length > 0) {
            // استخراج الأسعار (إما price أو initial_price إذا كان price غير متوفر)
            const prices = similarProducts.map(p => p.price || p.initial_price).filter(Boolean);
            
            if (prices.length > 0) {
              const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              
              setMarketData({
                averagePrice: avg,
                minimumPrice: min,
                maximumPrice: max,
                competitorCount: prices.length
              });
              
              // تقدير المبيعات المتوقعة بناءً على معدل سعر السوق ونسبة السعر
              const priceRatio = finalPrice / avg;
              let estimatedSales = 0;
              
              if (priceRatio <= 0.8) {
                estimatedSales = 100; // سعر منخفض: مبيعات عالية
              } else if (priceRatio <= 1.0) { 
                estimatedSales = 75; // سعر متوسط: مبيعات جيدة
              } else if (priceRatio <= 1.2) {
                estimatedSales = 50; // سعر أعلى قليلاً: مبيعات معقولة
              } else {
                estimatedSales = 30; // سعر مرتفع: مبيعات منخفضة
              }
              
              setSalesProjection({
                estimated: estimatedSales,
                revenue: estimatedSales * finalPrice,
                profit: estimatedSales * (finalPrice - directCosts)
              });
            }
          }
        }
      } catch (err) {
        console.error("خطأ في جلب بيانات السوق:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
  }, [productId, finalPrice, directCosts]);

  // حساب النسبة المئوية للسعر ضمن نطاق الفئة المستهدفة
  const pricePercentage = useMemo(() => {
    const range = segmentRanges[targetSegment]
    const totalRange = range.max - range.min
    const position = Math.min(Math.max(finalPrice - range.min, 0), totalRange)
    return (position / totalRange) * 100
  }, [finalPrice, targetSegment])

  // تحديد حالة السعر (منخفض، مناسب، مرتفع)
  const priceStatus = useMemo(() => {
    const range = segmentRanges[targetSegment]
    if (finalPrice < range.min) return "low"
    if (finalPrice > range.max) return "high"
    return "optimal"
  }, [finalPrice, targetSegment])

  // حساب موقع السعر نسبة للسوق
  const marketPositioning = useMemo(() => {
    if (!marketData.averagePrice) return null;
    
    const priceRatio = finalPrice / marketData.averagePrice;
    
    if (priceRatio < 0.8) return {
      position: "low",
      message: "سعرك أقل من متوسط السوق، قد يُنظر إليه على أنه خيار اقتصادي",
      color: "amber"
    };
    else if (priceRatio <= 1.1) return {
      position: "average",
      message: "سعرك مناسب ومتوافق مع متوسط السوق",
      color: "emerald" 
    };
    else return {
      position: "high",
      message: "سعرك أعلى من متوسط السوق، تأكد من تقديم قيمة إضافية",
      color: "blue"
    };
  }, [finalPrice, marketData.averagePrice]);

  // تحديد لون ورسالة النصيحة
  const advice = useMemo(() => {
    const range = segmentRanges[targetSegment]

    if (priceStatus === "low") {
      return {
        color: "amber",
        message: `السعر منخفض للفئة المستهدفة. حاول زيادة هامش الربح أو مراجعة التكاليف.`,
      }
    } else if (priceStatus === "high") {
      return {
        color: "red",
        message: `السعر مرتفع للفئة المستهدفة. فكر في تخفيض هامش الربح أو التكاليف.`,
      }
    } else {
      const position = finalPrice / range.max
      if (position < 0.33) {
        return {
          color: "emerald",
          message: "السعر مناسب في النطاق الأدنى للفئة المستهدفة.",
        }
      } else if (position < 0.66) {
        return {
          color: "emerald",
          message: "السعر مثالي في منتصف النطاق للفئة المستهدفة.",
        }
      } else {
        return {
          color: "emerald",
          message: "السعر في النطاق الأعلى للفئة المستهدفة.",
        }
      }
    }
  }, [finalPrice, priceStatus, targetSegment])

  // حساب نقطة التعادل
  const breakEvenCalculation = useMemo(() => {
    const breakEvenUnits = Math.ceil(directCosts / (finalPrice - (directCosts * 0.3))); // افتراض أن 30% من التكاليف المباشرة هي تكاليف متغيرة
    const breakEvenRevenue = breakEvenUnits * finalPrice;
    
    return {
      units: breakEvenUnits,
      revenue: breakEvenRevenue
    };
  }, [directCosts, finalPrice]);

  // الوان بناء على الفئة المستهدفة
  const segmentColor = segmentRanges[targetSegment].color
  const segmentColorMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      light: "text-green-600",
      progress: "bg-green-500",
      gradient: "from-green-500/10 to-green-500/5",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      light: "text-blue-600",
      progress: "bg-blue-500",
      gradient: "from-blue-500/10 to-blue-500/5",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      light: "text-purple-600",
      progress: "bg-purple-500",
      gradient: "from-purple-500/10 to-purple-500/5",
    },
  }

  const colors = segmentColorMap[segmentColor as keyof typeof segmentColorMap]

  // التحقق إذا كان المنتج غير مسعّر
  const isPriced = useMemo(() => finalPrice > 0, [finalPrice]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={`overflow-hidden border-2 ${colors.border} shadow-lg`}>
        {/* رأس البطاقة */}
        <div className={`bg-gradient-to-r ${colors.gradient} p-6`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                تحليل التسعير الذكي
              </h3>
              <p className="text-sm text-gray-600">التسعير المقترح للفئة المستهدفة</p>
            </div>
            <Badge className={`${colors.bg} ${colors.text} border px-3 py-1 rounded-full font-semibold`}>
              {targetSegment === "economic" ? "اقتصادية" : targetSegment === "medium" ? "متوسطة" : "فاخرة"}
            </Badge>
          </div>
        </div>

        {/* محتوى البطاقة */}
        <div className="p-6 bg-white">
          {isPriced ? (
            <div>
              {/* عرض البيانات المتعلقة بالتسعير */}
              <p className="text-sm text-gray-500 mb-1">السعر النهائي</p>
              <p className="text-xl font-bold text-gray-900">{finalPrice.toFixed(2)} ريال</p>
            </div>
          ) : (
            <div className="text-center">
              {/* زر تسعير المنتج */}
              <p className="text-sm text-gray-500 mb-3">هذا المنتج غير مسعّر</p>
              <Button className="bg-indigo-500 text-white px-4 py-2 rounded-lg">تسعير المنتج</Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}