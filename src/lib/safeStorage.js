const memory = new Map();

let localStorageSupported;

function canUseLocalStorage() {
  if (localStorageSupported !== undefined) return localStorageSupported;
  try {
    const k = '__hwe_ls_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    localStorageSupported = true;
  } catch {
    localStorageSupported = false;
  }
  return localStorageSupported;
}

export function safeGetItem(key) {
  if (canUseLocalStorage()) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  }
  return memory.get(key) ?? null;
}

export function safeSetItem(key, value) {
  if (canUseLocalStorage()) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      memory.set(key, value);
    }
  } else {
    memory.set(key, value);
  }
}

export function safeRemoveItem(key) {
  if (canUseLocalStorage()) {
    try {
      localStorage.removeItem(key);
    } catch {
      memory.delete(key);
    }
  } else {
    memory.delete(key);
  }
}
