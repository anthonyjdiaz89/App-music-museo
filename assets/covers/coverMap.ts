import { Platform } from "react-native";
import {
  getCoverPath,
  isCoverDownloaded,
} from "@src/features/library/services/download.service";
import { supabase } from "@src/features/library/services/supabase";

// Mapa de track IDs a nombres de archivo de carátula
export const coverFileMap: Record<string, string> = {
  trk_0djxswp: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_3q49o4t: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_zv6nwrm: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_epxzpbi: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_xnqbvmp: "3._DE_FRENTE_JSC_3542.JPG",
  trk_7gspukd: "3._DE_FRENTE_JSC_3542.JPG",
  trk_phebo90: "14._MI_VIDA_MUSICAL_JSC_3572.JPG",
  trk_093fsoh: "3._DE_FRENTE_JSC_3542.JPG",
  trk_fbzkhi1: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_y4rw3p2: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_aqk4er2: "11._GANO_EL_FOLCLOR_JSC_3565.JPG",
  trk_aymzuem: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_5vrpb3o: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_eoc2vb8: "3._DE_FRENTE_JSC_3542.JPG",
  trk_qt11oxl: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_4dlxprq: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_vokmo7t: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_zmxwq4h: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_loeydq0: "11._GANO_EL_FOLCLOR_JSC_3565.JPG",
  trk_ntalu2v: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_x97c44q: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_afovlx1: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_sgltzb7: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_7rduj03: "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG",
  trk_fxez35t: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_i4y06kv: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_gn1tr7b: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_3iozs2o: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_22imsu2: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_3ljtrwl: "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG",
  trk_cw3njdp: "3._DE_FRENTE_JSC_3542.JPG",
  trk_z2kfzfu: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_fgw4y5b: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_838gqzm: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_u9vwbj3: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_2d66dvr: "20_ADELANTE_JSC_3596.JPG",
  trk_l9mpsff: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_pyuh3rd: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_xeznr2i: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_3j9ilp7: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_sp0uchh: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_jsmh1n3: "3._DE_FRENTE_JSC_3542.JPG",
  trk_dtso3kj: "20_ADELANTE_JSC_3596.JPG",
  trk_mffy227: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_yk29ggp: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_xb5cnjy: "3._DE_FRENTE_JSC_3542.JPG",
  trk_f0a62em: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_r8t2li2: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_gduwk9g: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_gip7kas: "66._NACI_PARA_CANTAR_JSC_3741.JPG",
};

// Mapa de require() compartido para todas las plataformas
// export const coverRequireMap: Record<string, any> = {
//   "3._DE_FRENTE_JSC_3542.JPG": require("./3._DE_FRENTE_JSC_3542.JPG"),
//   "4._DOS_GRANDES_JSC_3544.JPG": require("./4._DOS_GRANDES_JSC_3544.JPG"),
//   "11._GANO_EL_FOLCLOR_JSC_3565.JPG": require("./11._GANO_EL_FOLCLOR_JSC_3565.JPG"),
//   "14._MI_VIDA_MUSICAL_JSC_3572.JPG": require("./14._MI_VIDA_MUSICAL_JSC_3572.JPG"),
//   "17._UN_CANTO_CELESTIAL_JSC_3582.JPG": require("./17._UN_CANTO_CELESTIAL_JSC_3582.JPG"),
//   "20_ADELANTE_JSC_3596.JPG": require("./20_ADELANTE_JSC_3596.JPG"),
//   "22._POR_LO_ALTO_JSC_3600.JPG": require("./22._POR_LO_ALTO_JSC_3600.JPG"),
//   "39.FESTIVAL_VALLENATO_JSC_3653.JPG": require("./39.FESTIVAL_VALLENATO_JSC_3653.JPG"),
//   "66._NACI_PARA_CANTAR_JSC_3741.JPG": require("./66._NACI_PARA_CANTAR_JSC_3741.JPG"),
//   "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG": require("./74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG"),
//   "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG": require("./77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG"),
// };

// Utilidad común: devuelve el source listo para <Image /> desde un trackId
export const getCoverSource = async (trackId: string) => {
  const filename = coverFileMap[trackId];
  if (!filename) return null;

  // En plataformas nativas, verificar si está descargada localmente
  if (Platform.OS !== "web") {
    const isDownloaded = await isCoverDownloaded(filename);
    if (isDownloaded) {
      const path = getCoverPath(filename);
      if (path) {
        return { uri: path };
      }
    }
  }

  // En web o si no está descargada, usar URL pública de Supabase
  const { data } = supabase.storage.from("covers").getPublicUrl(filename);
  if (data?.publicUrl) {
    return { uri: data.publicUrl };
  }

  return null;
};

// esto devuelve una lista de nombres de archivo de carátulas únicas
// asi evitamos descargar varias veces la misma carátula
export const getUniqueCovers = (): string[] => {
  return [...new Set(Object.values(coverFileMap))];
};
