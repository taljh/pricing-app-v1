"use client"

import { useSearchParams } from "next/navigation"
import { createContext, useContext, Suspense } from "react"

const SearchParamsContext = createContext<{ productId: string | null }>({ productId: null })

export function useSearchParamsContext() {
  return useContext(SearchParamsContext)
}

function SearchParamsContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const productId = searchParams?.get('product_id') || null

  return (
    <SearchParamsContext.Provider value={{ productId }}>
      {children}
    </SearchParamsContext.Provider>
  )
}

export function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading search params...</div>}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  )
} 