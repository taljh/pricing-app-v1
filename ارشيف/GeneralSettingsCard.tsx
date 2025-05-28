"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { InfoIcon } from "lucide-react"

// الفئات المستهدفة
const targetCategories = [
	{ value: "luxury", label: "منتجات فاخرة" },
	{ value: "medium", label: "منتجات متوسطة" },
	{ value: "economy", label: "منتجات اقتصادية" },
	{ value: "all", label: "كافة الفئات" },
]

// طرق الدفع المتاحة
const paymentMethods = [
	{ id: "apple-pay", name: "ابل باي", fee: 2.9 },
	{ id: "mada", name: "مدى", fee: 1.5 },
	{ id: "visa", name: "فيزا", fee: 2.5 },
	{ id: "mastercard", name: "ماستركارد", fee: 2.5 },
	{ id: "tabby", name: "تابي", fee: 3.5 },
	{ id: "tamara", name: "تمارا", fee: 3.2 },
	{ id: "stcpay", name: "اس تي سي باي", fee: 2.0 },
]

export default function ProjectSettingsCard() {
	const { toast } = useToast()

	// إعدادات المشروع
	const [projectName, setProjectName] = useState("نظام تسعير العبايات المتقدم")
	const [targetCategory, setTargetCategory] = useState("medium")
	const [isSaving, setIsSaving] = useState(false)

	// طرق الدفع المحددة
	const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([
		"mada", 
		"visa", 
		"mastercard"
	])

	// تحديد وإلغاء طريقة دفع
	const togglePaymentMethod = (id: string) => {
		setSelectedPaymentMethods(prev => {
			if (prev.includes(id)) {
				return prev.filter(methodId => methodId !== id)
			} else {
				return [...prev, id]
			}
		})
	}

	// الحصول على طريقة الدفع ذات الرسوم الأعلى
	const getHighestFeesMethod = () => {
		if (selectedPaymentMethods.length === 0) return null
		
		return paymentMethods
			.filter(method => selectedPaymentMethods.includes(method.id))
			.reduce((highest, current) => {
				return current.fee > highest.fee ? current : highest
			}, paymentMethods.find(m => m.id === selectedPaymentMethods[0])!)
	}

	// طريقة الدفع ذات الرسوم الأعلى
	const highestFeeMethod = getHighestFeesMethod()

	// حفظ الإعدادات
	const handleSaveSettings = () => {
		setIsSaving(true)
		// محاكاة لحفظ البيانات
		setTimeout(() => {
			setIsSaving(false)
			toast({
				title: "تم الحفظ بنجاح",
				description: "تم حفظ إعدادات المشروع",
			})
		}, 800)
	}

	return (
		<div className="space-y-6">
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
									<tr key={method.id} className={selectedPaymentMethods.includes(method.id) ? "bg-blue-50" : ""}>
										<td className="p-3">
											<Checkbox
												id={`payment-${method.id}`}
												checked={selectedPaymentMethods.includes(method.id)}
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