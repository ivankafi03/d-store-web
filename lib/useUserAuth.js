'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dstore_user_session';

export function useUserAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek sesi user saat komponen pertama kali mount
  const checkSession = useCallback(async () => {
    try {
      // Baca dari localStorage untuk instant feedback tanpa waiting
      let localUser = null;
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.email) {
              localUser = parsed;
              setUser(parsed);
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }

      // Verifikasi ke server untuk sinkronisasi cookie & data terbaru
      const res = await fetch('/api/user/auth', { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
          }
        } else if (!localUser) {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (err) {
      console.warn('[useUserAuth] Gagal verifikasi sesi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();

    const handleStorageChange = (e) => {
      if (e && e.key && e.key !== STORAGE_KEY) return;
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.email) setUser(parsed);
          } catch {}
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkSession]);

  // Login dengan Google
  const loginWithGoogle = async (payload) => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_login',
          ...payload
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal login dengan akun Google');
      }

      setUser(data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      }
      return { ok: true, user: data.user };
    } catch (err) {
      console.error('[useUserAuth] Error login:', err);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (err) {
      console.warn('[useUserAuth] Error logout:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    }
  };

  // Update profil
  const updateProfile = async (updateData) => {
    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          ...updateData
        })
      });
      const data = await res.json();
      if (data.ok && data.user) {
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        }
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || 'Gagal memperbarui profil' };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  return {
    user,
    isLoggedIn: !!user,
    loading,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshSession: checkSession
  };
}
