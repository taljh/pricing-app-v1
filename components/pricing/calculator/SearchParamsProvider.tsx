"use client"

import { useSearchParams } from "next/navigation"
import { createContext, useContext } from "react"

const SearchParamsContext = createContext<{ productId: string | null }>({ productId: null })

export function useSearchParamsContext() {
  return useContext(SearchParamsContext)
}

export function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const productId = searchParams?.get('product_id') || null

  return (
    <SearchParamsContext.Provider value={{ productId }}>
      {children}
    </SearchParamsContext.Provider>
  )
} 