"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Edit, ExternalLink, Check, Clock, ShoppingCart, Tag, Wallet, 
  LineChart, BarChart3, ChevronDown, ChevronUp, TrendingUp, Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import type { Product } from "@/types/products"

interface ProductListProps {
  products: Product[]
  loading: boolean
  onRefresh: () => void
  isFiltered?: boolean
}

export default function ProductList({ products, loading, onRefresh, isFiltered = false }: ProductListProps) {
  // حالة إظهار ملخص الأسعار لكل منتج
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)

  const toggleExpandProduct = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id)
  }

  // الحصول على سعر العرض الصحيح للمنتج
  const getDisplayPrice = (product: Product) => {
    // إذا تم تسعير المنتج، نستخدم السعر النهائي
    if (product.has_pricing && product.price) {
      return product.price.toFixed(2)
    } 
    // إذا لم يتم تسعير المنتج، نستخدم السعر المبدئي
    else if (product.initial_price) {
      return product.initial_price.toFixed(2)
    }
    // إذا لم تتوفر أي أسعار
    return "غير محدد"
  }

  // حساب هامش الربح للمنتج
  const calculateProfitMargin = (product: Product) => {
    if (product.has_pricing && product.price && product.initial_price && product.initial_price > 0) {
      const profitMargin = ((product.price - product.initial_price) / product.price) * 100;
      return Math.round(profitMargin);
    }
    return null;
  }

  // إذا كانت القائمة فارغة
  if (!loading && products.length === 0) {
    return (
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-amber-50 mb-4">
            <ShoppingCart className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {isFiltered ? "لا توجد منتجات تطابق الفلتر" : "لا توجد منتجات"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {isFiltered
              ? "قم بتعديل معايير الفلترة للعثور على المنتجات"
              : "لم يتم العثور على أي منتجات في حسابك. قم بإضافة منتجات."}
          </p>
          {!isFiltered && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onRefresh}
                className="bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
              >
                تحديث المنتجات
              </Button>
              <Button variant="outline">إضافة منتج يدويًا</Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // تحميل النموذج المبدئي
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="mr-4 flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex">
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md mr-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // البطاقات المتقدمة للمنتجات
  return (
    <div className="space-y-4" dir="rtl">
      {products.map((product) => {
        const profitMargin = calculateProfitMargin(product);
        const isExpanded = expandedProductId === product.id;
        
        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className={`overflow-hidden border ${isExpanded ? 'border-indigo-200 shadow-md' : 'border-gray-100'} transition-all duration-300 hover:shadow-md`}>
              <CardContent className="p-0">
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                  {/* صورة المنتج */}
                  <div className="relative h-24 w-24 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* معلومات المنتج */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      {product.category && (
                        <Badge
                          variant="outline"
                          className="mr-2 text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                        >
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      {product.sku && (
                        <span className="inline-flex items-center text-xs">
                          <span className="text-gray-400">SKU:</span>
                          <span className="mr-1 font-mono">{product.sku}</span>
                        </span>
                      )}

                      {/* حالة التسعير */}
                      {product.has_pricing ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200 whitespace-nowrap flex items-center gap-1"
                        >
                          <Check className="h-3 w-3 ml-1" />
                          تم التسعير
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3 ml-1" />
                          بانتظار التسعير
                        </Badge>
                      )}

                      {/* سعر المنتج الحالي - مع التمييز بين المسعّر والغير مسعّر */}
                      <span className={`inline-flex items-center text-sm font-medium ${product.has_pricing ? 'text-green-700' : 'text-gray-700'}`}>
                        {getDisplayPrice(product)} ريال
                        {!product.has_pricing && product.initial_price && (
                          <span className="text-xs text-gray-500 mr-1">(سعر مبدئي)</span>
                        )}
                      </span>
                      
                      {/* هامش الربح */}
                      {profitMargin !== null && (
                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                          <TrendingUp className="h-3 w-3" /> هامش الربح {profitMargin}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-start gap-2 sm:flex-col md:flex-row md:items-center">
                    <Link href={`/pricing/calculator?productId=${product.id}`} passHref>
                      <Button
                        className={`gap-2 ${product.has_pricing ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                        size="sm"
                      >
                        {product.has_pricing ? (
                          <>
                            <Edit className="h-4 w-4 ml-1" />
                            تعديل التسعير
                          </>
                        ) : (
                          <>
                            <Wallet className="h-4 w-4 ml-1" />
                            تسعير المنتج
                          </>
                        )}
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-9 h-9 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>خيارات المنتج</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleExpandProduct(product.id)}>
                          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                        </DropdownMenuItem>
                        {product.url && (
                          <DropdownMenuItem>
                            <a href={product.url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center">
                              <ExternalLink className="h-4 w-4 ml-2" />
                              عرض في المتجر
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل المنتج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* معلومات إضافية - تظهر عند التوسيع */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Separator className="my-1" />
                      <div className="p-4 bg-gray-50/70">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                          {/* بيانات التكلفة والتسعير */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                              <BarChart3 className="h-4 w-4 text-indigo-500" />
                              بيانات التسعير
                            </h4>
                            
                            <div className="space-y-2.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">السعر الأصلي:</span>
                                <span className="font-medium">{product.initial_price?.toFixed(2) || "غير متوفر"} ريال</span>
                              </div>
                              
                              {product.has_pricing && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">السعر النهائي:</span>
                                    <span className="font-medium text-green-600">{product.price?.toFixed(2)} ريال</span>
                                  </div>
                                  
                                  {profitMargin !== null && (
                                    <div className="pt-2 border-t border-dashed border-gray-200">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-gray-600">هامش الربح:</span>
                                        <span className="font-semibold text-indigo-700">{profitMargin}%</span>
                                      </div>
                                      <Progress value={Math.min(profitMargin, 100)} className="h-1.5" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* معلومات المنتج */}
                          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm md:col-span-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                              <Tag className="h-4 w-4 text-indigo-500" />
                              معلومات إضافية
                            </h4>
                            
                            {product.description ? (
                              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">لا يوجد وصف لهذا المنتج</p>
                            )}
                          </div>
                        </div>
                        
                        {/* أزرار الإجراءات */}
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/pricing/calculator?productId=${product.id}`} passHref>
                            <Button size="sm" variant="outline" className="gap-1 text-xs">
                              <LineChart className="h-3.5 w-3.5 ml-1" />
                              تحليل التسعير
                            </Button>
                          </Link>

                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <Edit className="h-3.5 w-3.5 ml-1" />
                            تعديل بيانات المنتج
                          </Button>

                          {product.url && (
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1 text-xs">
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                عرض في المتجر
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  )
}
