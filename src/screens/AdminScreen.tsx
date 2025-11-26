import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { palette, typography, spacing } from "../core/config/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import TracksView from "../features/library/components/admin/TracksView";
import AlbumsView from "../features/library/components/admin/AlbumsView";
import SyncView from "../features/library/components/admin/SyncView";

type AdminView = "albums" | "tracks" | "sync";

export default function AdminScreen({ navigation }: { navigation: any }) {
  const [currentView, setCurrentView] = useState<AdminView>("albums");

  const renderContent = () => {
    switch (currentView) {
      case "albums":
        return <AlbumsView />;
      case "tracks":
        return <TracksView />;
      case "sync":
        return <SyncView />;
      default:
        return <AlbumsView />;
    }
  };

  const MenuItem = ({ id, label }: { id: AdminView; label: string }) => (
    <TouchableOpacity
      style={[styles.menuItem, currentView === id && styles.menuItemActive]}
      onPress={() => setCurrentView(id)}
    >
      <Text
        style={[
          styles.menuItemText,
          currentView === id && styles.menuItemTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.title}>Admin</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menu}>
            <MenuItem id="albums" label="ÁLBUMES" />
            <MenuItem id="tracks" label="CANCIONES" />
            <MenuItem id="sync" label="SINCRONIZAR" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.header}>{currentView.toUpperCase()}</Text>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 200,
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: palette.border,
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  main: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: palette.textPrimary,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    backgroundColor: palette.primary,
  },
  backButtonText: {
    ...typography.caption,
    color: palette.textPrimary,
  },
  menu: {
    gap: spacing.sm,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
  },
  menuItemActive: {
    backgroundColor: palette.primary,
  },
  menuItemText: {
    ...typography.body,
    color: palette.textSecondary,
  },
  menuItemTextActive: {
    color: palette.textPrimary,
    fontFamily: "Archivo-SemiBold",
  },
  header: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    color: palette.textSecondary,
  },
  apiInfo: {
    ...typography.caption,
    color: palette.textTertiary,
    marginTop: "auto",
    paddingTop: spacing.lg,
  },
});
