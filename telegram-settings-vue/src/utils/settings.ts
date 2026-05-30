import Homey from "../Homey";

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const raw = await Homey.get<string>(key);
  if (raw === undefined || raw === null || raw === "") {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setJsonSetting<T>(key: string, value: T): Promise<void> {
  await Homey.set(key, JSON.stringify(value));
}

export function generateNanoId(length = 10): string {
  return crypto.getRandomValues(new Uint8Array(length))
    .reduce((acc, value) => {
      const normalized = value & 63;
      if (normalized < 36) {
        return acc + normalized.toString(36);
      }
      if (normalized < 62) {
        return acc + (normalized - 26).toString(36).toUpperCase();
      }
      return acc + (normalized > 62 ? "-" : "_");
    }, "");
}
