import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import {
  fetchManifest,
  getLocalVersion,
  syncLibrary,
} from "./src/features/library/services/sync";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import HomeScreen from "./src/screens/HomeScreen/HomeScreen";
import PlayerScreen from "./src/screens/PlayerScreen";
import SyncScreen from "./src/screens/SyncScreen";
import AdminScreen from "./src/screens/AdminScreen";
import { palette } from "./src/core/config/theme";
import ErrorBoundary from "./src/shared/components/ErrorBoundary";
import { AudioProvider } from "./src/features/audio/AudioContext";

const Stack = createNativeStackNavigator();

const ENABLE_AUTO_SYNC = process.env.EXPO_PUBLIC_ENABLE_AUTO_SYNC === "true";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Welcome: "",
      Home: "home",
      Search: "search",
      Player: "player",
      Sync: "sync",
      Admin: "admin",
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        console.log("Cargando fuentes...");
        // Cargar fuentes (copiar los ttf reales en assets/fonts antes de iniciar)
        await Font.loadAsync({
          "Archivo-Regular": require("./assets/fonts/Archivo-Regular.ttf"),
          "Archivo-SemiBold": require("./assets/fonts/Archivo-SemiBold.ttf"),
          "Archivo-Bold": require("./assets/fonts/Archivo-Bold.ttf"),
          "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
          "Barlow-Regular": require("./assets/fonts/Barlow-Regular.ttf"),
        });
        console.log("Fuentes cargadas");
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready || Platform.OS === "web" || !ENABLE_AUTO_SYNC) return;
    let cancelled = false;
    (async () => {
      try {
        const [remote, local] = await Promise.all([
          fetchManifest().catch(() => null),
          getLocalVersion(),
        ]);
        if (!remote) return;
        if (local == null || remote.version > local) {
          setSyncing(true);
          await syncLibrary(undefined, { cleanup: false });
        }
      } catch (e) {
        console.log("Auto-sync omitido:", e);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: palette.background,
        }}
      >
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AudioProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.background },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Player" component={PlayerScreen} />
            <Stack.Screen name="Sync" component={SyncScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </ErrorBoundary>
  );
}
