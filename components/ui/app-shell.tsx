"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useRTL } from "@/lib/rtl-context"
import { useScreenInfo } from "@/hooks/use-mobile"
import { isValidElement } from "react" // أضف هذا مع بقية الـ imports
import { 
  Calculator, 
  Package, 
  BarChart3, 
  Settings, 
  Home, 
  PieChart, 
  Tag, 
  Percent, 
  TrendingUp, 
  ChevronLeft,
  Menu,
  X
} from "lucide-react"
import { SettingsDialog } from "@/components/Settings"
import { UserNav } from "./user-nav"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"

interface NavigationItem {
  title: string
  href: string
  icon: React.ReactNode
  description?: string
  badge?: string
  badgeColor?: string
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isRTL, flipIcon } = useRTL()
  const { isMobile, isTablet } = useScreenInfo()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // أثناء التغيير بين الصفحات، نغلق القائمة الجانبية
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  const mainNavItems: NavigationItem[] = [
    {
      title: "الرئيسية",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "المنتجات",
      href: "/products",
      icon: <Package className="h-5 w-5" />,
      description: "إدارة وتسعير المنتجات"
    },
    {
      title: "التسعير الذكي",
      href: "/pricing",
      icon: <Calculator className="h-5 w-5" />,
      description: "أدوات وتحليلات التسعير"
    },
    {
      title: "مستشارك الذكي",
      href: "/advisor",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "تحليلات ذكية وتوصيات مخصصة",
      badge: "قريباً",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    }
  ]
  
  const quickActions: NavigationItem[] = [
    {
      title: "حاسبة التسعير",
      href: "/pricing/calculator",
      icon: <Calculator className="h-4 w-4 text-indigo-600" />,
    },
    {
      title: "تحليل الخصومات",
      href: "/pricing",
      icon: <Percent className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "إضافة منتج",
      href: "/products",
      icon: <Tag className="h-4 w-4 text-violet-600" />,
    },
    {
      title: "الإحصائيات",
      href: "/",
      icon: <TrendingUp className="h-4 w-4 text-amber-600" />,
    }
  ]

  // تنسيق أيقونات التنقل للدعم الكامل للـ RTL
  const getFlippedIcon = (icon: React.ReactNode) => {
    if (!isRTL || !isValidElement(icon)) return icon;
    return React.cloneElement(icon, {
      style: { ...((icon as React.ReactElement<{ style?: React.CSSProperties }>).props.style || {}), transform: 'scaleX(-1)' }
    });
  };

  return (
    <div className={`flex min-h-screen flex-col bg-gray-50/40 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo and System Name - Right side (First in RTL) */}
          <div className="flex items-center gap-2 me-auto">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full p-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">تكلفة</h1>
                <p className="text-xs text-gray-500 hidden sm:block">إدارة الأسعار والربحية بذكاء</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation - Middle */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {mainNavItems.map((item) => {
              const isActive = 
                pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg relative group",
                    isActive 
                      ? "bg-indigo-50 text-indigo-900" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className={cn(
                    "transition-all duration-300",
                    isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
                  )}>
                    {getFlippedIcon(item.icon)}
                  </span>
                  <span>{item.title}</span>
                  
                  {item.badge && (
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", item.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-200")}>
                      {item.badge}
                    </span>
                  )}
                  
                  {isActive && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User controls - Left side (Last in RTL) */}
          <div className="flex items-center gap-2 md:gap-4 ms-auto">
            <UserNav />
            <SettingsDialog />
          </div>
        </div>
      </header>
      
      {/* Mobile navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive = 
              pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 px-1 text-xs font-medium relative",
                  isActive 
                    ? "text-indigo-900" 
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <span className={cn(
                  "transition-all duration-300",
                  isActive ? "text-indigo-600 scale-110" : "text-gray-400"
                )}>
                  {getFlippedIcon(item.icon)}
                </span>
                <span className="mt-1 text-[10px] line-clamp-1">{item.title}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator-mobile" 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-indigo-500"
                  />
                )}
                
                {item.badge && (
                  <span className={cn(
                    "absolute top-1 right-1/4 text-[8px] min-w-[14px] h-[14px] flex items-center justify-center px-1 rounded-full border", 
                    item.badgeColor || "bg-indigo-100 text-indigo-800 border-indigo-200")}>
                    •
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 pb-16 md:pb-0">
        {/* Quick actions bar */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-1.5 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-3">
              {quickActions.map((action, index) => {
                const isActive = pathname === action.href || 
                  (action.href !== '/' && pathname.startsWith(action.href));
                
                return (
                  <Link 
                    key={index}
                    href={action.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-indigo-700"
                    )}
                  >
                    <span className="h-4 w-4">{getFlippedIcon(action.icon)}</span>
                    <span>{action.title}</span>
                  </Link>
                );
              })}
            </div>
            
            {pathname !== "/" && (
              <Link 
                href="/"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition whitespace-nowrap"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">الرئيسية</span>
                <ChevronLeft className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            )}
          </div>
        </div>
        
        {/* Page content */}
        <main className={`container mx-auto px-2 sm:px-4 py-4 sm:py-6 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="max-w-full overflow-x-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export interface RTLContextType {
  // Existing properties
  flipIcon?: boolean; // Add flipIcon property if it is intended to be used
}