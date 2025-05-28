"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSettings } from "@/components/settings/project-settings";
import { FixedCosts } from "@/components/settings/fixed-costs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { Settings, Shield, User, CreditCard, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [supabase] = useState(() => createClientComponentClient());
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (!session) {
        toast({
          title: "غير مصرح",
          description: "يجب تسجيل الدخول للوصول إلى هذه الصفحة",
        });
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
    } catch (error) {
      console.error("Error checking user session:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التحقق من الجلسة",
      });
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* قسم العنوان */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-8 border border-indigo-100"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-indigo-100 shadow-lg"
            >
              <Settings className="h-8 w-8 text-indigo-600" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900"
              >
                الإعدادات
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mt-1"
              >
                قم بإدارة إعدادات المشروع والتكاليف والملف الشخصي
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* قسم التبويبات */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <Tabs defaultValue="project" className="w-full" dir="rtl">
            <div className="flex gap-6">
              {/* قائمة التبويبات العمودية */}
              <TabsList className="flex flex-col h-fit bg-gray-50 p-1 rounded-lg w-64">
                <TabsTrigger 
                  value="project" 
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5" />
                    <span>إعدادات المشروع</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="costs" 
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span>التكاليف الثابتة</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span>الملف الشخصي</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="account" 
                  className="w-full justify-start px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <span>إعدادات الحساب</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* محتوى التبويبات */}
              <div className="flex-1">
                <TabsContent value="project" className="mt-0">
                  <ProjectSettings userId={userId} />
                </TabsContent>

                <TabsContent value="costs" className="mt-0">
                  <FixedCosts userId={userId} />
                </TabsContent>

                <TabsContent value="profile" className="mt-0">
                  <ProfileSettings userId={userId} />
                </TabsContent>

                <TabsContent value="account" className="mt-0">
                  <AccountSettings userId={userId} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </motion.section>
      </div>
    </AppShell>
  );
}
