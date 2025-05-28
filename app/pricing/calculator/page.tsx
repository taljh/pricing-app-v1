"use client"

import { AppShell } from "@/components/ui/app-shell"
import PricingCalculator from "@/components/pricing/calculator/PricingCalculator"
import { useRouter } from "next/navigation"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"
import { Suspense } from "react"

function CalculatorPageWrapper() {
  const router = useRouter()
  const { isMobile } = useScreenInfo()
  const { isRTL } = useRTL()
  
  return (
    <div className={`container mx-auto py-4 px-3 sm:py-6 sm:px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <PricingCalculator
        onClose={() => {
          router.push('/products')
        }}
      />
    </div>
  )
}

export default function PricingCalculatorPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="container mx-auto py-8 text-center">جارٍ التحميل...</div>}>
        <CalculatorPageWrapper />
      </Suspense>
    </AppShell>
  )
}
