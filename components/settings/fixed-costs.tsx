"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Trash2, Edit2, Loader2, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FixedCostsProps {
  userId: string;
}

interface FixedCost {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly";
  created_at: string;
  updated_at: string;
}

const periods = [
  { value: "monthly", label: "شهري", description: "تكلفة متكررة كل شهر" },
  { value: "yearly", label: "سنوي", description: "تكلفة متكررة كل سنة" },
];

export function FixedCosts({ userId }: FixedCostsProps) {
  const [supabase] = useState(() => createClientComponentClient());
  const { toast } = useToast();
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCosts(data || []);
    } catch (error) {
      console.error("Error fetching fixed costs:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب التكاليف الثابتة",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const costData = {
        name: formData.get("name"),
        amount: Number(formData.get("amount")),
        period: formData.get("period"),
        user_id: userId,
      };

      if (editingCost) {
        const { error } = await supabase
          .from("fixed_costs")
          .update(costData)
          .eq("id", editingCost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("fixed_costs")
          .insert([costData]);

        if (error) throw error;
      }

      toast({
        title: "تم الحفظ",
        description: editingCost ? "تم تحديث التكلفة بنجاح" : "تم إضافة التكلفة بنجاح",
      });

      setIsDialogOpen(false);
      setEditingCost(null);
      fetchCosts();
    } catch (error) {
      console.error("Error saving fixed cost:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التكلفة",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fixed_costs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف التكلفة بنجاح",
      });

      fetchCosts();
    } catch (error) {
      console.error("Error deleting fixed cost:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التكلفة",
      });
    }
  };

  const handleEdit = (cost: FixedCost) => {
    setEditingCost(cost);
    setIsDialogOpen(true);
  };

  const totalMonthlyCost = costs.reduce((total, cost) => {
    return total + (cost.period === "monthly" ? cost.amount : cost.amount / 12);
  }, 0);

  const totalYearlyCost = costs.reduce((total, cost) => {
    return total + (cost.period === "yearly" ? cost.amount : cost.amount * 12);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">جاري تحميل التكاليف الثابتة...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50 opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">التكاليف الثابتة</CardTitle>
              <CardDescription className="mt-1">
                إدارة التكاليف الثابتة للمشروع
              </CardDescription>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-2 rounded-full bg-primary/10 text-primary"
            >
              <CreditCard className="h-6 w-6" />
            </motion.div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* ملخص التكاليف */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-500">إجمالي التكاليف الشهرية</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalMonthlyCost.toLocaleString('ar-SA')} ريال
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-500">إجمالي التكاليف السنوية</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalYearlyCost.toLocaleString('ar-SA')} ريال
                </p>
              </motion.div>
            </div>

            {/* قائمة التكاليف */}
            <div className="space-y-4">
              {costs.map((cost, index) => (
                <motion.div
                  key={cost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{cost.name}</h3>
                      <p className="text-sm text-gray-500">
                        {cost.amount.toLocaleString('ar-SA')} ريال
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gray-100">
                      {cost.period === "monthly" ? "شهري" : "سنوي"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(cost)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cost.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {costs.length === 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    لا توجد تكاليف ثابتة مضافة. قم بإضافة تكلفة جديدة للبدء.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* زر إضافة تكلفة جديدة */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة تكلفة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCost ? "تعديل التكلفة" : "إضافة تكلفة جديدة"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCost
                      ? "قم بتعديل تفاصيل التكلفة الثابتة"
                      : "أدخل تفاصيل التكلفة الثابتة الجديدة"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم التكلفة</Label>
                    <Input
                      name="name"
                      defaultValue={editingCost?.name}
                      placeholder="مثال: إيجار المكتب"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ</Label>
                    <Input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={editingCost?.amount}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الفترة</Label>
                    <Select
                      name="period"
                      defaultValue={editingCost?.period || "monthly"}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفترة" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            <div className="flex flex-col">
                              <span>{period.label}</span>
                              <span className="text-xs text-gray-500">
                                {period.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingCost(null);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 