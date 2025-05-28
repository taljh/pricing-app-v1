-- Create pricing table
CREATE TABLE IF NOT EXISTS product_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  fabric_main_cost DECIMAL(10, 2) NOT NULL,
  fabric_secondary_cost DECIMAL(10, 2),
  turha_main_cost DECIMAL(10, 2),
  turha_secondary_cost DECIMAL(10, 2),
  tailoring_cost DECIMAL(10, 2) NOT NULL,
  packaging_cost DECIMAL(10, 2) NOT NULL,
  delivery_cost DECIMAL(10, 2),
  extra_expenses DECIMAL(10, 2),
  fixed_costs DECIMAL(10, 2) NOT NULL,
  marketing_costs DECIMAL(10, 2) NOT NULL,
  profit_margin DECIMAL(5, 2) NOT NULL,
  final_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE (product_id)
);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_pricing_updated_at
  BEFORE UPDATE ON product_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own product pricing"
  ON product_pricing
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_pricing.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own product pricing"
  ON product_pricing
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_pricing.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own product pricing"
  ON product_pricing
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_pricing.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own product pricing"
  ON product_pricing
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_pricing.product_id
      AND products.user_id = auth.uid()
    )
  ); 