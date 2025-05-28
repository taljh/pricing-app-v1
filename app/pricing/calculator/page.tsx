"use client"
export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { AppShell } from "@/components/ui/app-shell"
import CalculatorClient from "@/components/pricing/calculator/CalculatorClient"
import Loading from "./loading"

export default function PricingCalculatorPage() {
  return (
    <AppShell>
      <Suspense fallback={<Loading />}>
        <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4">
          <CalculatorClient />
        </div>
      </Suspense>
    </AppShell>
  )
}
