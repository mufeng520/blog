import { getDB } from './db';

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: string }): Promise<FileSystemDirectoryHandle>;
  }
  interface FileSystemDirectoryHandle {
    requestPermission(descriptor?: { mode?: string }): Promise<PermissionState>;
  }
}

let directoryHandle: FileSystemDirectoryHandle | null = null;

export async function requestDirectory(): Promise<boolean> {
  try {
    directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const db = await getDB();
    await db.put('fileHandles', { id: 'output-dir', handle: directoryHandle as any });
    return true;
  } catch {
    return false;
  }
}

export async function restoreDirectory(): Promise<boolean> {
  try {
    const db = await getDB();
    const stored = await db.get('fileHandles', 'output-dir');
    if (!stored) return false;
    const permission = await stored.handle.requestPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
      directoryHandle = stored.handle;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function saveImageToFolder(base64Data: string, filename: string): Promise<void> {
  if (!directoryHandle) throw new Error('No directory selected');
  const blob = base64ToBlob(base64Data);
  const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function saveImageToProjectFolder(
  base64Data: string,
  projectName: string,
  filename: string
): Promise<void> {
  if (!directoryHandle) return;
  try {
    const projectDir = await directoryHandle.getDirectoryHandle(projectName, { create: true });
    const fileHandle = await projectDir.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(base64ToBlob(base64Data));
    await writable.close();
  } catch (e) {
    console.error('Failed to save to project folder:', e);
  }
}

export function hasDirectoryHandle(): boolean {
  return directoryHandle !== null;
}

export function getDirectoryName(): string | null {
  return directoryHandle?.name ?? null;
}

function base64ToBlob(base64: string): Blob {
  const match = base64.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error('Invalid base64 data URI');
  const byteString = atob(match[2]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: match[1] });
}
