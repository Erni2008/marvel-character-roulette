import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
export function usePWA() {
  const [error, setError] = useState<string | null>(null),
    [updating, setUpdating] = useState(false),
    [offline, setOffline] = useState(!navigator.onLine),
    [install, setInstall] = useState<InstallEvent | null>(null);
  const {
    offlineReady: [ready, setReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: () =>
      setError('Offline installation could not finish. Check your connection and retry.'),
    onRegisteredSW: (_, r) => {
      if (r) registration.current = r;
    },
  });
  const [registration] = useState<{ current: ServiceWorkerRegistration | undefined }>({
    current: undefined,
  });
  useEffect(() => {
    const online = () => setOffline(!navigator.onLine),
      prompt = (e: Event) => {
        e.preventDefault();
        setInstall(e as InstallEvent);
      };
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    window.addEventListener('beforeinstallprompt', prompt);
    const onInstalled = () => setInstall(null);
    window.addEventListener('appinstalled', onInstalled);
    const onChunk = (event: Event) => {
      event.preventDefault();
      setError('A new version is available. Reload to recover this screen; your session is saved.');
    };
    window.addEventListener('vite:preloadError', onChunk);
    const id = setInterval(
      () => {
        if (!document.hidden && navigator.onLine)
          void registration.current?.update().catch(() => {});
      },
      5 * 60 * 1000,
    );
    const check = () => {
      if (!document.hidden && navigator.onLine) void registration.current?.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', online);
      window.removeEventListener('beforeinstallprompt', prompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('vite:preloadError', onChunk);
      clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, [registration]);
  // Auto-apply new versions when not mid-round (the stream should always run the latest build).
  useEffect(() => {
    if (!needRefresh) return;
    const busy = /#\/(draw|guess)/.test(location.hash);
    if (!busy) void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);
  async function update() {
    window.dispatchEvent(new Event('roulette:pause'));
    setUpdating(true);
    setError(null);
    try {
      await registration.current?.update();
      await updateServiceWorker(true);
    } catch {
      setError(
        'The update could not be downloaded. Your current offline version is still available.',
      );
    } finally {
      setUpdating(false);
    }
  }
  async function retry() {
    setError(null);
    try {
      if (registration.current) await registration.current.update();
      else location.reload();
    } catch {
      setError('Still offline. Keep playing and try again when connected.');
    }
  }
  async function promptInstall() {
    if (!install) return;
    await install.prompt();
    if ((await install.userChoice).outcome === 'accepted') setInstall(null);
  }
  return {
    ready,
    setReady,
    needRefresh,
    setNeedRefresh,
    error,
    setError,
    updating,
    offline,
    install,
    promptInstall,
    update,
    retry,
  };
}
