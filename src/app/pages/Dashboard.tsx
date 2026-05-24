import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import {
  fetchDashboard,
  createAdminSession,
  destroyAdminSession,
  ApiError,
  type DashboardData,
} from '../utils/api';
import {
  LIMITS,
  validateSignIn,
  type SignInField,
  type ValidationErrors,
} from '../utils/validation';

function StatCard({ label, value, delta, accent = '#EBBD06' }: {
  label: string; value: number; delta: string; accent?: string;
}) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
      <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      <p className="text-4xl font-black" style={{ color: accent }}>{value.toLocaleString()}</p>
      <p className="text-xs text-[#027A4F] mt-2 font-mono">{delta}</p>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
        <span className="capitalize">{label}</span>
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${Math.round((value / Math.max(max, 1)) * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [authed, setAuthed]       = useState(false);
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<SignInField>>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchDashboard();
      setData(result);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message ?? t('dashboard.failedToLoad'));
      // Session rejected — force re-login. Branching on the HTTP status, not
      // the error message, so a backend wording change can't keep a dead
      // session driving the auto-refresh loop every 60s.
      if (err instanceof ApiError && err.status === 401) {
        setAuthed(false);
        await destroyAdminSession();
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  // On mount, try the dashboard once — the HttpOnly cookie will either let
  // us through (returning admin) or 401 (back to sign-in form).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchDashboard();
        if (!cancelled) {
          setData(result);
          setAuthed(true);
          setLastRefresh(new Date());
        }
      } catch {
        // No session yet — silently fall through to the sign-in form.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Auto-refresh every 60 s while authenticated
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => loadData(), 60_000);
    return () => clearInterval(interval);
  }, [authed, loadData]);

  const handleSignIn = async () => {
    const validation = validateSignIn(email, password, t);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(validation.errors.email ?? validation.errors.password ?? t('dashboard.invalidCreds'));
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError || !authData.session) {
        setError(authError?.message ?? t('dashboard.signInFailed'));
        return;
      }

      // Hand the Supabase access token to our API so it can mint an HttpOnly
      // session cookie. The JWT itself is then dropped — supabaseClient is
      // configured with persistSession:false, so nothing ever touches storage.
      try {
        await createAdminSession(authData.session.access_token);
      } catch (err: any) {
        setError(err?.message ?? t('dashboard.signInFailed'));
        return;
      }

      setAuthed(true);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await destroyAdminSession();
    setAuthed(false);
    setData(null);
    setEmail('');
    setPassword('');
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0C0C0A] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-3xl font-black uppercase text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-500 text-sm mb-8 font-mono">{t('dashboard.adminOnly')}</p>

          <input
            type="email"
            placeholder={t('dashboard.adminEmail')}
            autoComplete="email"
            maxLength={LIMITS.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            aria-invalid={fieldErrors.email ? true : undefined}
            className={`w-full bg-[#1A1A1A] border text-white px-4 py-3 mb-3 text-center font-mono focus:border-[#DD3935] outline-none ${
              fieldErrors.email ? 'border-[#DD3935]' : 'border-[#333]'
            }`}
          />
          <input
            type="password"
            placeholder={t('dashboard.password')}
            autoComplete="current-password"
            maxLength={LIMITS.password}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            aria-invalid={fieldErrors.password ? true : undefined}
            className={`w-full bg-[#1A1A1A] border text-white px-4 py-3 mb-3 text-center font-mono focus:border-[#DD3935] outline-none ${
              fieldErrors.password ? 'border-[#DD3935]' : 'border-[#333]'
            }`}
          />

          {error && <p className="text-[#DD3935] text-sm mb-3 font-mono">{error}</p>}

          <button
            onClick={handleSignIn}
            disabled={loading || !email || !password}
            className="w-full bg-[#DD3935] hover:bg-[#C92F2B] text-white py-3 font-black uppercase tracking-wide transition-colors disabled:opacity-50"
          >
            {loading ? t('dashboard.signingIn') : t('dashboard.signIn')}
          </button>
        </div>
      </div>
    );
  }

  const s = data?.stats;
  const maxWave    = Math.max(...(data?.waves.map(w => w.signer_count)    ?? [1]));
  const maxCountry = Math.max(...(data?.countries.map(c => c.signer_count) ?? [1]));

  return (
    <div className="min-h-screen bg-[#0C0C0A] text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black uppercase mb-1">{t('dashboard.movementDashboard')}</h1>
            <p className="text-xs font-mono text-gray-500">
              {lastRefresh ? t('dashboard.updatedAt', { time: lastRefresh.toLocaleTimeString() }) : t('dashboard.loadingState')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="border border-[#333] px-4 py-2 text-xs font-mono text-gray-400 hover:border-[#DD3935] hover:text-[#DD3935] transition-colors disabled:opacity-50"
            >
              {loading ? t('dashboard.refreshing') : t('dashboard.refresh')}
            </button>
            <button
              onClick={handleSignOut}
              className="border border-[#333] px-4 py-2 text-xs font-mono text-gray-400 hover:border-white hover:text-white transition-colors"
            >
              {t('dashboard.signOut')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label={t('dashboard.stats.signatures')} value={s?.total_signers   ?? 0} delta={t('dashboard.stats.today', { n: s?.signed_today ?? 0 })} />
          <StatCard label={t('dashboard.stats.waveMarks')}  value={s?.total_marks     ?? 0} delta={t('dashboard.stats.today', { n: s?.marks_today  ?? 0 })} accent="#DD3935" />
          <StatCard label={t('dashboard.stats.shares')}     value={s?.total_shares    ?? 0} delta={t('dashboard.stats.today', { n: s?.shares_today ?? 0 })} accent="#027A4F" />
          <StatCard label={t('dashboard.stats.countries')}  value={s?.total_countries ?? 0} delta={t('dashboard.stats.represented')}                        accent="#EBBD06" />
        </div>

        {data?.last7Days && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">{t('dashboard.last7Days')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { label: t('dashboard.last7.signed'),       value: data.last7Days.signed,        color: '#EBBD06' },
                { label: t('dashboard.last7.gotMark'),      value: data.last7Days.got_mark,      color: '#DD3935' },
                { label: t('dashboard.last7.sharedSocial'), value: data.last7Days.shared_social, color: '#027A4F' },
                { label: t('dashboard.last7.stories'),      value: data.last7Days.shared_story,  color: '#5B8FFF' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-xs font-mono text-gray-500 mt-1 uppercase">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">{t('dashboard.topWaves')}</p>
            {(data?.waves ?? []).map(w => (
              <BarRow key={w.wave_tag} label={t(`sectors.${w.wave_tag}`, { defaultValue: w.wave_tag })} value={w.signer_count} max={maxWave} color="#EBBD06" />
            ))}
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">{t('dashboard.topCountries')}</p>
            {(data?.countries ?? []).slice(0, 8).map(c => (
              <BarRow key={c.country} label={t(`countries.list.${c.country}`, { defaultValue: c.country })} value={c.signer_count} max={maxCountry} color="#DD3935" />
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">{t('dashboard.recentSigners')}</p>
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                {[t('dashboard.cols.name'), t('dashboard.cols.country'), t('dashboard.cols.wave'), t('dashboard.cols.when')].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-gray-600 uppercase tracking-wide font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).map((r, i) => {
                const mins = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60_000);
                const when = mins < 60 ? t('dashboard.minAgo', { n: mins }) : t('dashboard.hourAgo', { n: Math.floor(mins / 60) });
                return (
                  <tr key={i} className="border-b border-[#1E1E1E] hover:bg-[#222]">
                    <td className="py-2 px-3 text-white">{r.first_name}</td>
                    <td className="py-2 px-3 text-gray-400">{t(`countries.list.${r.country}`, { defaultValue: r.country })}</td>
                    <td className="py-2 px-3">
                      {r.wave_tag
                        ? <span className="text-[#DD3935] border border-[#DD3935]/30 px-2 py-0.5 text-xs uppercase">{t(`sectors.${r.wave_tag}`, { defaultValue: r.wave_tag })}</span>
                        : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-2 px-3 text-gray-600 text-xs">{when}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
