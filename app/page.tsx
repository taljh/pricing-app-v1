import { AppShell } from "@/components/ui/app-shell"
import { Calculator, Package, ArrowUpRight, BarChart3, TrendingUp, Sparkles, LightbulbIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QuickStats from "@/components/shared/QuickStats"
import FeaturesGrid from "@/components/shared/FeaturesGrid"
import { SmartPricingPromoCard } from "@/components/pricing/SmartPricingPromoCard"
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function HomePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }

    // بيانات فعلية - التاريخ الحالي بالهجري والميلادي
    const date = new Date();
    const gregorianDate = new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);

    // استعلام لآخر المنتجات المضافة (يمكن استبدالها بالاستعلام الفعلي من Supabase)
    const { data: latestProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
      .maybeSingle();
      
    // نصائح تسعير ذكية مرتبطة بالمنتجات
    const pricingTips = [
      "زيادة سعر المنتجات الأكثر مبيعاً بنسبة 5% قد يزيد الأرباح بنسبة 8-12%",
      "مراجعة تكاليف الخامات المستخدمة في العباية الكلاسيكية لتحسين هامش الربح",
      "يمكن خفض سعر المنتجات بطيئة الحركة بنسبة 15% لزيادة معدل الدوران",
      "تحليل البيانات يقترح تخفيض الخصومات من 20% إلى 15% لتحسين الربحية",
      "تبين أن زيادة سعر منتجات الفئة الفاخرة بنسبة 10% لا يؤثر على حجم المبيعات"
    ];
    
    // اختيار نصيحة عشوائية
    const randomTip = pricingTips[Math.floor(Math.random() * pricingTips.length)];
    
    // بيانات الإجراءات السريعة
    const quickActions = [
      {
        title: "إضافة منتج جديد",
        description: "إنشاء منتج جديد مع حساب تكلفة الإنتاج وسعر البيع المناسب",
        href: "/products",
        icon: <Package className="h-5 w-5 text-emerald-600" />
      },
      {
        title: "حاسبة التسعير الذكية",
        description: "تحديد السعر الأمثل بناءً على تكاليف الإنتاج وهامش الربح المستهدف",
        href: "/pricing/calculator",
        icon: <Calculator className="h-5 w-5 text-indigo-600" />
      },
      {
        title: "تحليلات المبيعات",
        description: "الاطلاع على تقارير الأداء ومؤشرات المبيعات للفترة الحالية",
        href: "/advisor",
        icon: <BarChart3 className="h-5 w-5 text-amber-600" />
      }
    ];

    return (
      <AppShell>
        <div className="space-y-6">
          {/* قسم الترحيب المطوّر */}
          <section className="relative rounded-2xl overflow-hidden">
            {/* خلفية مع تأثيرات متدرجة */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/70 to-blue-50 z-0"></div>
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>
            
            {/* النقاط الزخرفية */}
            <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-300/20 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-5 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl z-0"></div>
            
            <div className="relative z-10 p-6 md:p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 text-center lg:text-right">
                  <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-gray-500 mb-1">
                    <span>{gregorianDate}</span>
                  </div>
                  
                  <Badge className="px-3 py-1 mb-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                    <span>نظام تسعير ذكي</span>
                  </Badge>
                  
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                    أهلاً {user.email?.split('@')[0]}
                  </h1>
                  
                  <p className="text-lg text-gray-600 max-w-2xl">
                    نظام التسعير المتقدم للعبايات - إدارة أسعار منتجاتك وتحسين هوامش الربح بذكاء
                  </p>
                  
                  <div className="bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-lg p-4 mt-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-amber-50 text-amber-600">
                        <LightbulbIcon className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">نصيحة التسعير اليوم:</p>
                        <p className="text-sm text-gray-600">{randomTip}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                    <Link href="/pricing/calculator">
                      <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-none shadow-md hover:shadow-lg transition-all duration-300 gap-2">
                        <Calculator className="h-5 w-5" />
                        <span>حاسبة التسعير</span>
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" className="bg-white/80 backdrop-blur-sm hover:bg-white gap-2 border-indigo-200">
                        <Package className="h-5 w-5" />
                        <span>إدارة المنتجات</span>
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-50 hidden md:block">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">الإحصائيات السريعة</h3>
                    <Badge variant="outline" className="text-xs border-indigo-100 text-indigo-700">آخر 30 يوم</Badge>
                  </div>
                  <QuickStats compact={true} />
                </div>
              </div>
            </div>
          </section>
          
          {/* قسم الإجراءات السريعة */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link href={action.href} key={index} className="block">
                <Card className="border border-gray-100 hover:border-indigo-100 transition-all duration-300 h-full hover:shadow-md bg-white">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="p-2.5 rounded-full bg-gray-50 border border-gray-100">
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
                        <span>اختيار</span>
                        <ArrowUpRight className="ms-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
          
          {/* الإحصائيات المرئية للأجهزة المحمولة */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-medium">الإحصائيات السريعة</h3>
              <Badge variant="outline" className="text-xs">آخر 30 يوم</Badge>
            </div>
            <QuickStats />
          </div>
          
          {/* الميزات الرئيسية للنظام */}
          <section className="pt-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold">ميزات النظام الرئيسية</h2>
              </div>
              <p className="text-gray-600 text-sm">استفد من مجموعة متكاملة من الأدوات لتحسين استراتيجية التسعير الخاصة بك</p>
            </div>
            <FeaturesGrid />
          </section>
          
          {/* قسم إحصائيات مبيعات ذكية */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">تحليل المبيعات والتسعير</h2>
                  <p className="text-gray-500 text-sm mt-1">مؤشرات الأداء الرئيسية لمساعدتك في اتخاذ قرارات التسعير الصحيحة</p>
                </div>
                <Badge variant="outline" className="border-indigo-100 text-indigo-700 px-3 py-1">
                  <span className="text-xs">تم التحديث اليوم</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* بطاقة تحليل المبيعات */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">المبيعات</h3>
                    <Badge className="bg-green-50 text-green-700 border-green-100">+12.5%</Badge>
                  </div>
                  
                  <div className="mt-4 h-32 flex items-end justify-between gap-2">
                    {[35, 45, 30, 60, 75, 45, 55].map((height, i) => (
                      <div key={i} className="relative h-full flex items-end flex-1">
                        <div 
                          className="w-full bg-indigo-100 rounded-t transition-all duration-500" 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div 
                          className="absolute bottom-0 w-full bg-indigo-500 rounded-t transition-all duration-500" 
                          style={{ height: `${height * 0.7}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-3 text-xs text-gray-500">
                    <div>الأحد</div>
                    <div>السبت</div>
                  </div>
                </div>
                
                {/* بطاقة تحليل الربحية */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">هامش الربح</h3>
                    <Badge className="bg-green-50 text-green-700 border-green-100">+2.3%</Badge>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>العباية الكلاسيكية</span>
                        <span className="font-medium text-indigo-700">34.5%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: "34.5%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>عباية مطرزة</span>
                        <span className="font-medium text-indigo-700">42.8%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: "42.8%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>عباية كاجوال</span>
                        <span className="font-medium text-indigo-700">28.2%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: "28.2%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* بطاقة تحسين الأسعار */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50">
                  <h3 className="font-medium text-gray-800 mb-4">فرص تحسين الأسعار</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border border-amber-100 bg-amber-50/50 rounded-lg">
                      <div className="p-2 rounded-full bg-amber-100">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">العباية السوداء المطرزة</p>
                        <p className="text-gray-600">يمكن زيادة السعر بنسبة 10% لتحسين الهامش</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border border-indigo-100 bg-indigo-50/50 rounded-lg">
                      <div className="p-2 rounded-full bg-indigo-100">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">عباية الدانتيل</p>
                        <p className="text-gray-600">مراجعة تكاليف الإنتاج لتحسين الربحية</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4 text-sm gap-1 border-indigo-200">
                    <span>عرض كل الفرص</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* قسم التوصيات الذكية المخصصة */}
          <section className="bg-gradient-to-br from-indigo-50 to-blue-50/30 rounded-xl border border-indigo-100 p-6 overflow-hidden relative">
            {/* عناصر زخرفية للخلفية */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full"></div>
            <div className="absolute top-10 right-10 w-40 h-40 bg-indigo-500/5 rounded-full"></div>
            
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">توصيات ذكية مخصصة لك</h2>
                  <p className="text-gray-600 text-sm">تحليلات مبنية على بيانات متجرك الفعلية وسلوك العملاء</p>
                </div>
              </div>
              
              <Link href="/advisor" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>عرض جميع التوصيات</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* توصية تسعير ذكية */}
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <LightbulbIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">تعديل أسعار المنتجات الموسمية</h4>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100">مهمة</Badge>
                      </div>
                      <p className="text-sm text-gray-600">تحليل البيانات يقترح زيادة أسعار مجموعة العبايات الرمضانية بنسبة 8-12% نظرًا للطلب المتزايد</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">تم التحديث قبل 3 ساعات</div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-700">تطبيق التوصية</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* توصية تحسين الربحية */}
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">تحسين هامش الربح</h4>
                        <Badge className="bg-green-50 text-green-700 border-green-100">موصى بها</Badge>
                      </div>
                      <p className="text-sm text-gray-600">يمكن تحسين هامش الربح الإجمالي بنسبة 5.2% من خلال تعديل مصادر الخامات لأكثر 3 منتجات مبيعًا</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">تم التحليل اليوم</div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-700">عرض التفاصيل</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* مكون الترويج للجيل القادم من نظام التسعير الذكي */}
          <SmartPricingPromoCard />
        </div>
      </AppShell>
    )
  } catch (error) {
    console.error('Error in HomePage:', error)
    redirect('/auth/login')
  }
}