-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    initial_price DECIMAL NOT NULL,
    price DECIMAL,
    category TEXT,
    image_url TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    has_pricing BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Añadir índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS products_user_id_idx ON public.products(user_id);
CREATE INDEX IF NOT EXISTS products_has_pricing_idx ON public.products(has_pricing);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente el timestamp de actualización
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Políticas de seguridad para el acceso a los productos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios productos
DROP POLICY IF EXISTS products_select_policy ON public.products;
CREATE POLICY products_select_policy ON public.products
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propios productos
DROP POLICY IF EXISTS products_insert_policy ON public.products;
CREATE POLICY products_insert_policy ON public.products
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propios productos
DROP POLICY IF EXISTS products_update_policy ON public.products;
CREATE POLICY products_update_policy ON public.products
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propios productos
DROP POLICY IF EXISTS products_delete_policy ON public.products;
CREATE POLICY products_delete_policy ON public.products
    FOR DELETE
    USING (auth.uid() = user_id);