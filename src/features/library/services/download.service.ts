import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

const supportsFileSystem = Platform.OS !== "web" && !!FileSystem.documentDirectory;
const coversDir = supportsFileSystem && FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}covers/`
  : null;

async function ensureCoversDir() {
  if (!supportsFileSystem || !coversDir) return;
  const info = await FileSystem.getInfoAsync(coversDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(coversDir, { intermediates: true });
  }
}

export async function downloadCover(imageFileName: string) {
  if (!supportsFileSystem || !coversDir) {
    return null;
  }

  try {
    await ensureCoversDir();

    if (await isCoverDownloaded(imageFileName)) {
      return getCoverPath(imageFileName);
    }

    const { data, error } = await supabase.storage
      .from("covers")
      .createSignedUrl(imageFileName, 60);

    if (error) throw error;
    if (!data.signedUrl) throw new Error("no signed URL returned");

    const localPath = getCoverPath(imageFileName);
    if (!localPath) return null;

    await FileSystem.downloadAsync(data.signedUrl, localPath);
    return localPath;
  } catch (err) {
    console.error("error downloading cover:", err);
    return null;
  }
}

export async function downloadManyCovers(imageFileNames: string[]) {
  if (!supportsFileSystem) {
    return imageFileNames.map(
      () => ({ status: "fulfilled", value: null }) as PromiseSettledResult<string | null>
    );
  }

  const results = await Promise.allSettled(
    imageFileNames.map((fileName) => downloadCover(fileName))
  );

  return results;
}

export function getCoverPath(imageFileName: string) {
  if (!supportsFileSystem || !coversDir) return null;
  return `${coversDir}${imageFileName}`;
}

export async function isCoverDownloaded(
  imageFileName: string
): Promise<boolean> {
  if (!supportsFileSystem) return false;
  const filePath = getCoverPath(imageFileName);
  if (!filePath) return false;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
}
