import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Creating a client-side supabase instance with proper cookie options
const supabase = createClientComponentClient({
  cookieOptions: {
    name: "sb-auth-token",
    lifetime: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    path: "/",
  }
});

export async function getCurrentSession() {
  console.log('[auth] getCurrentSession called');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[auth] getCurrentSession error:', error.message);
      return null;
    }
    console.log('[auth] getCurrentSession success:', data?.session?.user?.id);
    return data.session;
  } catch (e) {
    console.error('[auth] getCurrentSession exception:', e.message);
    return null;
  }
}

export async function getCurrentUser() {
  console.log('[auth] getCurrentUser called');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[auth] getCurrentUser error:', error.message);
      return null;
    }
    console.log('[auth] getCurrentUser success:', user?.id);
    return user;
  } catch (e) {
    console.error('[auth] getCurrentUser exception:', e.message);
    return null;
  }
}

export async function signInWithEmail(email, password) {
  console.log(`[auth] signInWithEmail called with email: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[auth] signInWithEmail error:', error.message);
    } else {
      console.log('[auth] signInWithEmail success:', data?.user?.id);
    }
    return { data, error };
  } catch (e) {
    console.error('[auth] signInWithEmail exception:', e.message);
    return { data: null, error: e };
  }
}

export async function signUpWithEmail(email, password) {
  console.log(`[auth] signUpWithEmail called with email: ${email}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('[auth] signUpWithEmail error:', error.message);
    } else {
      console.log('[auth] signUpWithEmail success:', data?.user?.id);
    }
    return { data, error };
  } catch (e) {
    console.error('[auth] signUpWithEmail exception:', e.message);
    return { data: null, error: e };
  }
}

export async function resetPassword(email, redirectUrl) {
  console.log(`[auth] resetPassword called with email: ${email}`);
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
      console.error('[auth] resetPassword error:', error.message);
    } else {
      console.log('[auth] resetPassword success');
    }
    return { data, error };
  } catch (e) {
    console.error('[auth] resetPassword exception:', e.message);
    return { data: null, error: e };
  }
}

export async function signOut() {
  console.log('[auth] signOut called');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[auth] signOut error:', error.message);
    } else {
      console.log('[auth] signOut success');
    }
    return { error };
  } catch (e) {
    console.error('[auth] signOut exception:', e.message);
    return { error: e };
  }
}

export async function upsertProfile(userId, profileData) {
  console.log(`[auth] upsertProfile called for userId: ${userId}`);
  if (!userId) {
    console.error('[auth] upsertProfile error: No userId provided');
    return { data: null, error: new Error('No userId provided') };
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          updated_at: new Date().toISOString(),
          ...profileData,
        },
        { onConflict: 'id' }
      );
    if (error) {
      console.error('[auth] upsertProfile error:', error.message);
    } else {
      console.log('[auth] upsertProfile success for user:', userId);
    }
    return { data, error };
  } catch (e) {
    console.error('[auth] upsertProfile exception:', e.message);
    return { data: null, error: e };
  }
}