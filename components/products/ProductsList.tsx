"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  Package, 
  PlusCircle, 
  Search, 
  Tag, 
  Check, 
  Clock, 
  Edit, 
  ExternalLink, 
  Filter, 
  TrendingUp,
  RotateCcw
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from '@/types/supabase'
import AddProductModal from "./AddProductModal"
import { Skeleton } from "@/components/ui/skeleton"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"

export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  cost: number;
  price: number;
  user_id: string;
  has_pricing: boolean; // Added property
  sku?: string; // Added sku property
  initial_price?: number; // Added initial_price property
  category?: string; // Added category property
  url?: string; // Added url property
  image_url?: string; // Added for product image
};

interface ProductsListProps {
  initialProducts: Product[];
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'priced' | 'not-priced'>('all')
  
  // استخدام هوك الشاشة للتحقق من الأجهزة المحمولة
  const { isMobile, isTablet } = useScreenInfo();
  const { isRTL, flipIcon } = useRTL();

  // تحديث قائمة المنتجات من قاعدة البيانات
  const refreshProducts = async () => {
    try {
      setIsRefreshing(true)
      const supabase = createClientComponentClient<Database>()
      
      // التحقق من المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // جلب المنتجات
      const { data: productsList, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setProducts(productsList || [])
      applyFilters(productsList || [], searchTerm, filter)
    } catch (error) {
      console.error('خطأ في تحديث المنتجات:', error)
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }

  // تطبيق الفلاتر على المنتجات
  const applyFilters = (productsList: Product[], term: string, filterType: string) => {
    let filtered = productsList
    
    // البحث بالاسم أو الرمز
    if (term) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(term.toLowerCase()) || 
        p.sku?.toLowerCase().includes(term.toLowerCase()) ||
        p.category?.toLowerCase().includes(term.toLowerCase())
      )
    }
    
    // فلترة حسب التسعير
    if (filterType === 'priced') {
      filtered = filtered.filter(p => p.has_pricing)
    } else if (filterType === 'not-priced') {
      filtered = filtered.filter(p => !p.has_pricing)
    }
    
    setFilteredProducts(filtered)
  }

  // التعامل مع تغييرات البحث
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    applyFilters(products, term, filter)
  }
  
  // التعامل مع تغييرات الفلتر
  const handleFilterChange = (filterType: 'all' | 'priced' | 'not-priced') => {
    setFilter(filterType)
    applyFilters(products, searchTerm, filterType)
  }

  // حساب هامش الربح للمنتج
  const calculateProfitMargin = (product: Product) => {
    if (product.has_pricing && product.price && product.initial_price && product.initial_price > 0) {
      const profitMargin = ((product.price - product.initial_price) / product.price) * 100;
      return Math.round(profitMargin);
    }
    return null;
  }

  // إنشاء منتج جديد
  const handleProductCreated = (productId: string) => {
    refreshProducts();
    setAddModalOpen(false);
  }
  
  // تنسيق السعر والأرقام بالريال السعودي
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency: 'SAR',
      maximumFractionDigits: 0,
      currencyDisplay: 'narrowSymbol'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة منتجاتك وتكاليفها وأسعارها
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 flex-1 sm:flex-none"
            onClick={() => setAddModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isMobile ? "إضافة" : "إضافة منتج جديد"}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 border-gray-200"
            onClick={refreshProducts}
            disabled={isRefreshing}
          >
            <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {/* شريط البحث والفلترة - مناسب لجميع الأحجام */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`${isRTL ? 'pl-4 pr-10' : 'pl-10 pr-4'} border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
          />
        </div>
        <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleFilterChange('all')}
            className={`whitespace-nowrap ${filter === 'all' ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
          >
            <Filter className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            الكل
          </Button>
          <Button 
            variant={filter === 'priced' ? "default" : "outline"}
            size="sm" 
            onClick={() => handleFilterChange('priced')}
            className={`whitespace-nowrap ${filter === 'priced' ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <Check className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            مسعّر
          </Button>
          <Button 
            variant={filter === 'not-priced' ? "default" : "outline"}
            size="sm" 
            onClick={() => handleFilterChange('not-priced')}
            className={`whitespace-nowrap ${filter === 'not-priced' ? "bg-amber-600 hover:bg-amber-700" : ""}`}
          >
            <Clock className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            غير مسعّر
          </Button>
        </div>
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-8 w-full rounded" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded" />
                    <Skeleton className="h-8 flex-1 rounded" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* حالة عدم وجود منتجات */}
      {!isLoading && filteredProducts.length === 0 && (
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-slate-50 mb-4">
              <Package className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchTerm || filter !== 'all' ? "لا توجد منتجات تطابق البحث" : "لا توجد منتجات"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? "قم بتغيير معايير البحث للعثور على المنتجات" 
                : "قم بإضافة منتجك الأول للبدء في إدارة منتجاتك وتسعيرها"}
            </p>
            {!searchTerm && filter === 'all' && (
              <Button 
                onClick={() => setAddModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              >
                <PlusCircle className="h-4 w-4" />
                <span>إضافة منتج جديد</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* قائمة المنتجات */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const profitMargin = calculateProfitMargin(product);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <Card className="h-full border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      {/* عرض المنتج */}
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} width={56} height={56} className="object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                            {product.category && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {product.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{product.sku || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-gray-500">السعر:</span>
                        <span className={`font-medium ${product.has_pricing ? "text-green-700" : "text-gray-700"}`}>
                          {product.price ? formatPrice(product.price) : "غير محدد"}
                        </span>
                      </div>
                      
                      {profitMargin !== null && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-gray-500">هامش الربح:</span>
                            <div className="flex items-center gap-1 text-indigo-700">
                              <TrendingUp className="h-3 w-3" />
                              <span>{profitMargin}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                profitMargin < 15 ? 'bg-red-500' : 
                                profitMargin < 30 ? 'bg-amber-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(profitMargin, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <Separator className="my-4" />
                      
                      <div className="flex flex-col gap-3">
                        <Link href={`/pricing/calculator?product_id=${product.id}`} className="w-full">
                          <Button
                            className={`w-full gap-2 ${product.has_pricing 
                              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200" 
                              : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"}`}
                            size="sm"
                          >
                            {product.has_pricing ? (
                              <>
                                <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                تعديل التسعير
                              </>
                            ) : (
                              <>
                                <Tag className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                تسعير المنتج
                              </>
                            )}
                          </Button>
                        </Link>

                        <div className="flex gap-2 w-full">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 text-gray-700"
                          >
                            <Edit className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {isMobile ? "" : "تعديل"}
                          </Button>
                          
                          {product.url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 text-gray-700"
                              onClick={() => window.open(product.url, '_blank')}
                            >
                              <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {isMobile ? "" : "عرض"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* مودال إضافة منتج جديد */}
      <AddProductModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
}
