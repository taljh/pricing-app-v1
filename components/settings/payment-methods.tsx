"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Database } from "@/types/supabase";
import { Loader2, CreditCard, Wallet, Banknote, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PaymentMethodsProps {
  projectSettingsId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  default_fee: number;
  created_at: string;
  updated_at: string;
}

interface ProjectPaymentMethod {
  id: string;
  project_settings_id: string;
  payment_method_code: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const getPaymentMethodIcon = (code: string) => {
  switch (code.toLowerCase()) {
    case 'credit_card':
      return <CreditCard className="h-5 w-5" />;
    case 'bank_transfer':
      return <Banknote className="h-5 w-5" />;
    case 'wallet':
      return <Wallet className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
};

export function PaymentMethods({ projectSettingsId }: PaymentMethodsProps) {
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [projectMethods, setProjectMethods] = useState<ProjectPaymentMethod[]>([]);

  useEffect(() => {
    if (projectSettingsId) {
      fetchPaymentMethods();
    }
  }, [projectSettingsId]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      
      const { data: methods, error: methodsError } = await supabase
        .from("payment_methods")
        .select("*")
        .order("name");

      if (methodsError) throw methodsError;

      const { data: projectMethods, error: projectMethodsError } = await supabase
        .from("project_payment_methods")
        .select("*")
        .eq("project_settings_id", projectSettingsId);

      if (projectMethodsError) throw projectMethodsError;

      setAvailableMethods(methods || []);
      setProjectMethods(projectMethods || []);

      const existingCodes = new Set(projectMethods?.map(m => m.payment_method_code) || []);
      const newMethods = methods?.filter(m => !existingCodes.has(m.code)) || [];

      if (newMethods.length > 0) {
        const newProjectMethods = newMethods.map(method => ({
          project_settings_id: projectSettingsId,
          payment_method_code: method.code,
          is_enabled: false,
        }));

        const { error: insertError } = await supabase
          .from("project_payment_methods")
          .insert(newProjectMethods);

        if (insertError) throw insertError;

        const { data: updatedProjectMethods, error: fetchError } = await supabase
          .from("project_payment_methods")
          .select("*")
          .eq("project_settings_id", projectSettingsId);

        if (fetchError) throw fetchError;
        setProjectMethods(updatedProjectMethods || []);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب طرق الدفع",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMethod = async (methodCode: string, isEnabled: boolean) => {
    try {
      setIsSaving(true);
      const method = projectMethods.find(m => m.payment_method_code === methodCode);
      
      if (!method) {
        throw new Error("Payment method not found");
      }

      const { error } = await supabase
        .from("project_payment_methods")
        .update({ is_enabled: isEnabled })
        .eq("id", method.id);

      if (error) throw error;

      setProjectMethods(prev =>
        prev.map(m =>
          m.payment_method_code === methodCode
            ? { ...m, is_enabled: isEnabled }
            : m
        )
      );

      toast({
        title: "تم التحديث بنجاح",
        description: isEnabled ? "تم تفعيل طريقة الدفع" : "تم تعطيل طريقة الدفع",
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث طريقة الدفع",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  const enabledMethodsCount = projectMethods.filter(m => m.is_enabled).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">طرق الدفع</CardTitle>
              <CardDescription className="mt-1">
                قم بتفعيل طرق الدفع التي تريد استخدامها في مشروعك
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {enabledMethodsCount} من {availableMethods.length} مفعلة
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {availableMethods.map((method) => {
              const projectMethod = projectMethods.find(
                (m) => m.payment_method_code === method.code
              );
              
              if (!projectMethod) return null;

              return (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getPaymentMethodIcon(method.code)}
                    </div>
                    <div>
                      <h3 className="font-medium">{method.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          رسوم: {method.default_fee}%
                        </span>
                        {projectMethod.updated_at && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(projectMethod.updated_at).toLocaleString("ar-SA")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={projectMethod.is_enabled}
                    onCheckedChange={(checked) =>
                      handleToggleMethod(method.code, checked)
                    }
                    disabled={isSaving}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 