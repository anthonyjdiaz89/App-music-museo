import { downloadManyCovers } from "@src/features/library/services/download.service";
import { getUniqueCovers } from "assets/covers/coverMap";
import { TouchableOpacity, Text } from "react-native";

// se puede personalizar para descargar carátulas específicas
// u otras cosas mas adelante
export default function DownloadButton() {
  const handleDownload = async () => {
    const covers = getUniqueCovers();

    await downloadManyCovers(covers);
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      style={{ backgroundColor: "white", padding: 20 }}
    >
      <Text>Download Covers</Text>
    </TouchableOpacity>
  );
}
