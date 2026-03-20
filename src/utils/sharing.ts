import type { AppState } from '../types';

export function encodeStateToUrl(state: AppState): string {
  try {
    const json = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(json));
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
  } catch {
    return window.location.href;
  }
}

export function decodeStateFromUrl(): AppState | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) return null;
    const json = decodeURIComponent(atob(data));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function exportToJson(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marginmap-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products && data.settings && data.scenarios) {
          resolve(data);
        } else {
          reject(new Error('Invalid MarginMap data format'));
        }
      } catch {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
