-- إصلاح مشكلة "column reference 'user_id' is ambiguous"
-- هذا الملف يتضمن التصحيحات اللازمة لتحديد مراجع الأعمدة بشكل واضح

-- 1. تعديل وظيفة get_fixed_costs
CREATE OR REPLACE FUNCTION get_fixed_costs(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  costs JSONB;
  user_id UUID;
BEGIN
  -- الحصول على معرف المستخدم الحالي
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- تسجيل للتصحيح
  RAISE NOTICE 'get_fixed_costs: Using user_id: %', user_id;
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RAISE NOTICE 'get_fixed_costs: No user_id available';
    RETURN jsonb_build_object('error', 'User not authenticated');
  END IF;
  
  -- الحصول على جميع التكاليف الثابتة للمستخدم - ضمان أنها دائماً مصفوفة
  -- توضيح مرجع العمود user_id بتحديد اسم الجدول fc
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', fc.id,
        'name', fc.name,
        'amount', fc.amount,
        'period', fc.period
      )
    ), 
    '[]'::jsonb  -- إرجاع مصفوفة فارغة إذا لم يتم العثور على تكاليف
  ) INTO costs
  FROM fixed_costs fc -- استخدام اختصار للجدول لتوضيح المراجع
  WHERE fc.user_id = user_id; -- توضيح أن user_id ينتمي للجدول fixed_costs
  
  -- إرجاع المصفوفة مباشرة، وليس كجزء من كائن
  RETURN costs;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_fixed_costs: %', SQLERRM;
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. تعديل وظيفة upsert_fixed_cost للتعامل بشكل أفضل مع مرجع العمود user_id
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
  
  -- تسجيل للتصحيح
  RAISE NOTICE 'upsert_fixed_cost: Using user_id: %', user_id;
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RAISE NOTICE 'upsert_fixed_cost: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- التحقق من البيانات المطلوبة
  IF p_name IS NULL OR p_amount IS NULL OR p_period IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Required parameters missing: name, amount, and period must be provided');
  END IF;

  IF p_id IS NULL THEN
    -- إدراج تكلفة جديدة مع توضيح العمود user_id
    INSERT INTO fixed_costs (user_id, name, amount, period)
    VALUES (user_id, p_name, p_amount, p_period)
    RETURNING id INTO cost_id;
  ELSE
    -- تحديث تكلفة موجودة مع توضيح العمود user_id
    UPDATE fixed_costs fc -- استخدام اختصار للجدول
    SET 
      name = p_name,
      amount = p_amount,
      period = p_period,
      updated_at = NOW()
    WHERE fc.id = p_id AND fc.user_id = user_id -- توضيح أن user_id ينتمي للجدول fixed_costs
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

-- 3. تعديل وظيفة delete_fixed_cost لتوضيح مرجع العمود user_id
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
  
  -- تسجيل للتصحيح
  RAISE NOTICE 'delete_fixed_cost: Using user_id: %', user_id;
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RAISE NOTICE 'delete_fixed_cost: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- التحقق من توفر معرف التكلفة
  IF p_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cost ID must be provided');
  END IF;

  DELETE FROM fixed_costs fc -- استخدام اختصار للجدول
  WHERE fc.id = p_id AND fc.user_id = user_id; -- توضيح أن user_id ينتمي للجدول fixed_costs
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN jsonb_build_object('success', deleted > 0);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'delete_fixed_cost error: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. تعديل وظيفة get_project_settings للتعامل بشكل أكثر وضوحاً مع مرجع user_id
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
  
  -- تسجيل للتصحيح
  RAISE NOTICE 'get_project_settings: Using user_id: %', user_id;
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RAISE NOTICE 'get_project_settings: No user_id available';
    RETURN jsonb_build_object(
      'error', 'User not authenticated',
      'settings', NULL,
      'payment_methods', NULL
    );
  END IF;
  
  -- الحصول على إعدادات المشروع مع توضيح مرجع العمود user_id
  SELECT 
    ps.id,
    jsonb_build_object(
      'id', ps.id,
      'project_name', ps.project_name,
      'target_category', ps.target_category,
      'target_profit', ps.target_profit
    ) INTO settings_id, settings
  FROM project_settings ps -- استخدام اختصار واضح للجدول
  WHERE ps.user_id = user_id; -- توضيح أن user_id ينتمي للجدول project_settings
  
  -- إذا لم يتم العثور على إعدادات، قم بإنشاء إعدادات افتراضية
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
      
    -- إضافة طرق دفع افتراضية
    INSERT INTO project_payment_methods (project_settings_id, payment_method_code, is_enabled)
    VALUES 
      (settings_id, 'mada', TRUE),
      (settings_id, 'visa', TRUE),
      (settings_id, 'mastercard', TRUE);
  END IF;
  
  -- الحصول على طرق الدفع مع استخدام أسماء مستعارة واضحة للجداول
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
    RAISE NOTICE 'get_project_settings error: %', SQLERRM;
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'settings', NULL,
      'payment_methods', NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. تعديل وظيفة update_project_settings للتعامل بشكل أكثر وضوحاً مع مرجع user_id
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
  
  -- تسجيل للتصحيح
  RAISE NOTICE 'update_project_settings: Using user_id: %', user_id;
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RAISE NOTICE 'update_project_settings: No user_id available';
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- الحصول على معرف الإعدادات مع توضيح مرجع العمود user_id
  SELECT ps.id INTO settings_id 
  FROM project_settings ps -- استخدام اختصار واضح للجدول
  WHERE ps.user_id = user_id; -- توضيح أن user_id ينتمي للجدول project_settings
  
  -- إنشاء إعدادات إذا لم تكن موجودة
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
      COALESCE(p_project_name, 'نظام تسعير المنتجات المتقدم'), 
      COALESCE(p_target_category, 'medium'), 
      COALESCE(p_target_profit, 30)
    )
    RETURNING id INTO settings_id;
  ELSE
    RAISE NOTICE 'update_project_settings: Updating existing settings for user: %', user_id;
    -- تحديث الإعدادات الموجودة مع توضيح مراجع الأعمدة
    UPDATE project_settings ps -- استخدام اختصار واضح للجدول
    SET 
      project_name = COALESCE(p_project_name, ps.project_name),
      target_category = COALESCE(p_target_category, ps.target_category),
      target_profit = COALESCE(p_target_profit, ps.target_profit),
      updated_at = NOW()
    WHERE ps.id = settings_id; -- استخدام الاختصار للجدول
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
    RAISE NOTICE 'update_project_settings error: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'تم تصحيح المراجع الغامضة بنجاح' as result;