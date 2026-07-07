import { EventEmitter } from "events";

class RedisCache extends EventEmitter {
  private store: Map<string, { value: string; expiry?: number }> = new Map();

  public get(key: string): string | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry < Date.now()) {
      this.store.delete(key);
      console.log(`[Redis] Key expired: ${key}`);
      return null;
    }
    console.log(`[Redis] Cache HIT: ${key}`);
    return item.value;
  }

  public set(key: string, value: string, ttlSeconds?: number): void {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiry });
    console.log(`[Redis] Cache SET: ${key} (TTL: ${ttlSeconds || "infinite"}s)`);
  }

  public delete(key: string): void {
    this.store.delete(key);
    console.log(`[Redis] Cache DELETE: ${key}`);
  }

  public publish(channel: string, message: string) {
    this.emit(`channel:${channel}`, message);
    console.log(`[Redis] PUBLISH channel [${channel}]`);
  }

  public subscribe(channel: string, callback: (msg: string) => void) {
    this.on(`channel:${channel}`, callback);
    console.log(`[Redis] SUBSCRIBE channel [${channel}]`);
    return () => {
      this.off(`channel:${channel}`, callback);
    };
  }

  public clear() {
    this.store.clear();
    console.log(`[Redis] Cache FLUSHALL`);
  }
}

export const redis = new RedisCache();
export const taskQueue = new EventEmitter();
