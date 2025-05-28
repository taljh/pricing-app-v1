import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/auth"

type AccountCardProps = {
  userData: any
}

export default function AccountCard({ userData }: AccountCardProps) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const currentUser = userData?.user || await getCurrentUser()
      
      if (!currentUser) {
        return
      }
      
      setUser(currentUser)
    }
    
    loadUser()
  }, [userData])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الحساب</CardTitle>
        <CardDescription>
          إدارة حسابك وتسجيل الخروج
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>معلومات الحساب</Label>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600"><strong>معرف المستخدم:</strong> {user?.id}</p>
            <p className="text-sm text-gray-600"><strong>تاريخ الإنشاء:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير متوفر'}</p>
            <p className="text-sm text-gray-600"><strong>آخر تسجيل دخول:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ar-SA') : 'غير متوفر'}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>تسجيل الخروج</Label>
          <p className="text-sm text-gray-600">
            تسجيل الخروج من جميع الأجهزة المتصلة بهذا الحساب
          </p>
          <Button 
            variant="destructive" 
            className="gap-2 mt-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}