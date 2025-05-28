"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  AlertCircle, 
  Package, 
  Tag, 
  ImageIcon, 
  Upload, 
  X, 
  Edit,
  PlusCircle 
} from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"
import { Product } from "./ProductsList"

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductCreated: (productId: string) => void
  productToEdit?: Product | null
}

// قائمة بالفئات المتاحة
const PRODUCT_CATEGORIES = [
  { value: "economic", label: "اقتصادي", color: "bg-green-500" },
  { value: "medium", label: "متوسط", color: "bg-blue-500" },
  { value: "luxury", label: "فاخر", color: "bg-purple-500" },
  { value: "clothing", label: "ملابس", color: "bg-pink-500" },
  { value: "electronics", label: "إلكترونيات", color: "bg-indigo-500" },
  { value: "food", label: "أغذية", color: "bg-amber-500" },
  { value: "beauty", label: "جمال ومكياج", color: "bg-red-500" },
  { value: "home", label: "منزل ومفروشات", color: "bg-lime-500" },
  { value: "toys", label: "ألعاب وترفيه", color: "bg-cyan-500" },
  { value: "health", label: "صحة وعناية", color: "bg-emerald-500" },
  { value: "other", label: "أخرى", color: "bg-gray-500" },
]

export default function AddProductModal({ isOpen, onClose, onProductCreated, productToEdit }: AddProductModalProps) {
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // حالة الصورة
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    initial_price: "",
    price: "",
    category: "",
    url: "",
    is_available: true,
    image_url: ""
  })
  
  // تعبئة النموذج إذا كان هناك منتج للتعديل
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        sku: productToEdit.sku || "",
        description: productToEdit.description || "",
        initial_price: productToEdit.initial_price ? String(productToEdit.initial_price) : "",
        price: productToEdit.price ? String(productToEdit.price) : "",
        category: productToEdit.category || "",
        url: productToEdit.url || "",
        is_available: productToEdit.is_available !== false,
        image_url: productToEdit.image_url || ""
      });
      
      // إذا كان هناك صورة موجودة
      if (productToEdit.image_url) {
        setImagePreview(productToEdit.image_url);
      } else {
        setImagePreview(null);
      }
    } else {
      // إعادة تعيين النموذج إذا كان إنشاء جديد
      resetForm();
    }
  }, [productToEdit]);

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      initial_price: "",
      price: "",
      category: "",
      url: "",
      is_available: true,
      image_url: ""
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { name, sku, description, price, initial_price, category, url, is_available } = formData

      // التحقق من البيانات الإلزامية
      if (!name) {
        throw new Error('اسم المنتج مطلوب')
      }

      // الحصول على معرف المستخدم
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('يجب تسجيل الدخول لإنشاء منتج')
      }

      // بناء الكائن للإرسال إلى قاعدة البيانات
      const productData: any = {
        name,
        sku: sku || null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        initial_price: initial_price ? parseFloat(initial_price) : null,
        category: category || null,
        url: url || null,
        is_available: is_available !== undefined ? is_available : true,
        user_id: user.id,
      }

      // تحديد ما إذا كان المنتج مسعرًا
      if (price && (price !== "0")) {
        productData.has_pricing = true;
      }

      // رفع الصورة إذا تم إضافتها
      if (imageFile) {
        setIsUploadingImage(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          throw new Error(`خطأ في رفع الصورة: ${uploadError.message}`);
        }
        
        const { data: urlData } = await supabase.storage
          .from('product_images')
          .getPublicUrl(fileName);
          
        productData.image_url = urlData.publicUrl;
        setIsUploadingImage(false);
      } else if (imagePreview && productToEdit?.image_url === imagePreview) {
        // الاحتفاظ بالصورة الحالية إذا لم تتغير
        productData.image_url = imagePreview;
      }

      // تحديد ما إذا كنا نقوم بإنشاء منتج جديد أو تحديث منتج موجود
      if (productToEdit) {
        // تحديث المنتج الموجود
        const { data: product, error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productToEdit.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`خطأ في تحديث المنتج: ${updateError.message}`);
        }

        toast.success('تم تحديث المنتج بنجاح');
        onProductCreated(productToEdit.id);
      } else {
        // إنشاء منتج جديد
        const { data: product, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (insertError) {
          throw new Error(`خطأ في إنشاء المنتج: ${insertError.message}`);
        }

        if (!product || !product.id) {
          throw new Error('لم يتم إنشاء المنتج بشكل صحيح');
        }

        toast.success('تم إنشاء المنتج بنجاح');
        onProductCreated(product.id);
      }
      
      // إغلاق المودال وإعادة تعيين النموذج
      onClose();
      resetForm();
      
    } catch (err) {
      console.error('Error with product:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
      toast.error('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_available: checked
    }));
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  }
  
  // التعامل مع رفع الصورة
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // التحقق من حجم الملف (5 ميجابايت كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة كبير جدًا، يجب أن تكون أقل من 5 ميجابايت");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }
  
  // إزالة الصورة
  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        if (!productToEdit) {
          resetForm();
        }
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700">
            {productToEdit ? (
              <>
                <Edit className="h-5 w-5" />
                تعديل المنتج
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" />
                إضافة منتج جديد
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {productToEdit ? 
              `تعديل بيانات المنتج "${productToEdit.name}"` : 
              "أدخل معلومات المنتج الأساسية، الحقول المميزة بـ * إلزامية"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* اسم المنتج - إلزامي */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-gray-700">
              اسم المنتج
              <span className="text-red-500 mr-1">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="مثال: قميص قطني أبيض"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* رمز المنتج - SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="font-medium text-gray-700">
                رمز المنتج (SKU)
              </Label>
              <Input
                id="sku"
                name="sku"
                placeholder="مثال: ABC-123"
                value={formData.sku}
                onChange={handleInputChange}
                className="focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors"
              />
            </div>
            
            {/* فئة المنتج */}
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium text-gray-700">
                فئة المنتج 
              </Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${category.color}`}></span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* وصف المنتج */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-gray-700">
              وصف المنتج
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="اكتب وصفاً مختصراً للمنتج..."
              value={formData.description}
              onChange={handleInputChange}
              className="focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors min-h-24"
            />
          </div>

          {/* صورة المنتج */}
          <div className="space-y-2">
            <Label className="font-medium text-gray-700">صورة المنتج</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-indigo-100 rounded-lg p-4 text-center bg-indigo-50/50 hover:bg-indigo-50/80 transition-colors cursor-pointer"
                onClick={() => document.getElementById('product-image')?.click()}>
                <div className="flex flex-col items-center gap-2 py-4">
                  <ImageIcon className="h-10 w-10 text-indigo-300" />
                  <p className="text-indigo-600 font-medium">اضغط لرفع صورة</p>
                  <p className="text-xs text-gray-500">JPG, PNG أو GIF حتى 5 ميجابايت</p>
                </div>
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="rounded-lg overflow-hidden border border-indigo-100 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="معاينة صورة المنتج"
                    className="max-h-48 w-full object-contain p-2 bg-white"
                  />
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    type="button"
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => document.getElementById('product-image')?.click()}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    تغيير
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-3 w-3 mr-1" />
                    إزالة
                  </Button>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* سعر التكلفة */}
            <div className="space-y-2">
              <Label htmlFor="initial_price" className="font-medium text-gray-700">
                سعر التكلفة
              </Label>
              <div className="relative">
                <Input
                  id="initial_price"
                  name="initial_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initial_price}
                  onChange={handleInputChange}
                  className="pl-20 text-left focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors"
                  style={{ direction: 'ltr' }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ر.س
                </span>
              </div>
            </div>
            
            {/* سعر البيع */}
            <div className="space-y-2">
              <Label htmlFor="price" className="font-medium text-gray-700">
                سعر البيع
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="pl-20 text-left focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-colors"
                  style={{ direction: 'ltr' }}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  ر.س
                </span>
              </div>
            </div>
          </div>

          {/* متوفر للبيع */}
          <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
            <Label htmlFor="is_available" className="font-medium text-gray-700 cursor-pointer">
              متوفر للبيع
            </Label>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={handleSwitchChange}
            />
          </div>

          <DialogFooter className="pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="ml-2"
              disabled={isSubmitting || isUploadingImage}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isSubmitting || isUploadingImage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isUploadingImage ? 'جاري الرفع...' : 'جاري الحفظ...'}</span>
                </>
              ) : (
                <>
                  {productToEdit ? (
                    <span>حفظ التغييرات</span>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      <span>إضافة المنتج</span>
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}