"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  DollarSign, 
  Scissors, 
  ShoppingCart, 
  FileText, 
  BarChart, 
  Bot, 
  Megaphone, 
  Tag,
  LightbulbIcon,
  PlusCircle,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export function SmartPricingPromoCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [featureSuggestion, setFeatureSuggestion] = useState("")
  const [email, setEmail] = useState("")
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(-1)
  const [isHovering, setIsHovering] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  // Reset hovering state when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setIsHovering(false)
    }
  }, [isDialogOpen])

  // وظيفة لتقديم اقتراح ميزة جديدة
  const handleSubmitSuggestion = () => {
    if (!featureSuggestion.trim()) {
      toast.error("الرجاء إدخال اقتراح للميزة")
      return
    }

    // هنا يمكن إضافة الكود لإرسال الاقتراح إلى الخادم
    console.log("اقتراح ميزة جديدة:", featureSuggestion, "البريد الإلكتروني:", email)
    
    // عرض رسالة نجاح
    toast.success("تم إرسال اقتراحك بنجاح، شكراً لك!")
    
    // إعادة تعيين النموذج وإغلاق الحوار
    setFeatureSuggestion("")
    setEmail("")
    setIsDialogOpen(false)
  }

  // قائمة المميزات مع أيقوناتها
  const features = [
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      text: "نظام مالية متكامل لإدارة التكاليف والربح",
      description: "حساب آلي للتكاليف والإيرادات وتحليل هوامش الربح بشكل مفصّل",
      color: "bg-indigo-50 text-indigo-800 border-indigo-100",
      lightColor: "bg-indigo-400/10",
      darkColor: "bg-indigo-600"
    },
    { 
      icon: <Scissors className="h-5 w-5" />, 
      text: "إنتاج حسب الطلب وربط مباشر بالخياط",
      description: "إدارة طلبات الإنتاج وربطها مباشرة بورشات الخياطة لتحسين الكفاءة",
      color: "bg-violet-50 text-violet-800 border-violet-100",
      lightColor: "bg-violet-400/10",
      darkColor: "bg-violet-600"
    },
    { 
      icon: <ShoppingCart className="h-5 w-5" />, 
      text: "تكامل مع متجر سلة",
      description: "مزامنة تلقائية مع متجرك الإلكتروني لتحديث المخزون والأسعار",
      color: "bg-sky-50 text-sky-800 border-sky-100",
      lightColor: "bg-sky-400/10",
      darkColor: "bg-sky-600"
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      text: "إصدار قوائم إنتاج ذكية",
      description: "توليد قوائم الإنتاج والمواد المطلوبة بناءً على بيانات المبيعات والطلبات",
      color: "bg-teal-50 text-teal-800 border-teal-100",
      lightColor: "bg-teal-400/10",
      darkColor: "bg-teal-600"
    },
    { 
      icon: <BarChart className="h-5 w-5" />, 
      text: "تقارير مالية تغنيك عن المحاسب",
      description: "لوحات تحكم مالية متكاملة تعرض أداء مبيعاتك وتكاليفك بتفاصيل دقيقة",
      color: "bg-emerald-50 text-emerald-800 border-emerald-100",
      lightColor: "bg-emerald-400/10",
      darkColor: "bg-emerald-600"
    },
    { 
      icon: <Bot className="h-5 w-5" />, 
      text: "تسعير ذكي مبني على السوق",
      description: "خوارزميات ذكاء اصطناعي تحلل أسعار السوق وتقترح الأسعار المثالية",
      color: "bg-amber-50 text-amber-800 border-amber-100",
      lightColor: "bg-amber-400/10",
      darkColor: "bg-amber-600"
    },
    { 
      icon: <Megaphone className="h-5 w-5" />, 
      text: "تسويق آلي مدمج",
      description: "نظام يقترح استراتيجيات ترويجية وحملات تسويقية بناءً على تحليل بيانات مبيعاتك",
      color: "bg-rose-50 text-rose-800 border-rose-100",
      lightColor: "bg-rose-400/10",
      darkColor: "bg-rose-600"
    },
    { 
      icon: <Tag className="h-5 w-5" />, 
      text: "تتبع ذكي لمخزون الأقمشة",
      description: "نظام متكامل لإدارة المخزون وتتبع كميات الأقمشة المتاحة والمطلوبة",
      color: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100",
      lightColor: "bg-fuchsia-400/10",
      darkColor: "bg-fuchsia-600"
    }
  ]

  // تغيير مؤشر العنصر النشط كل 3 ثوان
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setActiveFeatureIndex((prev) => (prev + 1) % features.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [features.length, isHovering])

  // تأثيرات الحركة للمكونات
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  // تبديل المميزة المعروضة كل 5 ثوان
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovering) {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [features.length, isHovering]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="my-10"
      dir="rtl"
    >
      <Card className="border-2 border-indigo-100 overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 shadow-md relative">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600 rounded-full opacity-5"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600 rounded-full opacity-5"></div>
        </div>
        
        <CardContent className="p-6 md:p-8">
          {/* عنوان القسم */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Badge className="mb-3 px-3 py-1.5 bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 text-white border-none">
                قريبًا
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent mb-3">
                نظام التسعير الذكي <span className="text-indigo-600">2.0</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                نحن نعمل على تطوير الجيل القادم من نظام التسعير الذكي ليساعدك في تحسين ربحية عملك من خلال تقنيات الذكاء الاصطناعي واستراتيجيات التسعير المتقدمة
              </p>
            </motion.div>
          </div>

          {/* عرض المميزات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* تفاصيل المميزة المختارة */}
            <motion.div 
              className="md:col-span-2 relative overflow-hidden" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`rounded-xl p-6 md:p-8 ${features[currentFeature].lightColor} border border-indigo-100 transition-all duration-500 relative overflow-hidden h-full flex flex-col`}>
                <div className={`absolute -left-12 -top-12 w-24 h-24 rounded-full ${features[currentFeature].darkColor} opacity-10`}></div>
                <div className={`absolute -right-12 -bottom-12 w-24 h-24 rounded-full ${features[currentFeature].darkColor} opacity-10`}></div>
                
                <div className="mb-4 flex items-center">
                  <div className={`p-2.5 rounded-lg ${features[currentFeature].color} ml-3`}>
                    {features[currentFeature].icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">
                    {features[currentFeature].text}
                  </h3>
                </div>
                
                <p className="text-base text-gray-600 mb-6">{features[currentFeature].description}</p>
                
                <div className="mt-auto flex justify-between items-end">
                  <div className="flex space-x-1 rtl:space-x-reverse">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentFeature 
                            ? `${features[currentFeature].darkColor} scale-125` 
                            : 'bg-gray-300'
                        }`}
                        onClick={() => {
                          setCurrentFeature(index);
                          setIsHovering(true);
                          // Reset auto-rotation after 20 seconds
                          setTimeout(() => setIsHovering(false), 20000);
                        }}
                      />
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFeature((currentFeature + 1) % features.length)}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white"
                  >
                    <span className="ml-1">التالي</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* قائمة المميزات المصغرة */}
            <motion.div 
              className="flex flex-col gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {features.slice(0, 4).map((feature, index) => (
                <motion.button
                  key={index}
                  className={`text-right p-3 rounded-lg border transition-all duration-300 flex items-center gap-3 hover:shadow-sm ${
                    currentFeature === index 
                      ? `border-l-4 ${feature.color} shadow-sm` 
                      : 'border-gray-100 bg-white/80'
                  }`}
                  variants={itemVariants}
                  onClick={() => {
                    setCurrentFeature(index);
                    setIsHovering(true);
                    // Reset auto-rotation after 20 seconds
                    setTimeout(() => setIsHovering(false), 20000);
                  }}
                >
                  <div className={`p-2 rounded-md ${feature.color} flex-shrink-0 transition-all ${
                    currentFeature === index ? 'scale-110' : ''
                  }`}>
                    {feature.icon}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-medium text-sm truncate">{feature.text}</h4>
                    {currentFeature === index && (
                      <motion.p 
                        className="text-xs text-gray-500 truncate"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.description.length > 60 
                          ? feature.description.substring(0, 60) + '...' 
                          : feature.description}
                      </motion.p>
                    )}
                  </div>
                </motion.button>
              ))}
              
              <motion.button
                variants={itemVariants}
                className="text-center p-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-all duration-300"
                onClick={() => setIsDialogOpen(true)}
              >
                <div className="flex items-center justify-center gap-2 text-indigo-700">
                  <LightbulbIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">اقترح ميزة جديدة</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
          
          {/* أزرار إضافية للتفاعل */}
          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-between gap-4 border-t border-indigo-100 pt-6">
            <p className="text-sm text-gray-500 order-2 md:order-1 text-center md:text-right">
              الجيل القادم من نظام التسعير الذكي - سيتم إطلاقه قريباً
            </p>
            
            <div className="flex gap-3 order-1 md:order-2">
              <Link href="/pricing/calculator">
                <Button size="sm" className="text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-none">
                  جرب النسخة الحالية
                </Button>
              </Link>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="text-sm border-indigo-200"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle className="mr-1 h-3.5 w-3.5" />
                اقترح ميزة
              </Button>
            </div>
          </div>
          
        </CardContent>
        
        {/* شريط تجميلي علوي */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      </Card>
      
      {/* نافذة حوار اقتراح ميزة */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rtl">
          <DialogHeader>
            <DialogTitle>اقترح ميزة جديدة</DialogTitle>
            <DialogDescription>
              ساعدنا في تطوير المنصة من خلال اقتراح ميزات تساعدك في إدارة عملك بشكل أفضل.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="feature-suggestion" className="text-sm font-medium">اقتراح الميزة</label>
              <Textarea
                id="feature-suggestion"
                placeholder="اشرح الميزة التي ترغب في إضافتها..."
                value={featureSuggestion}
                onChange={(e) => setFeatureSuggestion(e.target.value)}
                className="resize-none h-32"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
              <Input
                id="email"
                type="email"
                placeholder="إذا كنت ترغب في أن نتواصل معك بخصوص اقتراحك"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">لن نقوم بمشاركة بريدك الإلكتروني مع أي جهة خارجية.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button 
              onClick={handleSubmitSuggestion} 
              disabled={!featureSuggestion.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              إرسال الاقتراح
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}