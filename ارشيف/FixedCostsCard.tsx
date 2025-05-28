"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Save, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { Alert, AlertDescription } from "@/components/ui/alert"

// تعريف أنواع البيانات
type FixedCost = {
  id: string
  name: string
  amount: number
  period: "monthly" | "yearly" | "once"
}

export default function FixedCostsCard() {
  // التكاليف الثابتة
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null)
  const [newCost, setNewCost] = useState<Omit<FixedCost, "id">>({
    name: "",
    amount: 0,
    period: "monthly"
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // تحميل التكاليف الثابتة من قاعدة البيانات
  useEffect(() => {
    async function loadFixedCosts() {
      setIsLoading(true)
      setError(null)
      
      try {
        // التحقق من وجود session حالي
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (!sessionData?.session) {
          setError("يرجى تسجيل الدخول أولاً")
          setIsLoading(false)
          return
        }
        
        // استدعاء دالة الحصول على التكاليف الثابتة
        const { data, error } = await supabase.rpc('get_fixed_costs')
        
        if (error) {
          console.error("خطأ في استرداد التكاليف الثابتة:", error)
          setError("حدث خطأ في تحميل بيانات التكاليف: " + error.message)
          return
        }
        
        // التحقق مما إذا كانت البيانات تحتوي على رسالة خطأ
        if (data && typeof data === 'object' && data.error) {
          console.error("خطأ وظيفي:", data.error)
          setError("حدث خطأ: " + data.error)
          return
        }
        
        // التعامل مع مختلف أنواع البيانات المسترجعة
        if (Array.isArray(data)) {
          // إذا كانت مصفوفة، استخدمها مباشرة
          setFixedCosts(data)
        } else if (data && typeof data === 'object' && Array.isArray(data)) {
          // تعيين التكاليف المستردة
          setFixedCosts(data)
        } else if (data === null || data === undefined) {
          // في حالة عدم وجود بيانات، تعيين مصفوفة فارغة
          console.log("لا توجد تكاليف ثابتة للمستخدم الحالي")
          setFixedCosts([])
        } else {
          // في حالة أي بيانات غير متوقعة
          console.error("تنسيق البيانات المستردة غير معروف:", data)
          setFixedCosts([])
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error)
        setError("حدث خطأ في تحميل بيانات التكاليف")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFixedCosts()
  }, [])
  
  // دوال التكاليف الثابتة
  const handleEditClick = (cost: FixedCost) => {
    setEditingId(cost.id)
    setEditingCost({ ...cost })
  }
  
  const handleSaveEdit = async () => {
    if (editingCost) {
      try {
        setError(null)
        
        // استدعاء دالة تحديث بند التكلفة
        const { data, error } = await supabase.rpc('upsert_fixed_cost', {
          p_id: editingCost.id,
          p_name: editingCost.name,
          p_amount: editingCost.amount,
          p_period: editingCost.period
        })
        
        if (error) {
          console.error("خطأ في تحديث بند التكلفة:", error)
          setError("حدث خطأ في تحديث بند التكلفة: " + error.message)
          return
        }
        
        // التحقق من نجاح العملية من خلال الاستجابة
        if (data && data.success === false) {
          console.error("خطأ وظيفي:", data.error)
          setError("حدث خطأ: " + (data.error || "غير معروف"))
          return
        }
        
        // تحديث واجهة المستخدم
        setFixedCosts(fixedCosts.map(cost => 
          cost.id === editingId ? editingCost : cost
        ))
        
        setEditingId(null)
        setEditingCost(null)
        toast.success("تم تحديث بند التكلفة بنجاح")
      } catch (error) {
        console.error("خطأ غير متوقع:", error)
        setError("حدث خطأ في تحديث بند التكلفة")
      }
    }
  }
  
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingCost(null)
  }
  
  const handleDelete = async (id: string) => {
    try {
      setError(null)
      
      // استدعاء دالة حذف بند التكلفة
      const { data, error } = await supabase.rpc('delete_fixed_cost', {
        p_id: id
      })
      
      if (error) {
        console.error("خطأ في حذف بند التكلفة:", error)
        setError("حدث خطأ في حذف بند التكلفة: " + error.message)
        return
      }
      
      // التحقق من نجاح العملية من خلال الاستجابة
      if (data && data.success === false) {
        console.error("خطأ وظيفي:", data.error)
        setError("حدث خطأ: " + (data.error || "غير معروف"))
        return
      }
      
      // تحديث واجهة المستخدم
      setFixedCosts(fixedCosts.filter(cost => cost.id !== id))
      toast.success("تم حذف بند التكلفة بنجاح")
    } catch (error) {
      console.error("خطأ غير متوقع:", error)
      setError("حدث خطأ في حذف بند التكلفة")
    }
  }
  
  const handleAddNewCost = async () => {
    if (!newCost.name || newCost.amount <= 0) {
      toast.error("يرجى إدخال اسم البند وقيمة موجبة")
      return
    }
    
    try {
      setError(null)
      
      // استدعاء دالة إضافة بند تكلفة جديد
      const { data, error } = await supabase.rpc('upsert_fixed_cost', {
        p_name: newCost.name,
        p_amount: newCost.amount,
        p_period: newCost.period
      })
      
      if (error) {
        console.error("خطأ في إضافة بند تكلفة جديد:", error)
        setError("حدث خطأ في إضافة بند التكلفة: " + error.message)
        return
      }
      
      // التحقق من نجاح العملية من خلال الاستجابة
      if (data && data.success === false) {
        console.error("خطأ وظيفي:", data.error)
        setError("حدث خطأ: " + (data.error || "غير معروف"))
        return
      }
      
      // إستخدام معرف البند المضاف
      const newCostId = data?.id
      
      if (newCostId) {
        // إضافة البند الجديد مباشرة إلى المصفوفة (لتجنب طلب الحصول على البيانات مرة أخرى)
        const newCostItem: FixedCost = {
          id: newCostId,
          name: newCost.name,
          amount: newCost.amount,
          period: newCost.period
        }
        
        setFixedCosts([...fixedCosts, newCostItem])
      } else {
        // إذا لم يتم الحصول على المعرف، استدعاء دالة الحصول على كافة التكاليف لتحديث القائمة بشكل كامل
        const { data: updatedCosts, error: fetchError } = await supabase.rpc('get_fixed_costs')
        
        if (fetchError) {
          console.error("خطأ في تحديث قائمة التكاليف:", fetchError)
        } else if (Array.isArray(updatedCosts)) {
          setFixedCosts(updatedCosts || [])
        }
      }
      
      // إعادة ضبط نموذج الإضافة
      setNewCost({
        name: "",
        amount: 0,
        period: "monthly"
      })
      
      setIsDialogOpen(false)
      toast.success("تم إضافة بند تكلفة جديد بنجاح")
    } catch (error) {
      console.error("خطأ غير متوقع:", error)
      setError("حدث خطأ في إضافة بند التكلفة")
    }
  }
  
  // حساب المجاميع
  const getTotalMonthlyCost = () => {
    return fixedCosts.reduce((total, cost) => {
      if (cost.period === "monthly") return total + cost.amount
      if (cost.period === "yearly") return total + (cost.amount / 12)
      return total
    }, 0)
  }
  
  const getTotalYearlyCost = () => {
    return fixedCosts.reduce((total, cost) => {
      if (cost.period === "monthly") return total + (cost.amount * 12)
      if (cost.period === "yearly") return total + cost.amount
      return total
    }, 0)
  }
  
  // ترجمة نوع الفترة
  const getPeriodText = (period: string) => {
    switch (period) {
      case "monthly": return "شهري"
      case "yearly": return "سنوي"
      case "once": return "مرة واحدة"
      default: return period
    }
  }
  
  // عرض شاشة التحميل أثناء استرداد البيانات
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-r-indigo-600"></div>
      </div>
    )
  }
  
  return (
    <div>
      {/* عرض رسالة الخطأ إذا وجدت */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-medium">قائمة التكاليف الثابتة</h3>
          <p className="text-sm text-muted-foreground">
            إدارة التكاليف الثابتة المتعلقة بالمشروع والتي تستخدم في حسابات التسعير
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 ml-1" />
              إضافة بند جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">إضافة بند تكلفة جديد</DialogTitle>
            </DialogHeader>
            
            <div className="my-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="costName" className="font-medium">اسم البند</Label>
                <Input 
                  id="costName" 
                  placeholder="أدخل اسم بند التكلفة" 
                  value={newCost.name}
                  onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="costAmount" className="font-medium">المبلغ</Label>
                <Input 
                  id="costAmount" 
                  type="number" 
                  placeholder="أدخل قيمة البند" 
                  min="0"
                  value={newCost.amount || ''}
                  onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="costPeriod" className="font-medium">الفترة</Label>
                <select 
                  id="costPeriod"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCost.period}
                  onChange={(e) => setNewCost({ ...newCost, period: e.target.value as "monthly" | "yearly" | "once" })}
                >
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي</option>
                  <option value="once">مرة واحدة</option>
                </select>
              </div>
            </div>
            
            <DialogFooter className="flex-row-reverse gap-2">
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAddNewCost}>
                إضافة البند
              </Button>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[240px]">اسم البند</TableHead>
              <TableHead className="w-[120px]">المبلغ</TableHead>
              <TableHead className="w-[120px]">الفترة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixedCosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  لا توجد بنود تكلفة مضافة. أضف بندًا جديدًا للبدء.
                </TableCell>
              </TableRow>
            ) : (
              fixedCosts.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell className="font-medium">
                    {editingId === cost.id ? (
                      <Input 
                        value={editingCost?.name} 
                        onChange={(e) => setEditingCost({ ...editingCost!, name: e.target.value })}
                      />
                    ) : (
                      cost.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === cost.id ? (
                      <Input 
                        type="number"
                        min="0"
                        value={editingCost?.amount || ''} 
                        onChange={(e) => setEditingCost({ ...editingCost!, amount: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <span className="tabular-nums">{cost.amount.toLocaleString()} ر.س</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === cost.id ? (
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={editingCost?.period} 
                        onChange={(e) => setEditingCost({ ...editingCost!, period: e.target.value as "monthly" | "yearly" | "once" })}
                      >
                        <option value="monthly">شهري</option>
                        <option value="yearly">سنوي</option>
                        <option value="once">مرة واحدة</option>
                      </select>
                    ) : (
                      getPeriodText(cost.period)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === cost.id ? (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={handleSaveEdit} title="حفظ">
                          <Save className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} title="إلغاء">
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => handleEditClick(cost)} title="تعديل">
                          <Pencil className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(cost.id)} title="حذف">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {fixedCosts.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md border flex justify-between items-center">
          <div className="space-y-1">
            <div className="font-medium text-sm">إجمالي التكاليف الشهرية: <span className="text-indigo-700 font-semibold">{getTotalMonthlyCost().toLocaleString()} ر.س</span></div>
            <div className="font-medium text-sm">إجمالي التكاليف السنوية: <span className="text-indigo-700 font-semibold">{getTotalYearlyCost().toLocaleString()} ر.س</span></div>
          </div>
          
          <Button variant="outline" size="sm" className="gap-1">
            <span>تصدير البيانات</span>
          </Button>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm mt-8">
        <h3 className="font-bold text-blue-800 mb-2">ملاحظة مهمة حول التكاليف الثابتة:</h3>
        <p className="text-blue-700">
          يتم استخدام بيانات التكاليف الثابتة تلقائيًا في حاسبة المشروع لتقدير تكلفة المنتج وهامش الربح بشكل أكثر دقة.
          للحصول على تقديرات دقيقة للتكاليف، يُنصح بإدخال كافة البنود المتعلقة بمشروعك.
        </p>
      </div>
    </div>
  )
}