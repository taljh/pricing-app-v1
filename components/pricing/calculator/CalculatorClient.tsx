"use client"

import { useSearchParams } from "next/navigation"
import PricingCalculator from "./PricingCalculator"

export default function CalculatorClient() {
  const searchParams = useSearchParams()
  const productId = searchParams?.get('product_id') || null

  return <PricingCalculator initialProductId={productId} />
} 