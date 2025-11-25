import { useMemo } from "react";
import { Track, Genre } from "@src/core/domain";

const normalizeText = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function useFilteredTracks(
  items: Track[],
  searchQuery: string,
  selectedGenre: Genre | "Todos"
): Track[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    const normalizedQuery = normalizeText(searchQuery || "");
    const searchWords = normalizedQuery
      .split(/\s+/)
      .filter((w) => w.length > 0);

    return items.filter((track) => {
      const matchesGenre =
        selectedGenre === "Todos" || track.genre === selectedGenre;

      if (!matchesGenre) return false;

      if (searchWords.length === 0) return true;

      const searchableContent = [
        track.title,
        track.artist,
        track.genre,
        track.description ?? "",
        ...(track.artist ? track.artist.split(" ") : []),
      ].join(" ");

      const normalizedContent = normalizeText(searchableContent);

      return searchWords.every((word) => normalizedContent.includes(word));
    });
  }, [items, searchQuery, selectedGenre]);
}
