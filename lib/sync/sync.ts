import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { getAllPeopleForSync, upsertPeopleFromSync, markAsSynced } from '@/db/sync';
import { Person } from '@/types/person';

/**
 * Get the API URL based on environment
 */
function getApiUrl(): string {
  // Check for production API URL from environment
  const productionUrl = process.env.EXPO_PUBLIC_SYNC_API_URL;
  if (productionUrl) {
    return productionUrl;
  }
  
  // Development: use relative URL
  if (Constants.expoConfig?.hostUri) {
    return `http://${Constants.expoConfig.hostUri}/sync`;
  }
  
  return '/sync';
}

/**
 * Create HMAC signature for authentication
 * Note: This uses a simple hash approach. For production, consider using proper HMAC.
 */
async function createHmacSignature(
  data: string,
  key: string
): Promise<string> {
  // Create a simple HMAC-like signature by hashing data + key
  // In production, use proper HMAC (expo-crypto doesn't support HMAC directly)
  const combined = `${data}:${key}`;
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return signature;
}

/**
 * Export all people data for sync
 */
export async function exportData(): Promise<Person[]> {
  return await getAllPeopleForSync();
}

/**
 * Import people data and handle conflicts
 */
export async function importData(people: Person[]): Promise<void> {
  const normalizeDate = (
    value: Date | string | number | null | undefined
  ): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const normalized = people.map((person) => ({
    ...person,
    createdAt: normalizeDate(person.createdAt),
    updatedAt: normalizeDate(person.updatedAt),
    deletedAt: normalizeDate(person.deletedAt),
  }));

  await upsertPeopleFromSync(normalized);
  await markAsSynced(new Date());
}

/**
 * Sync data to server
 */
export async function syncToServer(
  syncKey: string
): Promise<void> {
  const apiUrl = getApiUrl();
  const data = await exportData();
  const dataString = JSON.stringify(data);
  
  // Create HMAC signature
  const signature = await createHmacSignature(dataString, syncKey);
  
  // For now, we'll send the data as-is (not encrypted)
  // Encryption can be added later if needed
  const response = await fetch(`${apiUrl}/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      syncKey,
      data: dataString,
      signature,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sync failed: ${errorText}`);
  }
  
  await markAsSynced(new Date());
}

/**
 * Sync data from server
 */
export async function syncFromServer(
  syncKey: string
): Promise<void> {
  const apiUrl = getApiUrl();
  
  // Create HMAC signature for the request
  const timestamp = Date.now().toString();
  const signature = await createHmacSignature(timestamp, syncKey);
  
  const response = await fetch(`${apiUrl}/pull?syncKey=${encodeURIComponent(syncKey)}&timestamp=${timestamp}&signature=${encodeURIComponent(signature)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sync failed: ${errorText}`);
  }
  
  const result = await response.json();
  
  if (result.data) {
    const people: Person[] = JSON.parse(result.data);
    await importData(people);
  }
}

/**
 * Perform a full sync (push then pull)
 */
export async function performSync(syncKey: string): Promise<void> {
  // Pull first so we don't overwrite server-only data; then push merged state
  await syncFromServer(syncKey);
  await syncToServer(syncKey);
}
