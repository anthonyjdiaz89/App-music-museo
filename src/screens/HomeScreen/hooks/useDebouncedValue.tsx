import { useEffect, useState } from "react";

// esta funcion busca evitar recalcular el valor con cada input mientras el usuario escribe
// conviene utilizarlo junto con useFilteredTracks
// asi solo se actualiza el valor despues de que el usuario deja de escribir por un tiempo
// default 300ms
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}

// este hook se puede mover a src/shared/hooks si se llegase a necesitar
// en otros componentes
