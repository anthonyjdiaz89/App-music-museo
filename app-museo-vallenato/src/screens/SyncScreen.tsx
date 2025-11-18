import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { palette, typography } from '../theme';
import { syncLibrary, fetchManifest, getLocalVersion } from '../sync';

export default function SyncScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');

  const log = useCallback((msg: string) => setLogs(prev => [...prev, msg]), []);

  const run = useCallback(async() => {
    setBusy(true); setLogs([]); setStatus('');
    try {
      const remote = await fetchManifest();
      const local = await getLocalVersion();
      log(`Versión local: ${local ?? 'ninguna'} | remota: ${remote.version}`);
      await syncLibrary(log, { cleanup: false });
      setStatus(`OK: sincronizado v${remote.version}`);
    } catch (e: any) {
      setStatus('Error: ' + String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <View style={{ flex:1, backgroundColor: palette.background, padding:16 }}>
      <Text style={{ ...typography.heading, color: palette.textPrimary, marginBottom:12 }}>Sincronizar Biblioteca</Text>
      <Text style={{ color: palette.textSecondary, marginBottom:12 }}>Descarga nuevas carátulas y canciones para uso 100% offline.</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        <TouchableOpacity disabled={busy} onPress={run} style={{ backgroundColor: palette.accent, paddingVertical:12, paddingHorizontal:16, borderRadius:8 }}>
          <Text style={{ color:'#fff' }}>{busy ? 'Sincronizando…' : 'Sincronizar ahora'}</Text>
        </TouchableOpacity>
      </View>
      {status ? <Text style={{ color: status.startsWith('OK') ? '#4caf50' : '#f44336', marginTop:12 }}>{status}</Text> : null}
      <ScrollView style={{ marginTop:16, backgroundColor: '#1e1e1e', borderRadius:8, padding:12 }}>
        {logs.map((l, i) => <Text key={i} style={{ color:'#ccc', fontSize:12, marginBottom:4 }}>• {l}</Text>)}
      </ScrollView>
    </View>
  );
}
