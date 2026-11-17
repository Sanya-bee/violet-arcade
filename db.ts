// Минимальная обёртка над IndexedDB (key-value). Позже добавим сторы для рекордов и сохранений.
const DB = 'violet-arcade', STORE = 'kv'
const open = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open(DB, 1)
  r.onupgradeneeded = () => r.result.createObjectStore(STORE)
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error)
})
export async function dbGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await open()
    return await new Promise<T>(res => {
      const q = db.transaction(STORE).objectStore(STORE).get(key)
      q.onsuccess = () => res((q.result as T) ?? fallback); q.onerror = () => res(fallback)
    })
  } catch { return fallback }
}
export async function dbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await open()
    db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key)
  } catch { /* приватный режим Safari: тихо игнорируем */ }
}
