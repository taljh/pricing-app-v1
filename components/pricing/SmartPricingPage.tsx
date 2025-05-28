"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ArrowUpRight, Calculator, Zap, ChevronLeft, PieChart, TrendingUp, BarChart3, Check, ArrowRight, LineChart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SmartPricingPage() {
  const [activeTab, setActiveTab] = useState("calculator")
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="w-full rtl">
      {/* العنوان الرئيسي والوصف - تصميم جديد مع تدرج لوني */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"></div>
          <CardContent className="py-8 px-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 rounded-lg shadow-sm">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">نظام التسعير الذكي</h1>
                </div>
                <p className="text-gray-600 text-base max-w-2xl leading-relaxed">
                  راقب، حلّل، واتّخذ قرارات تسعيرية أفضل لتحقيق أقصى ربحية من منتجاتك عبر تحديد الأسعار المثالية بذكاء
                </p>
                <div className="bg-indigo-600/10 p-3 rounded-lg inline-flex items-center gap-2 text-sm text-indigo-700 border border-indigo-100">
                  <Zap className="h-4 w-4 text-indigo-600" />
                  <span>حوّل بيانات التكاليف إلى استراتيجية تسعير تنافسية</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/" className="flex items-center px-4 py-2 text-sm bg-white text-indigo-700 hover:bg-indigo-50 transition-colors rounded-md border border-indigo-200 shadow-sm">
                  <ChevronLeft className="h-4 w-4 ml-1.5" />
                  <span>الرئيسية</span>
                </Link>
                <Link href="/products" className="flex items-center px-4 py-2 text-sm bg-white text-indigo-700 hover:bg-indigo-50 transition-colors rounded-md border border-indigo-200 shadow-sm">
                  <ShoppingBag className="h-4 w-4 ml-1.5" />
                  <span>المنتجات</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            أدوات التسعير
          </h2>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              حاسبة التسعير
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              تحليلات الأسعار
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              دراسة السوق
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calculator" className="mt-0">
          {/* محتوى القسم الرئيسي - معدل لجعل كرت الحاسبة أكبر وكرت التلميحات أصغر */}
          <motion.div 
            className="grid grid-cols-12 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* الحاسبة الذكية - كرت أكبر يأخذ 8 أعمدة */}
            <motion.div 
              variants={cardVariants}
              className="col-span-12 md:col-span-8"
            >
              <Card className="border border-indigo-100 shadow-sm overflow-hidden h-full flex flex-col hover:border-indigo-200 hover:shadow transition-all duration-300 group">
                <div className="h-2 bg-gradient-to-l from-indigo-500 to-purple-600"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                      حاسبة التسعير الذكية
                    </CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                      الأداة الأساسية
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    حدد السعر المثالي لمنتجاتك بناءً على تحليل دقيق للتكاليف والسوق
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 flex-grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-l from-slate-50 to-indigo-50 p-5 rounded-lg border border-indigo-100/50 hover:shadow-sm transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="rounded-full bg-indigo-100 p-1 mt-0.5 ml-3">
                            <Check className="h-3.5 w-3.5 text-indigo-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">تحليل التكاليف</h4>
                            <p className="text-xs text-gray-600">حساب التكاليف المباشرة وغير المباشرة للمنتج</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="rounded-full bg-indigo-100 p-1 mt-0.5 ml-3">
                            <Check className="h-3.5 w-3.5 text-indigo-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">هامش الربح</h4>
                            <p className="text-xs text-gray-600">تحديد هامش الربح المستهدف للفئة السعرية</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-l from-slate-50 to-indigo-50 p-5 rounded-lg border border-indigo-100/50 hover:shadow-sm transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="rounded-full bg-indigo-100 p-1 mt-0.5 ml-3">
                            <Check className="h-3.5 w-3.5 text-indigo-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">تحليل المنافسة</h4>
                            <p className="text-xs text-gray-600">مقارنة أسعار المنافسين وتوجهات السوق</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="rounded-full bg-indigo-100 p-1 mt-0.5 ml-3">
                            <Check className="h-3.5 w-3.5 text-indigo-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">تحسين التسعير</h4>
                            <p className="text-xs text-gray-600">اقتراح الأسعار المثالية بناءً على البيانات والتحليل</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-100/50">
                      <Badge className="bg-amber-100 text-amber-800 border-none">جديد</Badge>
                      <span className="text-sm">إضافة تحليل الخصومات الموسمية وتأثيرها على الربح</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 pb-5">
                  <Link href="/pricing/calculator" className="w-full">
                    <Button className="gap-2 text-sm w-full py-5 bg-gradient-to-l from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md group-hover:shadow-lg transition-all duration-300">
                      <span>استخدام الحاسبة الذكية</span>
                      <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* تلميحات ونصائح - كرت أصغر يأخذ 4 أعمدة */}
            <motion.div
              variants={cardVariants}
              className="col-span-12 md:col-span-4"
            >
              <Card className="border border-indigo-100 shadow-sm overflow-hidden h-full flex flex-col hover:border-purple-200 hover:shadow transition-all duration-300 group">
                <div className="h-2 bg-gradient-to-l from-purple-600 to-indigo-500"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                      تلميحات مفيدة
                    </CardTitle>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                      أفضل الممارسات
                    </Badge>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    نصائح تساعدك على اتخاذ قرارات التسعير
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 flex-grow space-y-4">
                  <div className="bg-gradient-to-l from-white to-purple-50 p-4 rounded-lg border border-purple-100/50 hover:shadow-sm transition-all duration-300 group">
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5 ml-3 group-hover:bg-purple-200 transition-colors">
                        <span className="text-purple-700 text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">قارن خيارات متعددة</h4>
                        <p className="text-xs text-gray-600">جرب أسعار مختلفة لمعرفة تأثيرها</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-l from-white to-purple-50 p-4 rounded-lg border border-purple-100/50 hover:shadow-sm transition-all duration-300 group">
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5 ml-3 group-hover:bg-purple-200 transition-colors">
                        <span className="text-purple-700 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">التسعير التنافسي</h4>
                        <p className="text-xs text-gray-600">حلل أسعار المنافسين والقيمة المضافة</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-l from-white to-purple-50 p-4 rounded-lg border border-purple-100/50 hover:shadow-sm transition-all duration-300 group">
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5 ml-3 group-hover:bg-purple-200 transition-colors">
                        <span className="text-purple-700 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">اختبار السوق</h4>
                        <p className="text-xs text-gray-600">جرّب أسعار مختلفة وراقب ردود الفعل</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-l from-white to-purple-50 p-4 rounded-lg border border-purple-100/50 hover:shadow-sm transition-all duration-300 group">
                    <div className="flex items-start">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5 ml-3 group-hover:bg-purple-200 transition-colors">
                        <span className="text-purple-700 text-xs font-bold">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">مراقبة مستمرة</h4>
                        <p className="text-xs text-gray-600">تتبع أداء الأسعار وعدّل عند الحاجة</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 pb-5">
                  <Link href="/advisor" className="w-full">
                    <Button variant="outline" className="gap-2 text-sm w-full py-5 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 transition-all duration-300">
                      <span>المزيد من النصائح</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>

          {/* ملاحظة أخيرة - تصميم محسن */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-none shadow-sm bg-gradient-to-l from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-100 overflow-hidden">
              <CardContent className="py-5 px-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-white to-indigo-50 p-2.5 border border-indigo-100 shadow-sm">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base mb-1">زيادة الربح باستخدام التسعير الذكي</h3>
                    <p className="text-sm text-gray-600">
                      يمكن أن تؤدي استراتيجية التسعير المناسبة إلى زيادة الهامش الربحي بنسبة تصل إلى 25%. استخدم حاسبة التسعير الذكية لإيجاد السعر المثالي لمنتجاتك.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border border-indigo-100 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="bg-indigo-100 p-4 rounded-full">
                    <LineChart className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">تحليلات الأسعار قادمة قريبًا</h3>
                  <p className="text-gray-600 max-w-lg">
                    نعمل على تطوير أدوات متقدمة لتحليل الأسعار ومقارنتها بالمنافسين وتقديم توصيات مخصصة لكل منتج.
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 border-none mt-2">قريبًا</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="market" className="mt-0">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border border-indigo-100 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="bg-indigo-100 p-4 rounded-full">
                    <BarChart3 className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">دراسة السوق قادمة قريبًا</h3>
                  <p className="text-gray-600 max-w-lg">
                    قريبًا، ستتمكن من دراسة توجهات السوق وتحليل أسعار المنافسين والفئات المستهدفة لتحديد الأسعار المثالية.
                  </p>
                  <Badge className="bg-amber-100 text-amber-800 border-none mt-2">قريبًا</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}