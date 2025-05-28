"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ProjectSettingsCard from "@/components/settings/ProjectSettingsCard"
import FixedCostsCard from "@/components/settings/FixedCostsCard"
import ProfileCard from "@/components/settings/ProfileCard"
import AccountCard from "@/components/settings/AccountCard"
import { Settings, Sliders, FileText, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type SettingsContentProps = {
  userData: any
  isAdmin: boolean
  users: any[]
  roles: any[]
  activeTab?: string
}

export default function SettingsContent({ userData, isAdmin, users, roles, activeTab: initialTab }: SettingsContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"general" | "costs" | "account" | "profile">(
    initialTab ? initialTab as any : (isAdmin ? "general" : "account")
  )
  const [fullName, setFullName] = useState(userData.profile?.full_name || "")
  const [isSaving, setIsSaving] = useState(false)

  // حفظ معلومات الحساب الشخصي
  const handleSaveProfile = async () => {
    if (!userData?.user?.id) return
    
    setIsSaving(true)
    try {
      toast.success("تم حفظ التغييرات بنجاح")
      router.refresh()
    } catch (error) {
      toast.error("حدث خطأ غير متوقع")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // مكون تبويب العنصر
  const TabItem = ({ 
    id, 
    title, 
    icon, 
    isActive, 
    onClick 
  }: { 
    id: "general" | "costs" | "account" | "profile", 
    title: string, 
    icon: React.ReactNode, 
    isActive: boolean, 
    onClick: () => void 
  }) => (
    <div 
      onClick={onClick} 
      className={`
        flex items-center gap-3 py-3 px-4 rounded-md cursor-pointer transition-colors 
        ${isActive ? 'bg-indigo-50 text-indigo-900 border-r-4 border-indigo-600' : 'hover:bg-gray-100 text-gray-700'}
      `}
    >
      <div className={`${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
        {icon}
      </div>
      <span className={`${isActive ? 'font-medium' : ''}`}>{title}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة */}
      <div className="flex flex-col gap-1">        
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 rounded-full p-2">
            <Settings className="h-5 w-5 text-indigo-700" />
          </div>
          <h1 className="text-2xl font-bold">إعدادات المشروع</h1>
        </div>
        <p className="text-muted-foreground">
          تخصيص وإدارة إعدادات المشروع والتكاليف الثابتة
        </p>
      </div>
      
      {/* تقسيم الصفحة إلى قسمين: قائمة التبويبات العمودية والمحتوى */}
      <div className="flex flex-col md:flex-row gap-6 rounded-md border shadow-sm" dir="rtl">
        {/* قائمة التبويبات العمودية */}
        <div className="md:w-64 border-l bg-gray-50">
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-500">قائمة الإعدادات</h3>
          </div>
          <div className="py-2">
            <TabItem 
              id="general"
              title="إعدادات المشروع" 
              icon={<Sliders className="h-5 w-5" />} 
              isActive={activeTab === "general"} 
              onClick={() => setActiveTab("general")} 
            />
            <TabItem 
              id="costs"
              title="التكاليف الثابتة" 
              icon={<FileText className="h-5 w-5" />} 
              isActive={activeTab === "costs"} 
              onClick={() => setActiveTab("costs")} 
            />
            <TabItem 
              id="profile"
              title="الملف الشخصي" 
              icon={<User className="h-5 w-5" />} 
              isActive={activeTab === "profile"} 
              onClick={() => setActiveTab("profile")} 
            />
            <TabItem 
              id="account"
              title="إعدادات الحساب" 
              icon={<Settings className="h-5 w-5" />} 
              isActive={activeTab === "account"} 
              onClick={() => setActiveTab("account")} 
            />
          </div>
        </div>
        
        {/* محتوى التبويب النشط */}
        <div className="flex-1 p-6">
          {/* محتوى تبويب إعدادات المشروع */}
          {activeTab === "general" && <ProjectSettingsCard />}
          
          {/* محتوى تبويب التكاليف الثابتة */}
          {activeTab === "costs" && <FixedCostsCard />}
          
          {/* محتوى تبويب الملف الشخصي */}
          {activeTab === "profile" && <ProfileCard userData={userData} />}
          
          {/* محتوى تبويب إعدادات الحساب */}
          {activeTab === "account" && <AccountCard userData={userData} />}
        </div>
      </div>
    </div>
  )
}
