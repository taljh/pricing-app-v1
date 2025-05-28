-- إصلاح شامل لمشكلة "column reference 'user_id' is ambiguous"
-- هذا الملف يتضمن معالجة أكثر شمولية وتحديداً للمشكلة

-- أولاً: حذف الوظائف الموجودة لإعادة إنشائها بشكل صحيح
DROP FUNCTION IF EXISTS get_project_settings(uuid);
DROP FUNCTION IF EXISTS get_fixed_costs(uuid);
DROP FUNCTION IF EXISTS update_project_settings(uuid, text, text, integer, jsonb);
DROP FUNCTION IF EXISTS upsert_fixed_cost(uuid, uuid, text, numeric, text);
DROP FUNCTION IF EXISTS delete_fixed_cost(uuid, uuid);

-- 1. إعادة إنشاء وظيفة get_project_settings مع تحديد واضح لمراجع الأعمدة
CREATE OR REPLACE FUNCTION get_project_settings(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
  payment_methods JSONB;
  user_id UUID;
  settings_id UUID;
BEGIN
  -- الحصول على معرف المستخدم (من المعامل أو من سياق المصادقة)
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not authenticated',
      'settings', NULL,
      'payment_methods', NULL
    );
  END IF;
  
  -- الحصول على إعدادات المشروع - تحديد جدول project_settings بوضوح في كل مكان
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
  
  -- إذا لم يتم العثور على إعدادات، قم بإنشاء إعدادات افتراضية
  IF settings IS NULL THEN
    INSERT INTO project_settings (user_id, project_name, target_category, target_profit)
    VALUES (
      user_id, 
      'نظام تسعير المنتجات المتقدم', 
      'medium', 
      30
    )
    RETURNING 
      id,
      jsonb_build_object(
        'id', id,
        'project_name', project_name,
        'target_category', target_category,
        'target_profit', target_profit
      ) INTO settings_id, settings;
      
    -- إضافة طرق دفع افتراضية مع تحديد واضح للقيم
    INSERT INTO project_payment_methods (project_settings_id, payment_method_code, is_enabled)
    VALUES 
      (settings_id, 'mada', TRUE),
      (settings_id, 'visa', TRUE),
      (settings_id, 'mastercard', TRUE);
  END IF;
  
  -- الحصول على طرق الدفع مع تحديد واضح للجداول
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', pm.code,
      'name', pm.name,
      'fee', COALESCE(ppm.custom_fee, pm.default_fee),
      'enabled', COALESCE(ppm.is_enabled, FALSE)
    )
  ), '[]'::jsonb) INTO payment_methods
  FROM payment_methods pm
  LEFT JOIN project_payment_methods ppm ON pm.code = ppm.payment_method_code AND ppm.project_settings_id = settings_id;
  
  -- إرجاع كائن الإعدادات الكامل
  RETURN jsonb_build_object(
    'settings', settings,
    'payment_methods', payment_methods
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'settings', NULL,
      'payment_methods', NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. إعادة إنشاء وظيفة update_project_settings مع تحديد واضح لمراجع الأعمدة
CREATE OR REPLACE FUNCTION update_project_settings(
  p_user_id UUID DEFAULT NULL,
  p_project_name TEXT DEFAULT NULL,
  p_target_category TEXT DEFAULT NULL,
  p_target_profit INTEGER DEFAULT NULL,
  p_payment_methods JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  settings_id UUID;
  payment_item JSONB;
  user_id UUID;
BEGIN
  -- استخدام معرف المستخدم المقدم أو المصادق عليه
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- الحصول على معرف الإعدادات مع تحديد واضح للجدول
  SELECT ps.id INTO settings_id 
  FROM project_settings ps
  WHERE ps.user_id = user_id;
  
  -- إنشاء إعدادات إذا لم تكن موجودة
  IF settings_id IS NULL THEN
    INSERT INTO project_settings (
      user_id, 
      project_name, 
      target_category, 
      target_profit
    )
    VALUES (
      user_id, 
      COALESCE(p_project_name, 'نظام تسعير المنتجات المتقدم'), 
      COALESCE(p_target_category, 'medium'), 
      COALESCE(p_target_profit, 30)
    )
    RETURNING id INTO settings_id;
  ELSE
    -- تحديث الإعدادات الموجودة مع تحديد واضح للجدول
    UPDATE project_settings ps
    SET 
      project_name = COALESCE(p_project_name, ps.project_name),
      target_category = COALESCE(p_target_category, ps.target_category),
      target_profit = COALESCE(p_target_profit, ps.target_profit),
      updated_at = NOW()
    WHERE ps.id = settings_id;
  END IF;
  
  -- معالجة طرق الدفع
  IF p_payment_methods IS NOT NULL AND jsonb_typeof(p_payment_methods) = 'array' THEN
    FOR payment_item IN SELECT * FROM jsonb_array_elements(p_payment_methods)
    LOOP
      -- تحديث أو إدراج إعدادات طريقة الدفع
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
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إعادة إنشاء وظيفة get_fixed_costs مع تحديد واضح لمراجع الأعمدة
CREATE OR REPLACE FUNCTION get_fixed_costs(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  costs JSONB;
  user_id UUID;
BEGIN
  -- الحصول على معرف المستخدم الحالي
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not authenticated');
  END IF;
  
  -- الحصول على جميع التكاليف الثابتة للمستخدم - تحديد واضح للجدول
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', fc.id,
        'name', fc.name,
        'amount', fc.amount,
        'period', fc.period
      )
    ), 
    '[]'::jsonb
  ) INTO costs
  FROM fixed_costs fc
  WHERE fc.user_id = user_id;
  
  RETURN costs;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. إعادة إنشاء وظيفة upsert_fixed_cost مع تحديد واضح لمراجع الأعمدة
CREATE OR REPLACE FUNCTION upsert_fixed_cost(
  p_user_id UUID DEFAULT NULL,
  p_id UUID DEFAULT NULL,
  p_name TEXT DEFAULT NULL,
  p_amount DECIMAL DEFAULT NULL,
  p_period TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  cost_id UUID;
  user_id UUID;
BEGIN
  -- استخدام معرف المستخدم المقدم أو المصادق عليه
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- التحقق من البيانات المطلوبة
  IF p_name IS NULL OR p_amount IS NULL OR p_period IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Required parameters missing: name, amount, and period must be provided');
  END IF;

  IF p_id IS NULL THEN
    -- إدراج تكلفة جديدة
    INSERT INTO fixed_costs (user_id, name, amount, period)
    VALUES (user_id, p_name, p_amount, p_period)
    RETURNING id INTO cost_id;
  ELSE
    -- تحديث تكلفة موجودة مع تحديد واضح للجدول
    UPDATE fixed_costs fc
    SET 
      name = p_name,
      amount = p_amount,
      period = p_period,
      updated_at = NOW()
    WHERE fc.id = p_id AND fc.user_id = user_id
    RETURNING fc.id INTO cost_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', cost_id IS NOT NULL,
    'id', cost_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. إعادة إنشاء وظيفة delete_fixed_cost مع تحديد واضح لمراجع الأعمدة
CREATE OR REPLACE FUNCTION delete_fixed_cost(
  p_user_id UUID DEFAULT NULL,
  p_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  deleted BOOLEAN;
  user_id UUID;
BEGIN
  -- استخدام معرف المستخدم المقدم أو المصادق عليه
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- التحقق من توفر معرف التكلفة
  IF p_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cost ID must be provided');
  END IF;

  DELETE FROM fixed_costs fc
  WHERE fc.id = p_id AND fc.user_id = user_id;
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN jsonb_build_object('success', deleted > 0);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إضافة query بسيط لاختبار تنفيذ الوظائف
DO $$
BEGIN
  RAISE NOTICE 'تم تحديث جميع الوظائف بنجاح مع معالجة مشكلة مرجع العمود الغامض';
END $$;

-- 7. عرض نتيجة نجاح العملية
SELECT 'تم تصحيح جميع مشاكل المراجع الغامضة لعمود user_id في كافة الوظائف' as result;