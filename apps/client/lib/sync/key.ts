import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SYNC_KEY_STORAGE_KEY = 'recall_sync_key';

/**
 * Generate a new sync key (32 bytes, base64 encoded)
 */
export async function generateSyncKey(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    randomBytes.join('')
  );
  return key;
}

/**
 * Get the stored sync key, or generate a new one if it doesn't exist
 */
export async function getSyncKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(SYNC_KEY_STORAGE_KEY);
  
  if (!key) {
    key = await generateSyncKey();
    await SecureStore.setItemAsync(SYNC_KEY_STORAGE_KEY, key);
  }
  
  return key;
}

/**
 * Check if a sync key exists
 */
export async function hasSyncKey(): Promise<boolean> {
  const key = await SecureStore.getItemAsync(SYNC_KEY_STORAGE_KEY);
  return key !== null;
}

/**
 * Set a specific sync key (used when pasting/importing)
 */
export async function setSyncKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SYNC_KEY_STORAGE_KEY, key);
}

/**
 * Clear the stored sync key (for testing/reset)
 */
export async function clearSyncKey(): Promise<void> {
  await SecureStore.deleteItemAsync(SYNC_KEY_STORAGE_KEY);
}
