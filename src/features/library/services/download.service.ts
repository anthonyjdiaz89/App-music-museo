import { supabase } from "./supabase";
import { Directory, File, Paths } from "expo-file-system";
import { fetch } from "expo/fetch";

const coversDir = new Directory(Paths.document, "covers");
export async function downloadCover(imageFileName: string) {
  try {
    console.log(coversDir);
    if (!(await coversDir.exists))
      await coversDir.create({ intermediates: true });

    if (await isCoverDownloaded(imageFileName)) {
      console.log(`cover already downloaded: ${imageFileName}`);
      return getCoverPath(imageFileName);
    }

    const { data, error } = await supabase.storage
      .from("covers")
      .createSignedUrl(imageFileName, 60);

    if (error) throw error;
    if (!data.signedUrl) throw new Error("no signed URL returned");

    const response = await fetch(data.signedUrl);
    if (!response.ok)
      throw new Error(`failed to download image: ${response.statusText}`);

    const file = new File(coversDir, imageFileName);
    file.write(await response.bytes());

    console.log(`cover downloaded to ${file.uri}`);
    return file.uri;
  } catch (err) {
    console.error("error downloading cover:", err);
  }
}

export async function downloadManyCovers(imageFileNames: string[]) {
  const results = await Promise.allSettled(
    imageFileNames.map((fileName) => downloadCover(fileName))
  );

  return results;
}

export function getCoverPath(imageFileName: string) {
  return `${coversDir.uri}/${imageFileName}`;
}

export async function isCoverDownloaded(
  imageFileName: string
): Promise<boolean> {
  const filePath = getCoverPath(imageFileName);
  const file = new File(filePath);
  return await file.exists;
}
