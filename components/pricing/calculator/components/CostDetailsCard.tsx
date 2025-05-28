"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CircleDollarSign, CalendarCheck, TrendingUp, BarChart3, ArrowRight, Download, Share2 } from "lucide-react"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"
import { useState } from "react"
import { ArabicNumber, formatPrice, formatNumber } from "@/components/ui/arabic-number"

interface Costs {
  fabricMainCost?: number;
  fabricSecondaryCost?: number;
  turhaMainCost?: number;
  turhaSecondaryCost?: number;
  tailoringCost?: number;
  packagingCost?: number;
  deliveryCost?: number;
  extraExpenses?: number;
  fixedCosts?: number;
  directCosts?: number;
  marketingCost?: number;
  profitAmount?: number;
  paymentGatewayFees?: number;
  finalPrice?: number;
}

interface CostDetailsCardProps {
  costs: Costs;
}

const CostDetailsCard = ({ costs }: CostDetailsCardProps) => {
  const { isMobile } = useScreenInfo();
  const { isRTL, flipIcon } = useRTL();
  const [showShareOptions, setShowShareOptions] = useState(false);

  // حساب نسبة الربح المئوية
  const calculateProfitPercentage = () => {
    if (!costs.directCosts || !costs.profitAmount || costs.directCosts === 0) return 0;
    return (costs.profitAmount / costs.directCosts) * 100;
  };

  // تحديد لون الشريط بناءً على السعر النهائي
  const getPriceBadgeColor = () => {
    const finalPrice = costs.finalPrice || 0;
    if (finalPrice < 300) return "bg-green-100 text-green-800 border-green-200";
    if (finalPrice < 600) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };
  
  // تحديد فئة المنتج بناء على السعر
  const getProductCategory = () => {
    const finalPrice = costs.finalPrice || 0;
    if (finalPrice < 300) return 'فئة اقتصادية';
    if (finalPrice < 600) return 'فئة متوسطة';
    return 'فئة فاخرة';
  };

  return (
    <Card className="shadow-md h-full sticky top-4">
      <CardHeader className="bg-gradient-to-l from-indigo-50 to-white border-b pb-5 border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">ملخص التسعير</CardTitle>
          <div className="bg-indigo-50 rounded-lg p-2">
            <CircleDollarSign className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          {/* السعر النهائي */}
          <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-800 mb-1">السعر النهائي المقترح</h3>
            <div className="text-3xl font-bold text-indigo-900">
              <ArabicNumber 
                value={Math.round(costs.finalPrice || 0)} 
                currency={true}
                className="rtl:text-3xl ltr:text-2xl"
              />
            </div>
            <Badge variant="outline" className={`mt-2 ${getPriceBadgeColor()}`}>
              {getProductCategory()}
            </Badge>
          </div>

          {/* تفاصيل التكاليف الرئيسية */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 inline-block ms-1" />
              تفاصيل التكاليف الرئيسية
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تكلفة القماش:</span>
                <span className="font-medium">
                  <ArabicNumber 
                    value={(costs.fabricMainCost || 0) + (costs.fabricSecondaryCost || 0)} 
                    currency={true} 
                  />
                </span>
              </div>
              {(costs.turhaMainCost || costs.turhaSecondaryCost) ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة الطرحة:</span>
                  <span className="font-medium">
                    <ArabicNumber 
                      value={(costs.turhaMainCost || 0) + (costs.turhaSecondaryCost || 0)} 
                      currency={true}
                    />
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-gray-600">تكلفة الخياطة:</span>
                <span className="font-medium">
                  <ArabicNumber value={costs.tailoringCost || 0} currency={true} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تكلفة التغليف:</span>
                <span className="font-medium">
                  <ArabicNumber value={costs.packagingCost || 0} currency={true} />
                </span>
              </div>
              {costs.deliveryCost ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة التوصيل:</span>
                  <span className="font-medium">
                    <ArabicNumber value={costs.deliveryCost || 0} currency={true} />
                  </span>
                </div>
              ) : null}
              {costs.extraExpenses ? (
                <div className="flex justify-between">
                  <span className="text-gray-600">مصاريف إضافية:</span>
                  <span className="font-medium">
                    <ArabicNumber value={costs.extraExpenses || 0} currency={true} />
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-gray-600">تكاليف ثابتة:</span>
                <span className="font-medium">
                  <ArabicNumber value={costs.fixedCosts || 0} currency={true} />
                </span>
              </div>
            </div>
          </div>

          {/* ملخص التكاليف */}
          <div>
            <Separator className="my-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">إجمالي التكاليف المباشرة:</span>
                <span className="font-semibold">
                  <ArabicNumber value={costs.directCosts || 0} currency={true} />
                </span>
              </div>
              {costs.marketingCost ? (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">تكاليف التسويق:</span>
                  <span className="font-semibold">
                    <ArabicNumber value={costs.marketingCost || 0} currency={true} />
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  مبلغ الربح <span className="text-xs text-gray-500">({calculateProfitPercentage().toFixed(0)}%)</span>:
                </span>
                <span className="font-semibold text-green-600">
                  <ArabicNumber value={costs.profitAmount || 0} currency={true} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">رسوم قنوات الدفع:</span>
                <span className="font-semibold">
                  <ArabicNumber value={costs.paymentGatewayFees || 0} currency={true} />
                </span>
              </div>
            </div>
          </div>

          {/* إجمالي السعر النهائي */}
          <div className="bg-gray-50 p-3 rounded-lg mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-base">السعر النهائي:</span>
              <span className="font-bold text-base text-indigo-700">
                <ArabicNumber value={costs.finalPrice || 0} currency={true} />
              </span>
            </div>
          </div>

          {/* أزرار المشاركة والتصدير */}
          <div className="flex flex-wrap gap-2 pt-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex-1"
              onClick={() => {
                const calculatorData = {
                  date: new Date().toLocaleDateString('ar'),
                  costs: costs
                };
                try {
                  localStorage.setItem('pricing_calculator_results', JSON.stringify(calculatorData));
                  alert('تم حفظ البيانات بنجاح');
                } catch (error) {
                  console.error('Error saving data:', error);
                }
              }}
            >
              <CalendarCheck className="h-4 w-4 me-1" />
              حفظ التقرير
            </Button>
            
            <div className="relative w-full flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowShareOptions(!showShareOptions)}
              >
                <Share2 className="h-4 w-4 me-1" />
                مشاركة
              </Button>
              
              {showShareOptions && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white shadow-lg rounded-md border z-10">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-right mb-1"
                    onClick={() => {
                      try {
                        const text = `تقرير التسعير
التكلفة المباشرة: ${formatPrice(costs.directCosts || 0)}
هامش الربح: ${formatPrice(costs.profitAmount || 0)}
السعر النهائي: ${formatPrice(costs.finalPrice || 0)}`;
                        
                        navigator.clipboard.writeText(text);
                        alert('تم نسخ بيانات التسعير');
                        setShowShareOptions(false);
                      } catch (error) {
                        console.error('Error copying text:', error);
                      }
                    }}
                  >
                    نسخ كنص
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-right"
                    onClick={() => {
                      // في تطبيق حقيقي سيتم تصدير PDF
                      alert('سيتم تطوير هذه الميزة قريباً');
                      setShowShareOptions(false);
                    }}
                  >
                    تصدير كـ PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostDetailsCard;