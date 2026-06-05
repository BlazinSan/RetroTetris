import { GameResult } from './storage';

const API_URL = 'https://api.restful-api.dev/objects';

export interface SyncData {
  history: GameResult[];
  settings: any;
}

// Upload local data to online cloud and return a sync ID
export const uploadSyncData = async (data: SyncData): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'RetroTetris_Backup',
      data: data
    })
  });
  if (!response.ok) throw new Error('Failed to upload data');
  const result = await response.json();
  return result.id;
};

// Update existing backup in the cloud
export const updateSyncData = async (syncId: string, data: SyncData): Promise<void> => {
  const response = await fetch(`${API_URL}/${syncId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'RetroTetris_Backup',
      data: data
    })
  });
  if (!response.ok) throw new Error('Failed to update sync backup');
};

// Download backup from the cloud using sync ID
export const downloadSyncData = async (syncId: string): Promise<SyncData> => {
  const response = await fetch(`${API_URL}/${syncId}`);
  if (!response.ok) throw new Error('Backup not found');
  const result = await response.json();
  return result.data;
};
