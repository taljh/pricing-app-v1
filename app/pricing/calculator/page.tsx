"use client"

import { useRouter } from "next/navigation"
import { AppShell } from "@/components/ui/app-shell"
import PricingCalculator from "@/components/pricing/calculator/PricingCalculator"
import { useScreenInfo } from "@/hooks/use-mobile"
import { useRTL } from "@/lib/rtl-context"

export default function PricingCalculatorPage() {
  const router = useRouter()
  const { isMobile } = useScreenInfo()
  const { isRTL } = useRTL()

  return (
    <AppShell>
      <div className={`container mx-auto py-4 px-3 sm:py-6 sm:px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <PricingCalculator
          onClose={() => router.push("/products")}
        />
      </div>
    </AppShell>
  )
}

// Removed duplicate function implementation
