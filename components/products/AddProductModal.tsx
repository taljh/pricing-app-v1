"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Package, Tag, DollarSign, Link } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Textarea } from "@/components/ui/textarea"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductCreated: (productId: string) => void
}

export default function AddProductModal({ isOpen, onClose, onProductCreated }: AddProductModalProps) {
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    initial_price: "",
    price: "",
    category: "",
    url: "",
    is_available: true
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { name, sku, description, initial_price, price, category, url, is_available } = formData

      // التحقق من البيانات
      if (!name || !sku || !category) {
        throw new Error('الاسم ورمز المنتج والفئة مطلوبة')
      }

      // الحصول على معرف المستخدم
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('User error:', userError)
        throw new Error(`خطأ في التحقق من المستخدم: ${userError.message}`)
      }
      
      if (!user || !user.id) {
        throw new Error('يجب تسجيل الدخول لإنشاء منتج')
      }

      // إنشاء المنتج
      const rawPayload = {
        name,
        sku,
        description: description || null,
        initial_price: initial_price ? parseFloat(initial_price) : null,
        price: price ? parseFloat(price) : null,
        category,
        url: url || null,
        is_available: is_available !== undefined ? is_available : true,
        user_id: user.id,
        has_pricing: false
      }

      // تصفية القيم الفارغة فقط (لا نصفي null لأنها قيم صالحة)
      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, value]) => value !== undefined)
      )

      console.log('Sending payload:', payload)
      
      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single()

      if (insertError) {
        console.error('Insert error details:', insertError)
        throw new Error(`خطأ في إنشاء المنتج: ${insertError.message || JSON.stringify(insertError)}`)
      }

      if (!product || !product.id) {
        throw new Error('لم يتم إنشاء المنتج بشكل صحيح')
      }

      // إغلاق المودال وإخبار المكون الأب بإنشاء المنتج
      onProductCreated(product.id)
      onClose()
    } catch (err) {
      console.error('Error creating product:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === 'object' && err !== null) {
        setError(`حدث خطأ أثناء إنشاء المنتج: ${JSON.stringify(err)}`)
      } else {
        setError('حدث خطأ غير معروف أثناء إنشاء المنتج')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5 text-indigo-600" />
            إنشاء منتج جديد
          </DialogTitle>
          <DialogDescription>
            أدخل المعلومات الأساسية للمنتج
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">
                اسم المنتج
                <span className="text-destructive mr-1">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="أدخل اسم المنتج"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1.5 border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">
                  رمز المنتج (SKU)
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="ادخل رمز المنتج"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                  className="mt-1.5 border-indigo-100 focus:border-indigo-300"
                />
              </div>
              <div>
                <Label htmlFor="category">
                  فئة المنتج
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="mt-1.5 border-indigo-100 focus:border-indigo-300">
                    <SelectValue placeholder="اختر فئة المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economic" className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      <span>اقتصادي</span>
                    </SelectItem>
                    <SelectItem value="medium" className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                      <span>متوسط</span>
                    </SelectItem>
                    <SelectItem value="luxury" className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                      <span>فاخر</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="أدخل وصفا للمنتج (اختياري)"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1.5 border-indigo-100 focus:border-indigo-300"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="initial_price">التكلفة المبدئية (اختياري)</Label>
              <div className="relative mt-1.5">
                <Input
                  id="initial_price"
                  name="initial_price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initial_price}
                  onChange={handleInputChange}
                  className="text-left pl-4 pr-20 border-indigo-100 focus:border-indigo-300"
                  style={{ direction: 'ltr', textAlign: 'right', paddingRight: '80px' }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-gray-500">
                  ريال سعودي
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                يمكنك تعديل التكلفة لاحقاً عند التسعير.
              </p>
            </div>
            
            <div>
              <Label htmlFor="url">رابط المنتج (اختياري)</Label>
              <div className="relative mt-1.5">
                <Input
                  id="url"
                  name="url"
                  type="text"
                  placeholder="https://example.com/product"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="pl-10 border-indigo-100 focus:border-indigo-300"
                />
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء المنتج'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}