import { useState, useEffect } from "react";
import { ImageSourcePropType } from "react-native";
import { getCoverSource } from "../../../assets/covers/coverMap";

export function useCoverSource(trackId: string): ImageSourcePropType | null {
  const [imageSource, setImageSource] = useState<ImageSourcePropType | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    const loadCover = async () => {
      try {
        const source = await getCoverSource(trackId);
        if (isMounted && source) {
          setImageSource(source);
        }
      } catch (err) {
        console.error("Error loading cover:", err);
        if (isMounted) {
          setImageSource(null);
        }
      }
    };
    loadCover();
    return () => {
      isMounted = false;
    };
  }, [trackId]);

  return imageSource;
}
