'use client';

import { RTLProvider } from "@/lib/rtl-context";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RTLProvider>
        {children}
      </RTLProvider>
    </AuthProvider>
  );
}