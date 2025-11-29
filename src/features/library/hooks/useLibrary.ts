import { Genre, Track } from "@src/core/domain";
import { useEffect, useState } from "react";
import bundledLibrary from "@src/features/library/data/library.json";
import { loadLocalLibrary } from "@src/features/library";

// esta funcion busca quitar la responsabilidad al HomeScreen.tsx de cargar la libreria
// HomeScreen solo deberia encargarse de la UI.
// ahora el hook useLibrary se encarga de esto.
// se agrego ademas, un estado <loading>. este estado nos puede servir para mostrar
// una pantallade carga o indicar algun error durante la carga.
export function useLibrary() {
  const [items, setItems] = useState<Track[]>(bundledLibrary.items as Track[]);
  const [loading, setLoading] = useState(true);

  const mapGenre = (
    track: Omit<Track, "genre"> & { genre: string }
  ): Track => ({
    ...track,
    genre: (track.genre.toLowerCase() === "sone"
      ? "Son"
      : track.genre) as Genre,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const local = await loadLocalLibrary();
        if (isMounted && local?.items?.length)
          setItems((local.items as Track[]).map(mapGenre));
      } catch (err) {
        console.error("error loading local library:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, loading };
}
