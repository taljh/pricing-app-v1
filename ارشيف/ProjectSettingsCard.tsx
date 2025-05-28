"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { InfoIcon, PercentIcon, AlertTriangle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabaseClient"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"

// الفئات المستهدفة
const targetCategories = [
	{ value: "luxury", label: "منتجات فاخرة" },
	{ value: "medium", label: "منتجات متوسطة" },
	{ value: "economy", label: "منتجات اقتصادية" },
	{ value: "all", label: "كافة الفئات" },
]

// تعريف نوع طريقة الدفع
type PaymentMethod = {
	id: string
	name: string
	fee: number
	enabled: boolean
}

// تعريف نوع طريقة الدفع كما تأتي من السيرفر
type ServerPaymentMethod = {
	id: string
	name?: string
	fee?: number
	enabled?: boolean
}

export default function ProjectSettingsCard() {
	// إعدادات المشروع
	const [projectName, setProjectName] = useState("نظام تسعير المنتجات المتقدم")
	const [targetCategory, setTargetCategory] = useState("medium")
	const [targetProfit, setTargetProfit] = useState(30) // نسبة الربح المستهدفة
	const [isSaving, setIsSaving] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// استخدام سياق المصادقة
	const { isAuthenticated, user, isLoading: authLoading } = useAuth()

	// طرق الدفع المتاحة
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
		{ id: "apple-pay", name: "ابل باي", fee: 2.9, enabled: false },
		{ id: "mada", name: "مدى", fee: 1.5, enabled: true },
		{ id: "visa", name: "فيزا", fee: 2.5, enabled: true },
		{ id: "mastercard", name: "ماستركارد", fee: 2.5, enabled: true },
		{ id: "tabby", name: "تابي", fee: 3.5, enabled: false },
		{ id: "tamara", name: "تمارا", fee: 3.2, enabled: false },
		{ id: "stcpay", name: "اس تي سي باي", fee: 2.0, enabled: false },
	])

	// تحديد وإلغاء طريقة دفع
	const togglePaymentMethod = (id: string) => {
		setPaymentMethods(prev => {
			return prev.map(method => {
				if (method.id === id) {
					return { ...method, enabled: !method.enabled }
				}
				return method
			})
		})
	}

	// الحصول على طريقة الدفع ذات الرسوم الأعلى
	const getHighestFeesMethod = () => {
		const enabledMethods = paymentMethods.filter(method => method.enabled)
		if (enabledMethods.length === 0) return null
		
		return enabledMethods.reduce((highest, current) => {
			return current.fee > highest.fee ? current : highest
		}, enabledMethods[0])
	}

	// طريقة الدفع ذات الرسوم الأعلى
	const highestFeeMethod = getHighestFeesMethod()

	// تغيير قيمة الربح المستهدف
	const handleTargetProfitChange = (value: number[]) => {
		setTargetProfit(value[0])
	}

	// تعيين قيمة الربح المستهدف لقيم محددة مسبقًا
	const setPresetTargetProfit = (percentage: number) => {
		setTargetProfit(percentage)
	}

	// تحميل البيانات من قاعدة البيانات
	useEffect(() => {
		let isMounted = true;
		
		async function loadSettings() {
			if (!isMounted) return;
			
			setIsLoading(true)
			setError(null)
      
			try {
				// انتظر اكتمال تحميل حالة المصادقة
				if (authLoading) return;
				
				// التحقق من حالة المصادقة
				if (!isAuthenticated || !user) {
					setError("يرجى تسجيل الدخول أولاً")
					setIsLoading(false)
					return
				}
				
				// استخدام الدالة المخصصة لاسترداد إعدادات المشروع مع تمرير معرف المستخدم بشكل صريح
				const { data, error } = await supabase.rpc('get_project_settings', {
					p_user_id: user.id
				});
				
				// التعامل مع الأخطاء بشكل أفضل
				if (error) {
					console.error("خطأ في استرداد إعدادات المشروع:", error)
					setError("حدث خطأ في تحميل الإعدادات: " + error.message)
					return
				}
				
				// التحقق من وجود خطأ تم إرجاعه من الدالة
				if (data && typeof data === 'object' && data.error) {
					console.error("خطأ وظيفي:", data.error)
					setError(typeof data.error === 'string' ? data.error : "حدث خطأ غير معروف")
					return
				}
				
				// التحقق من هيكل البيانات المسترجعة
				if (data && typeof data === 'object' && data.settings) {
					// تعيين البيانات الأساسية للمشروع
					setProjectName(data.settings.project_name || "نظام تسعير المنتجات المتقدم")
					setTargetCategory(data.settings.target_category || "medium")
					setTargetProfit(data.settings.target_profit || 30)
				}
				
				// التعامل مع طرق الدفع
				if (data && typeof data === 'object' && data.payment_methods && Array.isArray(data.payment_methods)) {
					// دمج بيانات طرق الدفع المسترجعة مع البيانات الموجودة محليًا
					const updatedPaymentMethods = paymentMethods.map(method => {
						const serverMethod = data.payment_methods.find((m: ServerPaymentMethod) => m.id === method.id)
						if (serverMethod) {
							return {
								...method,
								name: serverMethod.name || method.name,
								fee: typeof serverMethod.fee === 'number' ? serverMethod.fee : method.fee,
								enabled: Boolean(serverMethod.enabled)
							}
						}
						return method
					})
					
					setPaymentMethods(updatedPaymentMethods)
				}
			} catch (error) {
				console.error("خطأ غير متوقع:", error)
				setError(error instanceof Error ? error.message : "حدث خطأ غير متوقع")
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}
		
		loadSettings()
		
		return () => {
			isMounted = false;
		}
	}, [isAuthenticated, user, authLoading])

	// حفظ الإعدادات إلى قاعدة البيانات
	const handleSaveSettings = async () => {
		setIsSaving(true)
		setError(null)
		
		try {
			// التحقق من حالة المصادقة باستخدام السياق
			if (!isAuthenticated || !user) {
				setError("يرجى تسجيل الدخول أولاً")
				setIsSaving(false)
				return
			}
			
			// التحقق من صحة البيانات قبل الإرسال
			if (!projectName?.trim()) {
				setError("يرجى إدخال اسم للمشروع")
				setIsSaving(false)
				return
			}
			
			// تحضير بيانات طرق الدفع للإرسال
			const paymentMethodsData = paymentMethods.map(method => ({
				id: method.id,
				enabled: method.enabled
			}))
			
			// استدعاء وظيفة تحديث الإعدادات مع تمرير معرف المستخدم بشكل صريح
			const { data, error } = await supabase.rpc('update_project_settings', {
				p_user_id: user.id,
				p_project_name: projectName,
				p_target_category: targetCategory,
				p_target_profit: targetProfit,
				p_payment_methods: paymentMethodsData
			})
			
			if (error) {
				console.error("خطأ في حفظ الإعدادات:", error)
				setError("حدث خطأ في حفظ الإعدادات: " + error.message)
				return
			}
			
			// التحقق من نجاح العملية من خلال الاستجابة
			if (data && typeof data === 'object' && data.success === false) {
				console.error("خطأ وظيفي:", data.error)
				setError(typeof data.error === 'string' ? data.error : "حدث خطأ غير معروف")
				return
			}
			
			toast.success("تم حفظ إعدادات المشروع بنجاح")
		} catch (error) {
			console.error("خطأ غير متوقع:", error)
			setError(error instanceof Error ? error.message : "حدث خطأ غير متوقع")
		} finally {
			setIsSaving(false)
		}
	}

	// عرض شاشة التحميل أثناء استرداد البيانات
	if (authLoading || isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-r-indigo-600"></div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
      {/* عرض رسالة الخطأ إذا وجدت */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 ml-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    
			<div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
				<p className="text-blue-900 text-sm">
					هذه الإعدادات تؤثر على كيفية عمل النظام وتسعير المنتجات. سيتم تطبيق رسوم طريقة الدفع ذات التكلفة الأعلى على حسابات التسعير.
				</p>
			</div>

			<div className="space-y-8">
				<div className="space-y-4 max-w-xl">
					<Label htmlFor="projectName" className="text-base font-medium">
						اسم المشروع
					</Label>
					<Input
						id="projectName"
						placeholder="أدخل اسم المشروع"
						value={projectName}
						onChange={(e) => setProjectName(e.target.value)}
						className="max-w-md"
					/>
					<p className="text-sm text-muted-foreground">
						سيظهر هذا الاسم في واجهة النظام والتقارير
					</p>
				</div>

				<div className="space-y-4 max-w-xl">
					<Label htmlFor="targetCategory" className="text-base font-medium">
						الفئة المستهدفة
					</Label>
					<Select value={targetCategory} onValueChange={setTargetCategory}>
						<SelectTrigger className="max-w-md">
							<SelectValue placeholder="اختر الفئة المستهدفة" />
						</SelectTrigger>
						<SelectContent>
							{targetCategories.map((category) => (
								<SelectItem key={category.value} value={category.value}>
									{category.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">
						تساعد هذه الفئة في تخصيص إستراتيجيات التسعير وتحليل الأرباح
					</p>
				</div>

				{/* الربح المستهدف */}
				<div className="space-y-4 max-w-xl border-t pt-6">
					<div className="flex items-center gap-3 mb-2">
						<PercentIcon className="h-5 w-5 text-indigo-600" />
						<Label htmlFor="targetProfit" className="text-base font-medium">
							نسبة الربح المستهدفة
						</Label>
					</div>
					
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">أقل ربحية</span>
							<span className="text-lg font-semibold">{targetProfit}%</span>
							<span className="text-sm text-gray-500">ربحية عالية</span>
						</div>
						
						<Slider
							id="targetProfit"
							value={[targetProfit]}
							min={10}
							max={80}
							step={1}
							onValueChange={handleTargetProfitChange}
							className="py-2"
						/>
						
						<div className="flex justify-between gap-2 mt-2">
							<Button 
								variant="outline" 
								size="sm" 
								className={targetProfit === 20 ? "bg-indigo-50 border-indigo-200" : ""}
								onClick={() => setPresetTargetProfit(20)}
							>20%</Button>
							<Button 
								variant="outline" 
							size="sm" 
								className={targetProfit === 30 ? "bg-indigo-50 border-indigo-200" : ""}
								onClick={() => setPresetTargetProfit(30)}
							>30%</Button>
							<Button 
								variant="outline" 
							size="sm" 
								className={targetProfit === 40 ? "bg-indigo-50 border-indigo-200" : ""}
								onClick={() => setPresetTargetProfit(40)}
							>40%</Button>
							<Button 
								variant="outline" 
								size="sm" 
								className={targetProfit === 50 ? "bg-indigo-50 border-indigo-200" : ""}
								onClick={() => setPresetTargetProfit(50)}
							>50%</Button>
						</div>
					</div>
					
					<Card className="p-4 bg-indigo-50 border-indigo-200 mt-2">
						<div className="flex gap-3 items-start">
							<InfoIcon className="h-5 w-5 text-indigo-600 mt-0.5" />
							<div>
								<h4 className="font-medium text-indigo-900">حول نسبة الربح المستهدفة</h4>
								<p className="text-sm text-indigo-700 mt-1">
									تستخدم نسبة الربح المستهدفة لأغراض التحليل وتوفير التوصيات لتحقيق الهدف المالي للمشروع. 
									يمكن تخصيص هامش ربح مختلف لكل منتج عند تسعيره بشكل منفصل حسب طبيعة المنتج وتكاليفه الخاصة.
								</p>
							</div>
						</div>
					</Card>
				</div>

				<div className="space-y-4">
					<div>
						<h3 className="text-base font-medium mb-2">طرق الدفع المتاحة</h3>
						<p className="text-sm text-muted-foreground mb-4">
							اختر طرق الدفع التي تقبلها في متجرك. سيتم احتساب رسوم الدفع الإلكتروني في تسعير المنتجات.
						</p>
					</div>

					{/* جدول طرق الدفع مع الرسوم */}
					<div className="border rounded-md overflow-hidden">
						<table className="w-full">
							<thead className="bg-muted/50">
								<tr>
									<th className="p-3 text-right font-medium text-sm">التفعيل</th>
									<th className="p-3 text-right font-medium text-sm">طريقة الدفع</th>
									<th className="p-3 text-right font-medium text-sm">الرسوم</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{paymentMethods.map((method) => (
									<tr key={method.id} className={method.enabled ? "bg-blue-50" : ""}>
										<td className="p-3">
											<Checkbox
												id={`payment-${method.id}`}
												checked={method.enabled}
												onCheckedChange={() => togglePaymentMethod(method.id)}
											/>
										</td>
										<td className="p-3">
											<Label htmlFor={`payment-${method.id}`} className="cursor-pointer">
												{method.name}
											</Label>
										</td>
										<td className="p-3 text-sm">
											{method.fee}%
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* معلومات طريقة الدفع ذات الرسوم الأعلى */}
					{highestFeeMethod && (
						<Card className="p-4 bg-amber-50 border-amber-200">
							<div className="flex gap-3 items-start">
								<InfoIcon className="h-5 w-5 text-amber-600 mt-0.5" />
								<div>
									<h4 className="font-medium text-amber-800">رسوم الدفع الإلكتروني المطبقة على التسعير</h4>
									<p className="text-sm text-amber-700 mt-1">
										سيتم اعتماد رسوم طريقة الدفع "{highestFeeMethod.name}" (بنسبة {highestFeeMethod.fee}%) 
										في حسابات التسعير لأنها طريقة الدفع ذات الرسوم الأعلى من بين الطرق المفعلة.
									</p>
								</div>
							</div>
						</Card>
					)}
				</div>
			</div>

			<div className="border-t mt-8 pt-6">
				<Button
					onClick={handleSaveSettings}
					className="bg-indigo-600 hover:bg-indigo-700"
					disabled={isSaving}
				>
					{isSaving ? "جاري الحفظ..." : "حفظ إعدادات المشروع"}
				</Button>
			</div>
		</div>
	)
}