import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      // refresh token 失效，静默清除
      supabase.auth.signOut();
    }
    setSession(session);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    
    if (error) {
      toast.error('Sign In Failed', { description: error.message });
    } else {
      toast.success('Welcome Back');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast('Session Terminated', { description: 'You have been logged out of Mako Space.' });
  };

  // 将所有需要的状态和方法暴漏出去
  return {
    session,
    email,
    setEmail,
    password,
    setPassword,
    authLoading,
    handleLogin,
    handleLogout
  };
}