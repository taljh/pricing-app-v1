-- Schema for Project Settings

-- Existing profiles table (assuming it exists already)
-- If it doesn't exist, uncomment this section
/*
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  phone TEXT,
  company TEXT,
  bio TEXT,
  account_type TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);
*/

-- Project Settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL DEFAULT 'نظام تسعير المنتجات المتقدم',
  target_category TEXT NOT NULL DEFAULT 'medium',
  target_profit INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE (user_id) -- كل مستخدم يمكن أن يكون له إعدادات مشروع واحدة فقط
);

-- Payment Methods table (المرتبطة بإعدادات المشروع)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  default_fee DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Selected Payment Methods (العلاقة بين المستخدم وطرق الدفع المختارة)
CREATE TABLE IF NOT EXISTS project_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_settings_id UUID REFERENCES project_settings ON DELETE CASCADE NOT NULL,
  payment_method_code TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  custom_fee DECIMAL(5, 2), -- يمكن للمستخدم تخصيص نسبة الرسوم إذا أراد
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE (project_settings_id, payment_method_code)
);

-- Fixed Costs table (التكاليف الثابتة)
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly', 'once')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Security Settings table (إعدادات الأمان)
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE (user_id)
);

-- Insert default payment methods
INSERT INTO payment_methods (name, code, default_fee)
VALUES 
('ابل باي', 'apple-pay', 2.9),
('مدى', 'mada', 1.5),
('فيزا', 'visa', 2.5),
('ماستركارد', 'mastercard', 2.5),
('تابي', 'tabby', 3.5),
('تمارا', 'tamara', 3.2),
('اس تي سي باي', 'stcpay', 2.0)
ON CONFLICT (code) DO NOTHING;

-- Function to create default project settings for a new user
CREATE OR REPLACE FUNCTION create_default_project_settings()
RETURNS TRIGGER AS $$
DECLARE
  new_settings_id UUID;
BEGIN
  -- Create default project settings
  INSERT INTO project_settings (user_id)
  VALUES (NEW.id)
  RETURNING id INTO new_settings_id;
  
  -- Add default payment methods
  INSERT INTO project_payment_methods (project_settings_id, payment_method_code, is_enabled)
  VALUES 
    (new_settings_id, 'mada', TRUE),
    (new_settings_id, 'visa', TRUE),
    (new_settings_id, 'mastercard', TRUE);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default settings when a new user is created
CREATE OR REPLACE TRIGGER trigger_create_default_settings
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE create_default_project_settings();

-- RLS Policies for security
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/modify their own project settings
CREATE POLICY project_settings_policy ON project_settings
  USING (user_id = auth.uid());

-- Policy: Users can only view/modify their own payment methods
CREATE POLICY project_payment_methods_policy ON project_payment_methods
  USING (project_settings_id IN (SELECT id FROM project_settings WHERE user_id = auth.uid()));

-- Policy: Users can only view/modify their own fixed costs
CREATE POLICY fixed_costs_policy ON fixed_costs
  USING (user_id = auth.uid());

-- Policy: Users can only view/modify their own security settings
CREATE POLICY security_settings_policy ON security_settings
  USING (user_id = auth.uid());

-- Function to get project settings - enhanced with explicit user_id parameter
CREATE OR REPLACE FUNCTION get_project_settings(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
  payment_methods JSONB;
  user_id UUID;
  settings_id UUID;
BEGIN
  -- Get the current user ID (from parameter or auth context)
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log for debugging
  RAISE NOTICE 'get_project_settings: Using user_id: %', user_id;
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE NOTICE 'get_project_settings: No user_id available';
    RETURN jsonb_build_object(
      'error', 'User not authenticated',
      'settings', NULL,
      'payment_methods', NULL
    );
  END IF;
  
  -- Get project settings with explicit table alias
  SELECT 
    ps.id,
    jsonb_build_object(
      'id', ps.id,
      'project_name', ps.project_name,
      'target_category', ps.target_category,
      'target_profit', ps.target_profit
    ) INTO settings_id, settings
  FROM project_settings ps
  WHERE ps.user_id = user_id;
  
  -- If no settings found, create default settings
  IF settings IS NULL THEN
    RAISE NOTICE 'get_project_settings: Creating default settings for user: %', user_id;
    INSERT INTO project_settings (user_id)
    VALUES (user_id)
    RETURNING 
      id,
      jsonb_build_object(
        'id', id,
        'project_name', project_name,
        'target_category', target_category,
        'target_profit', target_profit
      ) INTO settings_id, settings;
      
    -- Add default payment methods
    INSERT INTO project_payment_methods (project_settings_id, payment_method_code, is_enabled)
    VALUES 
      (settings_id, 'mada', TRUE),
      (settings_id, 'visa', TRUE),
      (settings_id, 'mastercard', TRUE);
  END IF;
  
  -- Get payment methods with explicit table aliases
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', pm.code,
      'name', pm.name,
      'fee', COALESCE(ppm.custom_fee, pm.default_fee),
      'enabled', COALESCE(ppm.is_enabled, FALSE)
    )
  ), '[]'::jsonb) INTO payment_methods
  FROM payment_methods pm
  LEFT JOIN project_payment_methods ppm ON pm.code = ppm.payment_method_code 
    AND ppm.project_settings_id = settings_id;
  
  -- Return complete settings object
  RETURN jsonb_build_object(
    'settings', settings,
    'payment_methods', payment_methods
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'get_project_settings error: %', SQLERRM;
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'settings', NULL,
      'payment_methods', NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project settings - with improved error handling and explicit user_id parameter
CREATE OR REPLACE FUNCTION update_project_settings(
  p_user_id UUID,
  p_project_name TEXT,
  p_target_category TEXT,
  p_target_profit INTEGER,
  p_payment_methods JSONB
)
RETURNS JSONB AS $$
DECLARE
  settings_id UUID;
  payment_item JSONB;
  user_id UUID;
BEGIN
  -- Use either the provided user_id or the authenticated one
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log for debugging
  RAISE NOTICE 'update_project_settings: Using user_id: %', user_id;
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE NOTICE 'update_project_settings: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get settings ID
  SELECT id INTO settings_id FROM project_settings WHERE user_id = user_id;
  
  -- Create settings if they don't exist
  IF settings_id IS NULL THEN
    RAISE NOTICE 'update_project_settings: Creating new settings for user: %', user_id;
    INSERT INTO project_settings (
      user_id, 
      project_name, 
      target_category, 
      target_profit
    )
    VALUES (
      user_id, 
      p_project_name, 
      p_target_category, 
      p_target_profit
    )
    RETURNING id INTO settings_id;
  ELSE
    RAISE NOTICE 'update_project_settings: Updating existing settings for user: %', user_id;
    -- Update existing settings
    UPDATE project_settings
    SET 
      project_name = p_project_name,
      target_category = p_target_category,
      target_profit = p_target_profit,
      updated_at = NOW()
    WHERE id = settings_id;
  END IF;
  
  -- Process payment methods
  IF p_payment_methods IS NOT NULL AND jsonb_typeof(p_payment_methods) = 'array' THEN
    FOR payment_item IN SELECT * FROM jsonb_array_elements(p_payment_methods)
    LOOP
      -- Update or insert payment method settings
      INSERT INTO project_payment_methods (
        project_settings_id, 
        payment_method_code, 
        is_enabled
      )
      VALUES (
        settings_id,
        payment_item->>'id',
        (payment_item->>'enabled')::boolean
      )
      ON CONFLICT (project_settings_id, payment_method_code) 
      DO UPDATE SET 
        is_enabled = (payment_item->>'enabled')::boolean,
        updated_at = NOW();
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'update_project_settings error: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get fixed costs - with better error handling and ensuring array output
CREATE OR REPLACE FUNCTION get_fixed_costs(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  costs JSONB;
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log for debugging
  RAISE NOTICE 'get_fixed_costs: Using user_id: %', user_id;
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE NOTICE 'get_fixed_costs: No user_id available';
    RETURN jsonb_build_object('error', 'User not authenticated');
  END IF;
  
  -- Get all fixed costs for the user - ensuring it's always an array
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'amount', amount,
        'period', period
      )
    ), 
    '[]'::jsonb  -- Return empty array if no costs found
  ) INTO costs
  FROM fixed_costs
  WHERE user_id = user_id;
  
  -- Return the array directly, not as part of an object
  RETURN costs;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_fixed_costs: %', SQLERRM;
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add or update a fixed cost
CREATE OR REPLACE FUNCTION upsert_fixed_cost(
  p_user_id UUID,
  p_id UUID DEFAULT NULL,
  p_name TEXT,
  p_amount DECIMAL,
  p_period TEXT
)
RETURNS JSONB AS $$
DECLARE
  cost_id UUID;
  user_id UUID;
BEGIN
  -- Use either the provided user_id or the authenticated one
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log for debugging
  RAISE NOTICE 'upsert_fixed_cost: Using user_id: %', user_id;
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE NOTICE 'upsert_fixed_cost: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  IF p_id IS NULL THEN
    -- Insert new cost
    INSERT INTO fixed_costs (user_id, name, amount, period)
    VALUES (user_id, p_name, p_amount, p_period)
    RETURNING id INTO cost_id;
  ELSE
    -- Update existing cost
    UPDATE fixed_costs
    SET 
      name = p_name,
      amount = p_amount,
      period = p_period,
      updated_at = NOW()
    WHERE id = p_id AND user_id = user_id
    RETURNING id INTO cost_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', cost_id IS NOT NULL,
    'id', cost_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'upsert_fixed_cost error: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a fixed cost
CREATE OR REPLACE FUNCTION delete_fixed_cost(p_user_id UUID, p_id UUID)
RETURNS JSONB AS $$
DECLARE
  deleted BOOLEAN;
  user_id UUID;
BEGIN
  -- Use either the provided user_id or the authenticated one
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- Log for debugging
  RAISE NOTICE 'delete_fixed_cost: Using user_id: %', user_id;
  
  -- Ensure user is authenticated
  IF user_id IS NULL THEN
    RAISE NOTICE 'delete_fixed_cost: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  DELETE FROM fixed_costs
  WHERE id = p_id AND user_id = user_id;
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN jsonb_build_object('success', deleted > 0);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'delete_fixed_cost error: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;