import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { Database } from '@/types/supabase'
import { AppShell } from "@/components/ui/app-shell"
import ProductsList from '@/components/products/ProductsList'

export default async function ProductsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
  
  try {
    // التحقق من المستخدم الحالي
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      redirect('/auth/login')
    }

    // جلب المنتجات الخاصة بالمستخدم
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw new Error('Failed to fetch products')
    }

    return (
      <AppShell>
        <ProductsList initialProducts={products || []} />
      </AppShell>
    )
  } catch (error) {
    console.error('Products page error:', error)
    redirect('/auth/login')
  }
}
