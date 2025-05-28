"use client"

import { useRouter } from "next/navigation"
import PricingCalculator from "./PricingCalculator"
import { useRTL } from "@/lib/rtl-context"
import { useScreenInfo } from "@/hooks/use-mobile"
import { SearchParamsProvider, useSearchParamsContext } from "./SearchParamsProvider"

function CalculatorContent() {
  const router = useRouter()
  const { isRTL } = useRTL()
  const { isMobile } = useScreenInfo()
  const { productId } = useSearchParamsContext()

  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <PricingCalculator 
        initialProductId={productId}
        onClose={() => router.push("/products")}
      />
    </div>
  )
}

export default function CalculatorClient() {
  return (
    <SearchParamsProvider>
      <CalculatorContent />
    </SearchParamsProvider>
  )
} 