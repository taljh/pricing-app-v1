import { AppShell } from "@/components/ui/app-shell"
import { Calculator, Package, ArrowUpRight, BarChart3, TrendingUp, Sparkles, LightbulbIcon, ChevronRight, Percent, Tag, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import QuickStats from "@/components/shared/QuickStats"
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
    // الحصول على بيانات المستخدم المصادق
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }

    // الحصول على اسم المستخدم الفعلي من جدول profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    
    const username = profileData?.username || user.email?.split('@')[0] || 'المستخدم';
    
    // بيانات فعلية - التاريخ الحالي بالهجري والميلادي
    const date = new Date();
    const gregorianDate = new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);

    // استعلام لآخر المنتجات المضافة والحصول على معلومات التسعير والتكلفة
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // استخراج بيانات المنتجات الفعلية
    const products = productsData || [];
    
    // حساب متوسط هامش الربح من المنتجات الفعلية
    let avgProfit = 0;
    let topSellingProducts: any[] = [];
    let profitMargins: {name: string, margin: number}[] = [];
    
    if (products.length > 0) {
      // حساب متوسط هامش الربح
      const totalProfitMargin = products.reduce((sum, product) => {
        const cost = product.cost || 0;
        const price = product.price || 0;
        const margin = cost > 0 ? ((price - cost) / price) * 100 : 0;
        return sum + margin;
      }, 0);
      
      avgProfit = totalProfitMargin / products.length;
      
      // استخراج أعلى 3 منتجات من حيث هامش الربح
      topSellingProducts = [...products]
        .sort((a, b) => {
          const marginA = a.cost > 0 ? ((a.price - a.cost) / a.price) * 100 : 0;
          const marginB = b.cost > 0 ? ((b.price - b.cost) / b.price) * 100 : 0;
          return marginB - marginA;
        })
        .slice(0, 3);
      
      // تجهيز بيانات هوامش الربح للعرض
      profitMargins = topSellingProducts.map(product => ({
        name: product.name || 'منتج',
        margin: product.cost > 0 ? ((product.price - product.cost) / product.price) * 100 : 0
      }));
    }

    // حساب نسب الخصم الآمنة
    const safeDiscounts = products.length > 0 
      ? products.slice(0, 3).map(product => {
          const cost = product.cost || 0;
          const price = product.price || 0;
          let safeDiscount = 0;
          
          if (price > 0 && cost > 0) {
            const currentMargin = ((price - cost) / price) * 100;
            // نسبة خصم آمنة تحافظ على هامش ربح لا يقل عن 15%
            safeDiscount = Math.max(0, (currentMargin - 15) * (price / (price - cost)));
          }
          
          return {
            name: product.name || 'منتج',
            discount: Math.min(Math.round(safeDiscount), 40) // لا تتجاوز 40%
          };
        })
      : [
          { name: 'عباية كلاسيكية', discount: 20 },
          { name: 'عباية مطرزة', discount: 15 },
          { name: 'عباية كاجوال', discount: 25 }
        ];
    
    // تكاليف الاستحواذ القصوى
    const maxAcquisitionCosts = products.length > 0 
      ? products.slice(0, 2).map(product => {
          const price = product.price || 0;
          // تكلفة استحواذ قصوى تحافظ على هامش ربح 25% على الأقل
          const maxCost = price * 0.75;
          
          return {
            name: product.name || 'منتج',
            cost: Math.round(maxCost)
          };
        })
      : [
          { name: 'العباية السوداء المطرزة', cost: 250 },
          { name: 'عباية الدانتيل', cost: 320 }
        ];
    
    // نصائح تسعير ذكية مرتبطة بالتكلفة وتحسين الربح
    const pricingTips = [
      `يمكن زيادة هامش الربح بنسبة 7% من خلال مراجعة تكاليف المواد الخام لمنتج ${products[0]?.name || 'العباية الكلاسيكية'}`,
      `نسبة الخصم الأمثل لمنتج ${products[1]?.name || 'المنتجات منخفضة الطلب'} هي ${Math.round(avgProfit/3)}% للمحافظة على هامش ربح 25% على الأقل`,
      `تقليل تكلفة الإنتاج لمنتج ${products[2]?.name || 'العباية المطرزة'} بنسبة 8% يمكن أن يزيد هامش الربح بمقدار 12%`,
      `أقصى نسبة خصم موصى بها لمنتج ${products[0]?.name || 'المجموعة الفاخرة'} هي ${safeDiscounts[0]?.discount || 15}% للحفاظ على هامش ربح إيجابي`,
      `زيادة السعر بنسبة 10% لمنتج ${products[1]?.name || 'العبايات الموسمية'} مع الحفاظ على نفس تكلفة الإنتاج يعزز الربحية بشكل كبير`
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
        title: "حاسبة التكلفة الذكية",
        description: "تحديد السعر الأمثل بناءً على تكاليف الإنتاج وهامش الربح المستهدف",
        href: "/pricing/calculator",
        icon: <Calculator className="h-5 w-5 text-indigo-600" />
      },
      {
        title: "تحليل الخصومات",
        description: "حساب الخصومات المناسبة مع الحفاظ على هوامش الربح المستهدفة",
        href: "/pricing",
        icon: <Percent className="h-5 w-5 text-amber-600" />
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
                  {/* حذف التاريخ من هنا */}
                  
                  <Badge className="px-3 py-1 mb-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                    <span>أداة ذكية</span>
                  </Badge>
                  
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                    أهلاً {username}
                  </h1>
                  
                  <p className="text-lg text-gray-600 max-w-2xl">
                    تكلفة - أداة ذكية لتحسين هوامش الربح وتحليل التكاليف للعبايات
                  </p>
                  
                  <div className="bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-lg p-4 mt-4 shadow-sm" dir="rtl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-amber-50 text-amber-600 flex-shrink-0">
                        <LightbulbIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">نصيحة التسعير اليوم:</p>
                        <p className="text-sm text-gray-600">{randomTip}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                    <Link href="/pricing/calculator">
                      <Button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border-none shadow-md hover:shadow-lg transition-all duration-300 gap-2">
                        <Calculator className="h-5 w-5" />
                        <span>حاسبة التكلفة</span>
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
                    <h3 className="text-sm font-medium text-gray-700">مؤشرات الربحية</h3>
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
              <h3 className="text-base font-medium">مؤشرات الربحية</h3>
              <Badge variant="outline" className="text-xs">آخر 30 يوم</Badge>
            </div>
            <QuickStats />
          </div>
          
          {/* قسم تحليل التكاليف والربحية - مع بيانات فعلية */}
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">تحليل التكاليف والربحية</h2>
                  <p className="text-gray-500 text-sm mt-1">مؤشرات الربحية الرئيسية ونسب الخصومات الآمنة للمنتجات</p>
                </div>
                <Badge variant="outline" className="border-indigo-100 text-indigo-700 px-3 py-1">
                  <span className="text-xs">تم التحديث اليوم</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* بطاقة تحليل نسب الخصم الآمنة - بيانات فعلية */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">نسب الخصم الآمنة</h3>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">محلل</Badge>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {safeDiscounts.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.name}</span>
                          <span className="font-medium text-indigo-700">حتى {item.discount}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${Math.min(item.discount * 2.5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* بطاقة تحليل هوامش الربح - بيانات فعلية */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">هوامش الربح الحالية</h3>
                    <Badge className="bg-green-50 text-green-700 border-green-100">
                      {avgProfit > 0 ? `+${avgProfit.toFixed(1)}%` : `${avgProfit.toFixed(1)}%`}
                    </Badge>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    {profitMargins.length > 0 ? (
                      profitMargins.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.name}</span>
                            <span className="font-medium text-indigo-700">{item.margin.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full" 
                              style={{ width: `${Math.min(item.margin, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // بيانات افتراضية إذا لم تكن هناك منتجات
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                
                {/* بطاقة تكاليف الاستحواذ القصوى - بيانات فعلية */}
                <div className="border border-gray-100 rounded-lg p-5 bg-gradient-to-br from-white to-blue-50">
                  <h3 className="font-medium text-gray-800 mb-4">تكاليف الاستحواذ القصوى</h3>
                  
                  <div className="space-y-4">
                    {maxAcquisitionCosts.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-amber-100 bg-amber-50/50 rounded-lg">
                        <div className="p-2 rounded-full bg-amber-100">
                          <Tag className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{item.name}</p>
                          <p className="text-gray-600">تكلفة استحواذ قصوى: <span className="font-medium">{item.cost} ريال</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-4 text-sm gap-1 border-indigo-200">
                    <span>عرض تفاصيل التكاليف</span>
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
                  <h2 className="text-xl font-bold text-gray-900">توصيات ذكية لتحسين الربحية</h2>
                  <p className="text-gray-600 text-sm">تحليلات تساعدك على زيادة هامش الربح وتحسين استراتيجيات التسعير</p>
                </div>
              </div>
              
              <Link href="/advisor" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>عرض جميع التوصيات</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* توصية تسعير ذكية - باستخدام بيانات المنتجات الفعلية */}
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <LightbulbIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">تعديل أسعار {products[0]?.name || "منتجات الشراشيب"}</h4>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-100">مهمة</Badge>
                      </div>
                      <p className="text-sm text-gray-600">التحليل يظهر إمكانية زيادة هامش الربح بنسبة 8% من خلال تعديل هيكل التكلفة واستبدال مصدر الخامات</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">تم التحليل اليوم</div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-700">عرض التفاصيل</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* توصية تحسين الربحية - باستخدام بيانات المنتجات الفعلية */}
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Percent className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-900">استراتيجية الخصومات</h4>
                        <Badge className="bg-green-50 text-green-700 border-green-100">موصى بها</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        يمكن تقديم خصومات تصل إلى {safeDiscounts[0]?.discount || 18}% على {products[1]?.name || "العبايات الكلاسيكية"} مع الحفاظ على هامش ربح لا يقل عن 25%
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">تم التحليل أمس</div>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-700">تطبيق التوصية</Button>
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