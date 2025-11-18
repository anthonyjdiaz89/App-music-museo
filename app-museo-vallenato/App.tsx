import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { fetchManifest, getLocalVersion, syncLibrary } from './src/sync';
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import SearchScreen from './src/screens/SearchScreen';
import SyncScreen from './src/screens/SyncScreen';
import { palette } from './src/theme';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        console.log('Cargando fuentes...');
        // Cargar fuentes (copiar los ttf reales en assets/fonts antes de iniciar)
        await Font.loadAsync({
          'Archivo-Regular': require('./assets/fonts/Archivo-Regular.ttf'),
          'Archivo-SemiBold': require('./assets/fonts/Archivo-SemiBold.ttf'),
          'Archivo-Bold': require('./assets/fonts/Archivo-Bold.ttf'),
          'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
          'Barlow-Regular': require('./assets/fonts/Barlow-Regular.ttf'),
        });
        console.log('Fuentes cargadas');
      } catch {}
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const [remote, local] = await Promise.all([fetchManifest().catch(()=>null), getLocalVersion()]);
        if (!remote) return;
        if (local == null || remote.version > local) {
          setSyncing(true);
          await syncLibrary(undefined, { cleanup: false });
        }
      } catch (e) {
        console.log('Auto-sync omitido:', e);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: palette.surface }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({ title: 'Inicio', headerRight: () => (
            syncing ? (
              <View style={{ marginRight:8 }}>
                <ActivityIndicator color={palette.accent} />
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Sync')} style={{ paddingHorizontal:12, paddingVertical:6, marginRight:4 }}>
                <Text style={{ color:'#fff', fontSize:14 }}>Sync</Text>
              </TouchableOpacity>
            )
          ) })} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
          <Stack.Screen name="Player" component={PlayerScreen} options={{ title: 'Reproduciendo' }} />
          <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronizar' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
