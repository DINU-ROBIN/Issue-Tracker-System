import { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import { supabase } from './supabase';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [profileState, setProfileState] = useState({
    userId: null,
    profile: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionChecked || !session) return;

    let cancelled = false;

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!cancelled) {
        setProfileState({ userId: session.user.id, profile: data });
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session, sessionChecked]);

  const profile =
    session && profileState.userId === session.user.id
      ? profileState.profile
      : null;
  const loading =
    !sessionChecked ||
    (Boolean(session) && profileState.userId !== session.user.id);

  const value = {
    session,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signOut: () => supabase.auth.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}