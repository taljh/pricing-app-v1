"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, MinusCircle, Save, Calculator, Package, Tag, Scissors, FileText, PieChart, CircleDollarSign, Truck, CheckCircle2, Layers, BadgePercent } from "lucide-react"
import CostDetailsCard from "@/components/pricing/CostDetailsCard"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PricingCalculator() {
  // بيانات المنتج الأساسية
  const [productName, setProductName] = useState("")
  const [productCode, setProductCode] = useState("")
  const [currentTab, setCurrentTab] = useState("product-info")
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null)
  const [showPricingDetails, setShowPricingDetails] = useState(false)
  
  // التكاليف الأساسية
  const [fabricMainCost, setFabricMainCost] = useState(0)
  const [hasSecondaryFabric, setHasSecondaryFabric] = useState(false)
  const [fabricSecondaryCost, setFabricSecondaryCost] = useState(0)
  
  // الطرحة
  const [hasTurha, setHasTurha] = useState(false)
  const [turhaMainCost, setTurhaMainCost] = useState(0)
  const [hasSecondaryTurha, setHasSecondaryTurha] = useState(false)
  const [turhaSecondaryCost, setTurhaSecondaryCost] = useState(0)
  
  // تكاليف الخياطة
  const [tailoringCost, setTailoringCost] = useState(0)
  
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
  
  // حساب التكاليف الثابتة (يمكن تعديلها لاحقاً حسب متطلبات العمل)
  const fixedCosts = 35

  // حساب تكلفة التسويق
  const calculatedMarketingCost = marketingCostType === "percentage" 
    ? ((fabricMainCost + (hasSecondaryFabric ? fabricSecondaryCost : 0) + 
        (hasTurha ? turhaMainCost : 0) + (hasSecondaryTurha ? turhaSecondaryCost : 0) + 
        tailoringCost + packagingCost + deliveryCost + extraExpenses) * marketingCostPercentage / 100)
    : marketingCostFixed

  // التحقق من اكتمال البيانات المطلوبة
  useEffect(() => {
    // تحقق من إدخال اسم المنتج وسعر القماش الرئيسي وتكلفة الخياطة على الأقل
    const isComplete = productName.trim() !== "" && fabricMainCost > 0 && tailoringCost > 0;
    setIsFormComplete(isComplete);
  }, [productName, fabricMainCost, tailoringCost]);

  // احتساب السعر
  const calculatePrice = () => {
    // احتساب السعر
    const directCosts = [
      fabricMainCost, 
      hasSecondaryFabric ? fabricSecondaryCost : 0,
      hasTurha ? turhaMainCost : 0,
      hasSecondaryTurha ? turhaSecondaryCost : 0,
      tailoringCost,
      packagingCost,
      deliveryCost,
      extraExpenses,
      fixedCosts,
      calculatedMarketingCost
    ].reduce((sum, cost) => sum + cost, 0);
    
    const profitAmount = (directCosts * profitMargin) / 100;
    const finalPrice = directCosts + profitAmount;
    
    setCalculatedPrice(finalPrice);
    setShowPricingDetails(true);
  };

  const handleSavePrice = () => {
    // سيتم ربط هذا لاحقاً مع قاعدة البيانات
    console.log("Saving price to database...");
    // عرض رسالة نجاح
    alert("تم حفظ السعر بنجاح!");
  };

  // للتنقل بين التبويبات
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div dir="rtl" className="space-y-4">
      <div className="grid grid-cols-12 gap-6">
        {/* منطقة الإدخال */}
        <Card className="col-span-12 lg:col-span-7 border border-gray-200">
          <CardHeader className="pb-2 border-b bg-slate-50/50">
            <CardTitle className="text-base font-medium text-right">إدخال بيانات التسعير</CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* التبويبات */}
            <Tabs defaultValue="product-info" dir="rtl" className="w-full">
              <TabsList className="grid grid-cols-4 bg-slate-50 border-b p-0 h-auto rounded-none">
                <TabsTrigger 
                  value="product-info" 
                  className="py-3 px-0 h-auto rounded-none data-[state=active]:bg-white border-b-2 border-b-transparent data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span className="text-xs">بيانات المنتج</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="core-costs" 
                  className="py-3 px-0 h-auto rounded-none data-[state=active]:bg-white border-b-2 border-b-transparent data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Scissors className="h-4 w-4" />
                    <span className="text-xs">التكاليف الأساسية</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="extra-costs" 
                  className="py-3 px-0 h-auto rounded-none data-[state=active]:bg-white border-b-2 border-b-transparent data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">  
                    <Package className="h-4 w-4" />
                    <span className="text-xs">التكاليف الإضافية</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="profit" 
                  className="py-3 px-0 h-auto rounded-none data-[state=active]:bg-white border-b-2 border-b-transparent data-[state=active]:border-b-indigo-600 data-[state=active]:shadow-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <CircleDollarSign className="h-4 w-4" />
                    <span className="text-xs">الربحية</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-380px)]">
                <div className="p-5 space-y-3">
                  {/* بيانات المنتج */}
                  <TabsContent value="product-info" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium text-lg text-right">بيانات المنتج</h3>
                    </div>
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="productName" className="text-sm font-medium text-right">اسم العباية <span className="text-red-500">*</span></Label>
                          <Input 
                            id="productName" 
                            placeholder="مثال: عباية راز" 
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="productCode" className="text-sm font-medium text-right">رمز المنتج (اختياري)</Label>
                          <Input 
                            id="productCode" 
                            placeholder="أدخل رمز المنتج" 
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-1">
                        <Label htmlFor="targetSegment" className="text-sm font-medium text-right">الفئة المستهدفة</Label>
                        <Select value={targetSegment} onValueChange={setTargetSegment}>
                          <SelectTrigger className="bg-white text-right">
                            <SelectValue placeholder="اختر الفئة المستهدفة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">اقتصادية</SelectItem>
                            <SelectItem value="standard">متوسطة</SelectItem>
                            <SelectItem value="premium">فاخرة</SelectItem>
                            <SelectItem value="luxury">فائقة الفخامة</SelectItem>
                            <SelectItem value="custom">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="pt-3">
                      <Button 
                        onClick={() => document.querySelector('[data-value="core-costs"]')?.click()} 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        size="sm"
                      >
                        التالي: التكاليف الأساسية
                      </Button>
                    </div>
                  </TabsContent>

                  {/* التكاليف الأساسية */}
                  <TabsContent value="core-costs" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium text-lg text-right">التكاليف الأساسية</h3>
                    </div>

                    {/* تكاليف القماش */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">1</Badge>
                        <h4 className="text-base font-medium text-right">تكاليف القماش</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="fabricMainCost" className="text-sm font-medium text-right">
                              تكلفة القماش الرئيسي <span className="text-red-500">*</span>
                            </Label>
                            <Input 
                              id="fabricMainCost" 
                              type="number"
                              min="0"
                              placeholder="أدخل التكلفة بالريال" 
                              value={fabricMainCost || ""}
                              onChange={(e) => setFabricMainCost(Number(e.target.value))}
                              className="bg-white text-right"
                              dir="rtl"
                            />
                          </div>
                          
                          <div className="flex flex-col justify-end">
                            <div className="flex items-center space-x-reverse space-x-2">
                              <Switch 
                                id="hasSecondaryFabric" 
                                checked={hasSecondaryFabric}
                                onCheckedChange={setHasSecondaryFabric}
                              />
                              <Label htmlFor="hasSecondaryFabric" className="text-sm mr-2 text-right">إضافة قماش ثانوي</Label>
                            </div>
                          </div>
                        </div>
                        
                        {hasSecondaryFabric && (
                          <div className="grid grid-cols-1 gap-2 border-r-2 border-indigo-100 pr-3 mr-1 mt-2">
                            <Label htmlFor="fabricSecondaryCost" className="text-sm font-medium text-right">تكلفة القماش الثانوي</Label>
                            <Input 
                              id="fabricSecondaryCost" 
                              type="number"
                              min="0"
                              placeholder="أدخل التكلفة بالريال" 
                              value={fabricSecondaryCost || ""}
                              onChange={(e) => setFabricSecondaryCost(Number(e.target.value))}
                              className="bg-white text-right"
                              dir="rtl"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* تكاليف الطرحة */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">2</Badge>
                        <h4 className="text-base font-medium text-right">تكاليف الطرحة</h4>
                      </div>
                      
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Switch 
                          id="hasTurha" 
                          checked={hasTurha}
                          onCheckedChange={setHasTurha}
                        />
                        <Label htmlFor="hasTurha" className="text-sm mr-2 text-right">إضافة طرحة</Label>
                      </div>
                      
                      {hasTurha && (
                        <div className="space-y-3 border-r-2 border-indigo-100 pr-3 mr-1 mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-2">
                              <Label htmlFor="turhaMainCost" className="text-sm font-medium text-right">تكلفة الطرحة الرئيسية</Label>
                              <Input 
                                id="turhaMainCost" 
                                type="number"
                                min="0"
                                placeholder="أدخل التكلفة بالريال" 
                                value={turhaMainCost || ""}
                                onChange={(e) => setTurhaMainCost(Number(e.target.value))}
                                className="bg-white text-right"
                                dir="rtl"
                              />
                            </div>
                            
                            <div className="flex flex-col justify-end">
                              <div className="flex items-center space-x-reverse space-x-2">
                                <Switch 
                                  id="hasSecondaryTurha" 
                                  checked={hasSecondaryTurha}
                                  onCheckedChange={setHasSecondaryTurha}
                                />
                                <Label htmlFor="hasSecondaryTurha" className="text-sm mr-2 text-right">إضافة طرحة ثانوية</Label>
                              </div>
                            </div>
                          </div>
                          
                          {hasSecondaryTurha && (
                            <div className="grid grid-cols-1 gap-2 border-r-2 border-indigo-100 pr-3 mr-1 mt-2">
                              <Label htmlFor="turhaSecondaryCost" className="text-sm font-medium text-right">تكلفة الطرحة الثانوية</Label>
                              <Input 
                                id="turhaSecondaryCost" 
                                type="number"
                                min="0"
                                placeholder="أدخل التكلفة بالريال" 
                                value={turhaSecondaryCost || ""}
                                onChange={(e) => setTurhaSecondaryCost(Number(e.target.value))}
                                className="bg-white text-right"
                                dir="rtl"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* تكلفة الخياطة */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">3</Badge>
                        <h4 className="text-base font-medium text-right">تكلفة الخياطة</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="tailoringCost" className="text-sm font-medium text-right">
                            تكلفة الخياطة <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            id="tailoringCost" 
                            type="number"
                            min="0"
                            placeholder="أدخل التكلفة بالريال" 
                            value={tailoringCost || ""}
                            onChange={(e) => setTailoringCost(Number(e.target.value))}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <Button 
                        onClick={() => document.querySelector('[data-value="extra-costs"]')?.click()} 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        size="sm"
                      >
                        التالي: التكاليف الإضافية
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => document.querySelector('[data-value="product-info"]')?.click()}
                        size="sm"
                      >
                        السابق: بيانات المنتج
                      </Button>
                    </div>
                  </TabsContent>

                  {/* التكاليف الإضافية */}
                  <TabsContent value="extra-costs" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium text-lg text-right">التكاليف الإضافية</h3>
                    </div>

                    {/* تغليف وتوصيل */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">1</Badge>
                        <h4 className="text-base font-medium text-right">تكاليف التغليف والتوصيل</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="packagingCost" className="text-sm font-medium text-right">تكلفة التغليف</Label>
                          <Input 
                            id="packagingCost" 
                            type="number"
                            min="0"
                            placeholder="أدخل التكلفة بالريال" 
                            value={packagingCost || ""}
                            onChange={(e) => setPackagingCost(Number(e.target.value))}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="deliveryCost" className="text-sm font-medium text-right">تكلفة التوصيل</Label>
                          <Input 
                            id="deliveryCost" 
                            type="number"
                            min="0"
                            placeholder="أدخل التكلفة بالريال" 
                            value={deliveryCost || ""}
                            onChange={(e) => setDeliveryCost(Number(e.target.value))}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* مصاريف إضافية وتسويق */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">2</Badge>
                        <h4 className="text-base font-medium text-right">مصاريف إضافية والتسويق</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="extraExpenses" className="text-sm font-medium text-right">مصاريف إضافية أخرى</Label>
                          <Input 
                            id="extraExpenses" 
                            type="number"
                            min="0"
                            placeholder="أدخل التكلفة بالريال" 
                            value={extraExpenses || ""}
                            onChange={(e) => setExtraExpenses(Number(e.target.value))}
                            className="bg-white text-right"
                            dir="rtl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-right block">تكلفة التسويق</Label>
                          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border">
                            <div 
                              className={`flex items-center justify-center p-2 rounded cursor-pointer ${marketingCostType === "fixed" ? 'bg-indigo-100 border border-indigo-200' : 'bg-gray-50'}`}
                              onClick={() => setMarketingCostType("fixed")}
                            >
                              <CircleDollarSign className={`h-4 w-4 ml-1 ${marketingCostType === "fixed" ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <span className={`text-sm ${marketingCostType === "fixed" ? 'font-medium text-indigo-700' : 'text-gray-500'}`}>
                                مبلغ ثابت
                              </span>
                            </div>
                            <div 
                              className={`flex items-center justify-center p-2 rounded cursor-pointer ${marketingCostType === "percentage" ? 'bg-indigo-100 border border-indigo-200' : 'bg-gray-50'}`}
                              onClick={() => setMarketingCostType("percentage")}
                            >
                              <BadgePercent className={`h-4 w-4 ml-1 ${marketingCostType === "percentage" ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <span className={`text-sm ${marketingCostType === "percentage" ? 'font-medium text-indigo-700' : 'text-gray-500'}`}>
                                نسبة مئوية
                              </span>
                            </div>
                          </div>
                          
                          {marketingCostType === "fixed" ? (
                            <Input 
                              type="number"
                              min="0"
                              placeholder="أدخل المبلغ بالريال" 
                              value={marketingCostFixed || ""}
                              onChange={(e) => setMarketingCostFixed(Number(e.target.value))}
                              className="bg-white text-right"
                              dir="rtl"
                            />
                          ) : (
                            <div className="flex items-center justify-end">
                              <span>%</span>
                              <Input 
                                type="number"
                                min="0"
                                max="100"
                                placeholder="النسبة المئوية" 
                                value={marketingCostPercentage || ""}
                                onChange={(e) => setMarketingCostPercentage(Number(e.target.value))}
                                className="mr-2 text-right w-32"
                                dir="rtl"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between">
                      <Button 
                        onClick={() => document.querySelector('[data-value="profit"]')?.click()} 
                        className="bg-indigo-600 hover:bg-indigo-700"
                        size="sm"
                      >
                        التالي: الربحية
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => document.querySelector('[data-value="core-costs"]')?.click()}
                        size="sm"
                      >
                        السابق: التكاليف الأساسية
                      </Button>
                    </div>
                  </TabsContent>

                  {/* الربحية */}
                  <TabsContent value="profit" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-medium text-lg text-right">الربحية</h3>
                    </div>

                    {/* هامش الربح */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-600">1</Badge>
                        <h4 className="text-base font-medium text-right">هامش الربح</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="profitMargin" className="text-sm font-medium text-right block">حدد هامش الربح (نسبة مئوية)</Label>
                          <div className="flex items-center justify-end">
                            <span>%</span>
                            <Input 
                              id="profitMargin" 
                              type="number"
                              min="0"
                              max="100"
                              placeholder="أدخل النسبة" 
                              value={profitMargin || ""}
                              onChange={(e) => setProfitMargin(Number(e.target.value))}
                              className="mr-2 text-right w-32"
                              dir="rtl"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-right block">اختيارات سريعة</Label>
                          <div className="flex flex-wrap gap-2">
                            {[15, 20, 25, 30, 35, 40, 45, 50].map(value => (
                              <Button 
                                key={value}
                                variant={profitMargin === value ? "secondary" : "outline"} 
                                size="sm"
                                onClick={() => setProfitMargin(value)}
                                className={profitMargin === value ? "bg-indigo-100 border-indigo-300" : ""}
                              >
                                {value}%
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* معلومات التكاليف الثابتة */}
                    <div className="flex items-start p-4 rounded-md border border-blue-100 bg-blue-50">
                      <div className="text-blue-600 ml-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4"/>
                          <path d="M12 8h.01"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 text-right">التكاليف الثابتة</h4>
                        <p className="text-xs text-blue-700 mt-1 text-right">
                          تم إضافة التكاليف الثابتة تلقائياً للحساب ({fixedCosts} ريال).
                          يمكنك تعديل هذه القيمة من إعدادات المشروع لاحقاً.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => document.querySelector('[data-value="extra-costs"]')?.click()}
                        size="sm"
                      >
                        السابق: التكاليف الإضافية
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t py-3 px-5 bg-slate-50">
            <div className="flex gap-3 items-center">
              <Button
                onClick={calculatePrice}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!productName || fabricMainCost <= 0 || tailoringCost <= 0}
              >
                <Calculator className="ml-2 h-4 w-4" />
                احتساب السعر
              </Button>

              {isFormComplete && calculatedPrice && (
                <Button 
                  onClick={handleSavePrice} 
                  variant="outline" 
                  className="border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Save className="ml-2 h-4 w-4" />
                  حفظ السعر
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {(!productName || fabricMainCost <= 0 || tailoringCost <= 0) && (
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <span>يرجى إكمال البيانات المطلوبة</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
        
        {/* منطقة النتائج */}
        <div className="col-span-12 lg:col-span-5">
          {showPricingDetails ? (
            <CostDetailsCard
              fabricMainCost={fabricMainCost}
              fabricSecondaryCost={hasSecondaryFabric ? fabricSecondaryCost : null}
              turhaMainCost={hasTurha ? turhaMainCost : null}
              turhaSecondaryCost={hasSecondaryTurha ? turhaSecondaryCost : null}
              tailoringCost={tailoringCost}
              packagingCost={packagingCost}
              deliveryCost={deliveryCost}
              extraExpenses={extraExpenses}
              fixedCosts={fixedCosts}
              profitMargin={profitMargin}
            />
          ) : (
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 border border-gray-200">
              <div className="mb-4">
                <Calculator className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-500 mb-2">لم يتم احتساب السعر بعد</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                أكمل تعبئة البيانات المطلوبة ثم اضغط على زر "احتساب السعر" لعرض النتائج.
              </p>
              
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex items-center">
                  <Badge className="bg-gray-200 text-gray-500">1</Badge>
                  <div className="mr-2 flex-1">
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 ${productName ? 'text-green-500' : 'text-gray-200'}`} />
                </div>
                
                <div className="flex items-center">
                  <Badge className="bg-gray-200 text-gray-500">2</Badge>
                  <div className="mr-2 flex-1">
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                  </div>
                  <CheckCircle2 className={`h-5 w-5 ${fabricMainCost > 0 && tailoringCost > 0 ? 'text-green-500' : 'text-gray-200'}`} />
                </div>
                
                <div className="flex items-center">
                  <Badge className="bg-gray-200 text-gray-500">3</Badge>
                  <div className="mr-2 flex-1">
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-gray-200" />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
