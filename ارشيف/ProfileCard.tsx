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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Save } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { getCurrentUser, upsertProfile } from "@/lib/auth"

type ProfileCardProps = {
  userData: any
}

export default function ProfileCard({ userData }: ProfileCardProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    display_name: '',
    phone: '',
    company: '',
    bio: ''
  })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function loadUserProfile() {
      // الحصول على بيانات المستخدم من الخاصية أو من API
      const currentUser = userData?.user || await getCurrentUser()
      
      if (!currentUser) {
        return
      }
      
      setUser(currentUser)
      
      // استخدام البيانات الموجودة في userData إذا كانت متوفرة
      if (userData?.profile) {
        console.log("استخدام بيانات الملف الشخصي من userData:", userData.profile);
        setProfile({
          display_name: userData.profile.display_name || '',
          phone: userData.profile.phone || '',
          company: userData.profile.company || '',
          bio: userData.profile.bio || ''
        });
        return;
      }
      
      // استدعاء معلومات الملف الشخصي من قاعدة البيانات إذا لم تكن متوفرة في userData
      console.log("استدعاء بيانات الملف الشخصي من قاعدة البيانات");
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileData) {
        console.log("تم الحصول على بيانات الملف الشخصي:", profileData);
        setProfile({
          display_name: profileData.display_name || '',
          phone: profileData.phone || '',
          company: profileData.company || '',
          bio: profileData.bio || ''
        });
      } else if (error) {
        console.error("خطأ في استدعاء بيانات الملف الشخصي:", error);
      }
    }
    
    loadUserProfile();
  }, [userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    setError(null)
    setMessage(null)
    
    const { error } = await upsertProfile(user.id, profile)
    
    if (error) {
      setError('حدث خطأ أثناء حفظ الملف الشخصي: ' + error.message)
    } else {
      setMessage('تم حفظ الملف الشخصي بنجاح')
      router.refresh()
    }
    
    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>المعلومات الشخصية</CardTitle>
        <CardDescription>
          تحديث معلوماتك الشخصية وبيانات التواصل
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 ml-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {message && (
          <Alert variant="success" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4 ml-2" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {/* أضف إشعار للمستخدم إذا كان الاسم غير موجود */}
        {!profile.display_name && (
          <Alert className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 ml-2" />
              <AlertDescription>
                لم يتم تعيين اسمك بعد، يرجى إدخال الاسم بالكامل أدناه وحفظ التغييرات.
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              name="display_name"
              value={profile.display_name}
              onChange={handleChange}
              placeholder="الاسم بالكامل"
              className="text-right"
              dir="rtl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50 text-right"
              dir="ltr"
            />
            <p className="text-xs text-gray-500">البريد الإلكتروني لا يمكن تغييره</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              className="text-right"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">الشركة أو المؤسسة</Label>
            <Input
              id="company"
              name="company"
              value={profile.company}
              onChange={handleChange}
              placeholder="اسم الشركة أو المؤسسة"
              className="text-right"
              dir="rtl"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">نبذة عنك</Label>
          <Textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="معلومات إضافية عنك أو عن عملك"
            rows={4}
            className="text-right"
            dir="rtl"
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}