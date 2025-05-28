-- تصحيح نهائي لمشكلة "column reference 'user_id' is ambiguous"
-- هذا الملف مُعدّ للتنفيذ المباشر في محرر SQL في Supabase

-- 1. حل مشكلة الاستعلامات المباشرة في جدول project_settings
CREATE OR REPLACE FUNCTION get_project_settings(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
  payment_methods JSONB;
  user_id UUID;
  settings_id UUID;
BEGIN
  -- استخدام معرف المستخدم المقدم أو المصادق عليه
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'error', 'User not authenticated',
      'settings', NULL,
      'payment_methods', NULL
    );
  END IF;
  
  -- استعلام مع تحديد جدول project_settings بشكل واضح
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
  
  -- إنشاء إعدادات افتراضية إذا لم تكن موجودة
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
      
    -- إضافة طرق دفع افتراضية
    INSERT INTO project_payment_methods (project_settings_id, payment_method_code, is_enabled)
    VALUES 
      (settings_id, 'mada', TRUE),
      (settings_id, 'visa', TRUE),
      (settings_id, 'mastercard', TRUE);
  END IF;
  
  -- استرجاع طرق الدفع مع تحديد واضح للجداول
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

-- 2. دالة تحديث إعدادات المشروع مع تحديد واضح للمراجع
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
  
  -- استعلام مع تحديد جدول project_settings بشكل واضح
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

-- 3. إصلاح دالة استرجاع التكاليف الثابتة
CREATE OR REPLACE FUNCTION get_fixed_costs(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  costs JSONB;
  user_id UUID;
BEGIN
  -- استخدام معرف المستخدم المقدم أو المصادق عليه
  user_id := COALESCE(p_user_id, auth.uid());
  
  -- التأكد من أن المستخدم مصادق
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'User not authenticated');
  END IF;
  
  -- استعلام مع تحديد جدول fixed_costs بشكل واضح
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

-- 4. تحديث دالة upsert_fixed_cost لتجنب الغموض
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

  -- إدراج أو تحديث تكلفة مع تحديد واضح للجدول
  IF p_id IS NULL THEN
    INSERT INTO fixed_costs (user_id, name, amount, period)
    VALUES (user_id, p_name, p_amount, p_period)
    RETURNING id INTO cost_id;
  ELSE
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

-- 5. تحديث دالة delete_fixed_cost
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

  -- حذف تكلفة مع تحديد واضح للجدول
  DELETE FROM fixed_costs fc
  WHERE fc.id = p_id AND fc.user_id = user_id;
  
  GET DIAGNOSTICS deleted = ROW_COUNT;
  
  RETURN jsonb_build_object('success', deleted > 0);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. إضافة دالة للتحقق من التوافق بين الجداول والمستخدمين
CREATE OR REPLACE FUNCTION check_database_integrity()
RETURNS JSONB AS $$
DECLARE
  issues JSONB := '[]'::jsonb;
  orphaned_settings INT;
  orphaned_costs INT;
  user_id UUID;
BEGIN
  -- البحث عن إعدادات مشروع بدون مستخدمين
  SELECT COUNT(*) INTO orphaned_settings
  FROM project_settings ps
  LEFT JOIN auth.users u ON ps.user_id = u.id
  WHERE u.id IS NULL;
  
  IF orphaned_settings > 0 THEN
    issues := issues || jsonb_build_object(
      'issue', 'Orphaned project settings found',
      'count', orphaned_settings,
      'action', 'Consider running cleanup commands'
    );
  END IF;
  
  -- البحث عن تكاليف ثابتة بدون مستخدمين
  SELECT COUNT(*) INTO orphaned_costs
  FROM fixed_costs fc
  LEFT JOIN auth.users u ON fc.user_id = u.id
  WHERE u.id IS NULL;
  
  IF orphaned_costs > 0 THEN
    issues := issues || jsonb_build_object(
      'issue', 'Orphaned fixed costs found',
      'count', orphaned_costs,
      'action', 'Consider running cleanup commands'
    );
  END IF;
  
  -- التحقق من المستخدم الحالي
  user_id := auth.uid();
  
  RETURN jsonb_build_object(
    'issues_count', jsonb_array_length(issues),
    'issues', issues,
    'current_user', user_id,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. تنظيف البيانات المعلقة (تشغيل فقط عند التأكد من أنه آمن!)
DO $$
BEGIN
  -- تعليق مؤقت - قم بإزالة التعليق فقط إذا كنت تريد تنظيف البيانات
  /*
  -- حذف الإعدادات اليتيمة
  DELETE FROM project_settings ps
  WHERE ps.user_id NOT IN (SELECT id FROM auth.users);
  
  -- حذف التكاليف اليتيمة
  DELETE FROM fixed_costs fc
  WHERE fc.user_id NOT IN (SELECT id FROM auth.users);
  */
  
  -- عرض رسالة
  RAISE NOTICE 'تم إنشاء الوظائف بنجاح. لتنظيف البيانات، قم بإزالة التعليق من القسم أعلاه.';
END;
$$;

-- 8. مؤشر النجاح النهائي
SELECT 'تم إصلاح مشكلة الأعمدة الغامضة وإنشاء وظائف مساعدة للتحقق من تكامل قاعدة البيانات' as نتيجة_العملية;