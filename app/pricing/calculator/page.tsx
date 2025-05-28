"use client"
export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/ui/app-shell"
import PricingCalculator from "@/components/pricing/calculator/PricingCalculator"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"

function CalculatorWrapper() {
  const router = useRouter()
  const { isMobile } = useScreenInfo()
  const { isRTL } = useRTL()

  return (
    <div className={`container mx-auto py-4 px-3 sm:py-6 sm:px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <PricingCalculator
        onClose={() => router.push("/products")}
      />
    </div>
  )
}

export default function PricingCalculatorPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <CalculatorWrapper />
      </Suspense>
    </AppShell>
  )
}
