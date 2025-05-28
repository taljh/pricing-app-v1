"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  User,
  Mail,
  Lock,
  Bell,
  PencilLine,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserProfile {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
  phone?: string;
}

interface AccountSettingsProps {
  userId: string;
  initialProfile: UserProfile;
}

export function AccountSettings({ userId, initialProfile }: AccountSettingsProps) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    try {
      const supabase = createClientComponentClient();
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      return null;
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Handle avatar upload if file selected
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const supabase = createClientComponentClient();

      // Update user profile in supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          phone: profile.phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح",
      });

      // Show success message and hide after 3 seconds
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        style: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث كلمة المرور بنجاح",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success message and hide after 3 seconds
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Update password error:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث كلمة المرور",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      dir="rtl"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* بطاقة الملف الشخصي */}
      <Card className="overflow-hidden border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-white/80 shadow-sm border border-indigo-100">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle>المعلومات الشخصية</CardTitle>
            </div>
          </div>
          <CardDescription className="mt-2">
            تحديث معلومات حسابك الشخصي
          </CardDescription>
        </CardHeader>

        <form onSubmit={updateProfile}>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* رسالة النجاح */}
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                    <AlertDescription>
                      تم تحديث معلوماتك بنجاح!
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* قسم الصورة الشخصية */}
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5 mb-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        profile.avatar_url ||
                        "/placeholder-user.jpg"
                      }
                      alt={profile.display_name || profile.email}
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl">
                      {profile.display_name?.substring(0, 2) ||
                        profile.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-3 flex flex-col gap-2 items-center">
                    <Label
                      htmlFor="avatar-upload"
                      className="text-xs py-1.5 px-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 hover:border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>تغيير الصورة</span>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG أو PNG، بحد أقصى 2 ميجابايت
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <Label
                      htmlFor="display_name"
                      className="text-xs text-gray-600 mb-1"
                    >
                      الاسم الكامل
                    </Label>
                    <Input
                      id="display_name"
                      placeholder="أدخل الاسم الكامل"
                      value={profile.display_name || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, display_name: e.target.value })
                      }
                      className="mt-1 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs text-gray-600 mb-1">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      لتغيير البريد الإلكتروني، يرجى التواصل مع الدعم
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs text-gray-600 mb-1">
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      placeholder="أدخل رقم الهاتف"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="mt-1 bg-white dir-ltr text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      <span>جارٍ الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <PencilLine className="h-4 w-4 ml-2" />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* بطاقة كلمة المرور */}
      <Card className="overflow-hidden border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white/80 shadow-sm border border-indigo-100">
              <Lock className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle>تغيير كلمة المرور</CardTitle>
          </div>
          <CardDescription className="mt-2">
            تحديث كلمة المرور الخاصة بحسابك
          </CardDescription>
        </CardHeader>

        <form onSubmit={updatePassword}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="current-password"
                  className="text-xs text-gray-600 mb-1"
                >
                  كلمة المرور الحالية
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-white"
                />
              </div>

              <div>
                <Label
                  htmlFor="new-password"
                  className="text-xs text-gray-600 mb-1"
                >
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-white"
                />
              </div>

              <div>
                <Label
                  htmlFor="confirm-password"
                  className="text-xs text-gray-600 mb-1"
                >
                  تأكيد كلمة المرور
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between py-4">
            <p className="text-xs text-gray-500">
              كلمة المرور يجب أن تكون 8 أحرف على الأقل
            </p>
            <Button
              type="submit"
              variant="outline"
              className="border-indigo-200"
              disabled={
                isUpdating || !currentPassword || !newPassword || !confirmPassword
              }
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  <span>جارٍ التحديث...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 ml-2" />
                  <span>تحديث كلمة المرور</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* بطاقة الإشعارات */}
      <Card className="overflow-hidden border-indigo-100 shadow-sm">
        <CardHeader className="bg-gradient-to-l from-indigo-50 via-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white/80 shadow-sm border border-indigo-100">
              <Bell className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle>إعدادات الإشعارات</CardTitle>
          </div>
          <CardDescription className="mt-2">
            تخصيص كيفية استلام الإشعارات
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="font-medium">إشعارات البريد الإلكتروني</div>
                <div className="text-sm text-gray-500">
                  استلام الإشعارات والتحديثات عبر البريد الإلكتروني
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="font-medium">تحديثات الأسعار</div>
                <div className="text-sm text-gray-500">
                  إشعارات حول تغييرات الأسعار والخصومات
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="font-medium">تنبيهات المخزون</div>
                <div className="text-sm text-gray-500">
                  إشعارات عند انخفاض مستوى المخزون
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="mr-auto bg-indigo-600 hover:bg-indigo-700">
            حفظ التفضيلات
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}