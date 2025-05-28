"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { 
  Bot, 
  LightbulbIcon,
  PlusCircle,
  ArrowRight,
  ChevronRight,
  DollarSign, 
  Scissors, 
  ShoppingCart, 
  FileText, 
  BarChart,
  Megaphone, 
  Tag,
  Sparkles
} from "lucide-react"
import Link from "next/link"

export function SmartPricingPromoCard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false)
  const [featureSuggestion, setFeatureSuggestion] = useState("")
  const [email, setEmail] = useState("")
  const [currentFeature, setCurrentFeature] = useState(0)

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
      color: "bg-indigo-50 text-indigo-800 border-indigo-100"
    },
    { 
      icon: <Scissors className="h-5 w-5" />, 
      text: "إنتاج حسب الطلب وربط مباشر بالخياط",
      description: "إدارة طلبات الإنتاج وربطها مباشرة بورشات الخياطة لتحسين الكفاءة",
      color: "bg-violet-50 text-violet-800 border-violet-100"
    },
    { 
      icon: <ShoppingCart className="h-5 w-5" />, 
      text: "تكامل مع متجر سلة",
      description: "مزامنة تلقائية مع متجرك الإلكتروني لتحديث المخزون والأسعار",
      color: "bg-sky-50 text-sky-800 border-sky-100"
    },
    { 
      icon: <FileText className="h-5 w-5" />, 
      text: "إصدار قوائم إنتاج ذكية",
      description: "توليد قوائم الإنتاج والمواد المطلوبة بناءً على بيانات المبيعات والطلبات",
      color: "bg-teal-50 text-teal-800 border-teal-100"
    },
    { 
      icon: <BarChart className="h-5 w-5" />, 
      text: "تقارير مالية تغنيك عن المحاسب",
      description: "لوحات تحكم مالية متكاملة تعرض أداء مبيعاتك وتكاليفك بتفاصيل دقيقة",
      color: "bg-emerald-50 text-emerald-800 border-emerald-100"
    },
    { 
      icon: <Bot className="h-5 w-5" />, 
      text: "تسعير ذكي مبني على السوق",
      description: "خوارزميات ذكاء اصطناعي تحلل أسعار السوق وتقترح الأسعار المثالية",
      color: "bg-amber-50 text-amber-800 border-amber-100"
    },
    { 
      icon: <Megaphone className="h-5 w-5" />, 
      text: "تسويق آلي مدمج",
      description: "نظام يقترح استراتيجيات ترويجية وحملات تسويقية بناءً على تحليل بيانات مبيعاتك",
      color: "bg-rose-50 text-rose-800 border-rose-100"
    },
    { 
      icon: <Tag className="h-5 w-5" />, 
      text: "تتبع ذكي لمخزون الأقمشة",
      description: "نظام متكامل لإدارة المخزون وتتبع كميات الأقمشة المتاحة والمطلوبة",
      color: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100"
    }
  ]

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="my-4"
      dir="rtl"
    >
      <Card className="border border-indigo-100 overflow-hidden bg-gradient-to-br from-white to-indigo-50/20 shadow-sm relative">
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-indigo-600 rounded-full opacity-5"></div>
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-indigo-600 rounded-full opacity-5"></div>
        </div>
        
        {/* شريط تجميلي علوي */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* القسم الأيسر - العنوان والوصف */}
            <div className="flex-1 flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="p-3 bg-indigo-100/60 text-indigo-600 rounded-lg flex-shrink-0 hidden md:flex">
                <Sparkles className="h-7 w-7" />
              </div>
              
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-none px-2 py-0.5">
                    قريبًا
                  </Badge>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                  تكلفة <span className="text-indigo-600">2.0</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1 max-w-md">
                  نعمل على تطوير الجيل القادم من أداة تكلفة الذكية لتحسين ربحية عملك
                </p>
              </div>
            </div>
            
            {/* القسم الأيمن - الأزرار */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-sm border-indigo-200 hover:bg-indigo-50"
                onClick={() => setIsFeatureDialogOpen(true)}
              >
                <ArrowRight className="mr-1 h-4 w-4" />
                اكتشاف المزيد
              </Button>
              <Button 
                size="sm" 
                className="text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-none"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                اقترح ميزة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* نافذة حوار اقتراح ميزة */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                dir="rtl"
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
                dir="rtl"
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
      
      {/* نافذة حوار اكتشاف المزيد */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">ميزات تكلفة 2.0</DialogTitle>
            <DialogDescription>
              اكتشف الميزات الجديدة التي نعمل على تطويرها لمساعدتك في تحسين ربحية عملك.
            </DialogDescription>
          </DialogHeader>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
            dir="rtl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="border border-gray-100 rounded-lg p-4 bg-white hover:border-indigo-100 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${feature.color} flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{feature.text}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              variants={itemVariants}
              className="border border-dashed border-indigo-200 rounded-lg p-4 bg-indigo-50/50 col-span-1 md:col-span-2 text-center"
            >
              <Button 
                variant="outline" 
                className="border-indigo-200 hover:bg-indigo-50"
                onClick={() => {
                  setIsFeatureDialogOpen(false);
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                اقترح ميزة جديدة
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}