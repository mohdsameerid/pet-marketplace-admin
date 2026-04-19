import type { NavigateFunction } from 'react-router-dom';

let _navigate: NavigateFunction | null = null;

export function setNavigate(fn: NavigateFunction) {
  _navigate = fn;
}

export function navigateTo(path: string) {
  if (_navigate) {
    _navigate(path, { replace: true });
  } else {
    window.location.href = path; // fallback before React mounts
  }
}
