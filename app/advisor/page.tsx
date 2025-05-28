import { redirect } from "next/navigation"
import { AppShell } from "@/components/ui/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Sparkles, Lightbulb, TrendingUp, Rocket } from "lucide-react"

// مكون كارت "قريبًا" للمستشار الذكي - تم تحويله للعمل مع Server Components
function AdvisorComingSoonCard() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="p-10 text-center space-y-8">
          <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <Rocket className="h-10 w-10 text-indigo-600" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-indigo-900">
              🚀 ترقّب أقوى أداة توصيات تسعير وتحليلات ذكية مخصصة لك كتاجر
            </h2>
            
            <p className="text-lg text-indigo-800 font-medium">
              "مستشارك الذكي" قادم قريبًا ليدير معك الأسعار… بذكاء
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm text-right">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">تحليلات ذكية</h3>
                </div>
                <p className="text-sm text-gray-600">
                  تحليلات متقدمة لبيانات المبيعات واكتشاف الفرص وتحسين هوامش الربح
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm text-right">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">توصيات مخصصة</h3>
                </div>
                <p className="text-sm text-gray-600">
                  اقتراحات وتوصيات محددة بناءً على أنماط المبيعات وسلوك العملاء
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm text-right">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900">تنبؤات مستقبلية</h3>
                </div>
                <p className="text-sm text-gray-600">
                  توقعات بالاتجاهات المستقبلية للمبيعات والأسعار المثلى للمنتجات
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Server Component لتنفيذ التحقق من الجلسة على مستوى الخادم
export default async function AdvisorPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* رأس الصفحة */}
        <div className="bg-gradient-to-br from-white to-indigo-50/30 p-6 rounded-2xl shadow-sm border border-indigo-100 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <span>مستشارك الذكي</span>
              </h1>
              <p className="text-gray-500 mt-1">
                أداتك الذكية لتحليل الأسعار، كشف الفرص، واقتراح التعديلات اللازمة لتحقيق أقصى ربح ممكن. مستشارك الذكي يتابع أداء منتجاتك، يكتشف الثغرات، ويقترح ما يُصلح قبل أن تتأثر مبيعاتك.
              </p>
            </div>
          </div>
        </div>
        
        {/* بطاقة قريبًا */}
        <AdvisorComingSoonCard />
      </div>
    </AppShell>
  )
}