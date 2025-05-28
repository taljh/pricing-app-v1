"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Percent, Building2, Target, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "../pricing/calculator/utils/format-helpers";
import { PaymentMethods } from "./payment-methods";

interface ProjectSettings {
  id?: string;
  user_id: string;
  project_name: string;
  target_category: "economic" | "medium" | "luxury";
  target_profit: number;
  created_at?: string;
}

interface ProjectSettingsProps {
  userId: string;
}

export function ProjectSettings({ userId }: ProjectSettingsProps) {
  const [supabase] = useState(() => createClientComponentClient());
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProjectSettings>({
    user_id: userId,
    project_name: "",
    target_category: "medium",
    target_profit: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryLabels] = useState({
    economic: "اقتصادي",
    medium: "متوسط",
    luxury: "فاخر",
  });

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("project_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching project settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل إعدادات المشروع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const settingsData = {
        ...settings,
        user_id: userId,
      };

      let response;

      if (settings.id) {
        response = await supabase
          .from("project_settings")
          .update(settingsData)
          .eq("id", settings.id);
      } else {
        response = await supabase.from("project_settings").insert([settingsData]);
      }

      const { error } = response;

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المشروع بنجاح",
      });

      // إعادة تحميل البيانات بعد الحفظ
      fetchSettings();
    } catch (error) {
      console.error("Error saving project settings:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ إعدادات المشروع",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-indigo-100 shadow-sm">
          <CardHeader className="bg-gradient-to-l from-indigo-50 via-violet-50 to-indigo-50 relative pb-6">
            <div className="absolute inset-0 bg-gradient-to-l from-indigo-50/20 via-purple-50/20 to-blue-50/20"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-indigo-100 p-1.5 rounded-md">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-bold">إعدادات المشروع</CardTitle>
              </div>
              <CardDescription>إعدادات المشروع الأساسية المستخدمة في حسابات التسعير</CardDescription>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    اسم المشروع
                  </Label>
                  <Input
                    value={settings.project_name}
                    onChange={(e) => setSettings({ ...settings, project_name: e.target.value })}
                    placeholder="أدخل اسم المشروع"
                    required
                    disabled={isSubmitting}
                    className="bg-gray-50 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-600" />
                    الفئة المستهدفة
                  </Label>
                  <Select
                    value={settings.target_category}
                    onValueChange={(value: "economic" | "medium" | "luxury") =>
                      setSettings({ ...settings, target_category: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-gray-50 focus-visible:ring-indigo-500 focus:ring-indigo-500 border-gray-200">
                      <SelectValue placeholder="اختر الفئة المستهدفة" />
                    </SelectTrigger>
                    <SelectContent className="z-50 shadow-lg border-gray-100">
                      <SelectItem value="economic" className="focus:bg-indigo-50">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span>اقتصادي</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="focus:bg-indigo-50">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          <span>متوسط</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="luxury" className="focus:bg-indigo-50">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                          <span>فاخر</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    يؤثر هذا الإعداد على اقتراحات التسعير وتحليلات السوق
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-indigo-600" />
                    هامش الربح المستهدف
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={20}
                      max={50}
                      value={settings.target_profit}
                      onChange={(e) => setSettings({ ...settings, target_profit: parseInt(e.target.value) || 30 })}
                      required
                      disabled={isSubmitting}
                      className="bg-gray-50 pl-12 focus-visible:ring-indigo-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">%</div>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-2">
                    <p className="text-sm text-muted-foreground">يجب أن تكون النسبة بين 20% و 50%</p>
                    <div className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                      {formatPercent(settings.target_profit)} نسبة الربح الحالية
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {settings.id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <PaymentMethods projectSettingsId={settings.id} />
        </motion.div>
      )}
    </div>
  );
}