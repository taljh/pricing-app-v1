'use client';

import { useAuth } from '@/lib/auth-context';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './dropdown-menu';
import { LogOut, Settings, User, UserCircle, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRTL } from '@/lib/rtl-context';

export function UserNav() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { isRTL } = useRTL();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching username:', error);
        } else if (data) {
          setUsername(data.username);
        }
      }
    };

    fetchUsername();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-100">...</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs">تسجيل الدخول</Button>
        </Link>
        <Link href="/auth/signup">
          <Button size="sm" className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700">إنشاء حساب</Button>
        </Link>
      </div>
    );
  }

  const userInitials = user.email 
    ? user.email.substring(0, 2).toUpperCase()
    : 'UN';
  const displayName = username || user.user_metadata?.display_name || user.email?.split('@')[0] || 'مستخدم';

  return (
    <div className="flex items-center gap-2">
      {/* اشعارات - يمكن تفعيلها لاحقًا */}
      <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full hidden sm:flex">
        <Bell className="h-4 w-4 text-gray-500" />
        {/* <span className="absolute top-0 end-0 flex h-2 w-2 rounded-full bg-red-500"></span> */}
      </Button>
      
      {/* ترحيب بالمستخدم - يظهر فقط في الشاشات المتوسطة والكبيرة */}
      <span className="hidden md:inline-block text-xs font-medium text-gray-600 mx-1">
        مرحباً، <span className="text-gray-900">{displayName}</span>
      </span>
      
      {/* قائمة المستخدم */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-8 w-8 rounded-full ring-offset-2 transition-all hover:bg-indigo-50 hover:text-indigo-600 focus-visible:ring-1 focus-visible:ring-indigo-400"
          >
            <Avatar className="h-8 w-8 border border-gray-100">
              <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
              <AvatarFallback className="bg-indigo-100 text-indigo-800">{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-56" 
          align={isRTL ? "start" : "end"} 
          forceMount
        >
          <div className="flex flex-col p-3 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage src="/placeholder-user.jpg" alt={displayName} />
                <AvatarFallback className="bg-indigo-100 text-indigo-800">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</p>
              </div>
            </div>
            <Link 
              href="/settings?tab=profile" 
              className="mt-1 w-full text-center text-xs text-indigo-600 hover:text-indigo-800 py-1 rounded-md hover:bg-indigo-50 transition-colors"
            >
              الملف الشخصي
            </Link>
          </div>
          
          <div className="py-2 px-1">
            <DropdownMenuItem asChild className="rounded-md mb-1">
              <Link href="/settings?tab=profile" className="flex w-full items-center px-2 py-1.5 text-sm">
                <UserCircle className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-gray-500`} />
                <span>إدارة الحساب</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-md">
              <Link href="/settings" className="flex w-full items-center px-2 py-1.5 text-sm">
                <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 text-gray-500`} />
                <span>الإعدادات</span>
              </Link>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator />
          <div className="p-2">
            <DropdownMenuItem 
              onClick={signOut} 
              className="flex items-center px-2 py-1.5 text-sm rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50"
            >
              <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}