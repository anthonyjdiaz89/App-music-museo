import React, { useEffect, useMemo, useState } from 'react';
import { api } from './api';

function Sidebar({ current, setCurrent }) {
  return (
    <div className="sidebar">
      <h3 style={{marginTop:0}}>Admin</h3>
      <nav style={{ display:'grid', gap:8 }}>
        {['albums','tracks','library','generate'].map(k => (
          <button key={k} className={current===k?'primary':''} onClick={()=>setCurrent(k)}>{k.toUpperCase()}</button>
        ))}
      </nav>
      <div className="small" style={{marginTop:12}}>API: http://localhost:5050</div>
    </div>
  )
}

function AlbumForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e){
    e.preventDefault(); setBusy(true);
    try {
      let coverFilename = null;
      if (cover) {
        const up = await api.uploadCover(cover);
        coverFilename = up.filename;
      }
      const album = await api.createAlbum({ title, artist, year: year||null, description: description||null, coverFilename });
      setTitle(''); setArtist(''); setYear(''); setDescription(''); setCover(null);
      onCreated && onCreated(album);
    } catch (e) { alert(String(e)); }
    finally { setBusy(false); }
  }
  return (
    <form className="inline-form" onSubmit={submit}>
      <h4 className="header">Nuevo Álbum</h4>
      <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
      <input placeholder="Artista" value={artist} onChange={e=>setArtist(e.target.value)} required />
      <input placeholder="Año (texto libre)" value={year} onChange={e=>setYear(e.target.value)} />
      <textarea placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
      <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} />
      <div className="actions">
        <button className="primary" disabled={busy}>Crear</button>
      </div>
    </form>
  )
}

function AlbumsView(){
  const [albums, setAlbums] = useState([]);
  const refresh = async()=> setAlbums(await api.getAlbums());
  useEffect(()=>{ refresh(); },[]);
  const onDelete = async(id)=>{ if(!confirm('¿Eliminar álbum?')) return; await api.deleteAlbum(id); refresh(); }
  const [bulk, setBulk] = useState('');
  const importBulk = async()=>{
    if (!bulk.trim()) return;
    if (!confirm('Importar álbumes desde el texto pegado?')) return;
    try { const r = await api.importAlbums(bulk); alert(`Importados ${r.created} álbumes`); setBulk(''); refresh(); }
    catch(e){ alert('Error al importar: '+e); }
  };
  const [importingCovers, setImportingCovers] = useState(false);
  const [coversDir, setCoversDir] = useState('');
  useEffect(()=>{
    // Valor por defecto para Windows actual
    setCoversDir('D:\\Agency\\MUSEO\\FONOTECA\\CARATULAS  1');
  },[]);
  const importCovers = async()=>{
    if (!confirm('Importar carátulas desde directorio externo por número?')) return;
    setImportingCovers(true);
    try {
      const r = await api.importAlbumCovers(coversDir || undefined);
      alert(`Carátulas mapeadas: ${r.mapped}. Sin coincidencia: ${r.unmatched.length}`);
      refresh();
    } catch(e){ alert('Error importando carátulas: '+e); }
    finally { setImportingCovers(false); }
  };
  return (
    <div className="content">
      <h2 className="header">Álbumes</h2>
      <AlbumForm onCreated={refresh} />
      <div className="card" style={{marginBottom:16}}>
        <h4 className="header">Importación masiva</h4>
        <p className="small">Pega aquí el listado de CARATULA / NOMBRE LP / AÑO / DESCRIPCION y presiona Importar.</p>
        <textarea value={bulk} onChange={e=>setBulk(e.target.value)} rows={8} placeholder="Pega el texto aquí..." />
        <div className="actions" style={{marginTop:8, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <button onClick={importBulk}>Importar</button>
          <button onClick={importCovers} disabled={importingCovers}>{importingCovers?'Importando...':'Importar Carátulas'}</button>
          <input style={{minWidth:360}} value={coversDir} onChange={e=>setCoversDir(e.target.value)} placeholder="Ruta carpeta carátulas (opcional)" />
        </div>
      </div>
      <div className="card list">
        <table>
          <thead><tr><th>Título</th><th>Artista</th><th>Año</th><th>Descripción</th><th>Carátula</th><th></th></tr></thead>
          <tbody>
            {albums.map(a=> (
              <AlbumRow key={a.id} album={a} onChanged={refresh} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlbumRow({ album, onChanged, onDelete }){
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(album.title);
  const [artist, setArtist] = useState(album.artist||'');
  const [year, setYear] = useState(album.year||'');
  const [description, setDescription] = useState(album.description||'');
  const [cover, setCover] = useState(null);

  useEffect(()=>{
    if (!editing) return;
    setTitle(album.title); setArtist(album.artist||''); setYear(album.year||''); setDescription(album.description||''); setCover(null);
  }, [editing, album]);

  const save = async()=>{
    setBusy(true);
    try {
      let coverFilename = album.coverFilename || null;
      if (cover) {
        const up = await api.uploadCover(cover);
        coverFilename = up.filename;
      }
      await api.updateAlbum(album.id, { title, artist, year: year||null, description: description||null, coverFilename });
      setEditing(false);
      onChanged && onChanged();
    } catch(e) { alert('Error: '+e); }
    finally { setBusy(false); }
  };

  if (!editing) {
    return (
      <tr>
        <td>{album.title}</td>
        <td>{album.artist}</td>
        <td className="small">{album.year||''}</td>
        <td className="small" style={{maxWidth:320, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{album.description||''}</td>
        <td className="small">{album.coverFilename? album.coverFilename : <span className="small">(sin)</span>}</td>
        <td style={{whiteSpace:'nowrap'}}>
          <button onClick={()=>setEditing(true)}>Editar</button>
          <button className="danger" onClick={()=>onDelete(album.id)} style={{marginLeft:8}}>Eliminar</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td><input value={title} onChange={e=>setTitle(e.target.value)} /></td>
      <td><input value={artist} onChange={e=>setArtist(e.target.value)} /></td>
      <td><input value={year} onChange={e=>setYear(e.target.value)} placeholder="Año" /></td>
      <td><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} style={{minWidth:260}} /></td>
      <td>
        <input type="file" accept="image/*" onChange={e=>setCover(e.target.files?.[0]||null)} />
        {album.coverFilename && <div className="small">Actual: {album.coverFilename}</div>}
      </td>
      <td style={{whiteSpace:'nowrap'}}>
        <button className="success" onClick={save} disabled={busy}>{busy?'Guardando…':'Guardar'}</button>
        <button className="danger" onClick={()=>setEditing(false)} disabled={busy} style={{marginLeft:8}}>Cancelar</button>
      </td>
    </tr>
  );
}

function TrackForm({ albums, onCreated }){
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Paseo');
  const [albumId, setAlbumId] = useState('');
  const [audio, setAudio] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e){
    e.preventDefault(); setBusy(true);
    try {
      let audioFilename = null;
      if (audio) {
        const up = await api.uploadAudio(audio);
        audioFilename = up.filename;
      } else {
        alert('Sube un archivo de audio'); setBusy(false); return;
      }
      const track = await api.createTrack({ title, artist, genre, albumId: albumId||null, audioFilename });
      setTitle(''); setArtist(''); setGenre('Paseo'); setAlbumId(''); setAudio(null);
      onCreated && onCreated(track);
    } catch(e){ alert(String(e)); }
    finally { setBusy(false); }
  }
  return (
    <form className="inline-form" onSubmit={submit}>
      <h4 className="header">Nueva Pista</h4>
      <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
      <input placeholder="Artista" value={artist} onChange={e=>setArtist(e.target.value)} required />
      <select value={genre} onChange={e=>setGenre(e.target.value)}>
        {['Merengue','Paseo','Puya','Sone'].map(g=> <option key={g} value={g}>{g==='Sone'?'Son':g}</option>)}
      </select>
      <select value={albumId} onChange={e=>setAlbumId(e.target.value)}>
        <option value="">(sin álbum)</option>
        {albums.map(a => <option key={a.id} value={a.id}>{a.title} – {a.artist}</option>)}
      </select>
      <input type="file" accept="audio/*" onChange={e=>setAudio(e.target.files?.[0]||null)} />
      <div className="actions">
        <button className="primary" disabled={busy}>Crear</button>
      </div>
    </form>
  )
}

function TracksView(){
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const refresh = async()=> { setTracks(await api.getTracks()); setAlbums(await api.getAlbums()); };
  useEffect(()=>{ refresh(); },[]);
  const onDelete = async(id)=>{ if(!confirm('¿Eliminar pista?')) return; await api.deleteTrack(id); refresh(); }
  return (
    <div className="content">
      <h2 className="header">Pistas</h2>
      <TrackForm albums={albums} onCreated={refresh} />
      <div className="card list">
        <table>
          <thead><tr><th>Título</th><th>Artista</th><th>Género</th><th>Álbum</th><th>Archivo</th><th></th></tr></thead>
          <tbody>
            {tracks.map(t=> (
              <tr key={t.id}>
                <td>{t.title}</td><td>{t.artist}</td><td>{t.genre==='Sone'?'Son':t.genre}</td>
                <td>{(albums.find(a=>a.id===t.albumId)?.title)||<span className="small">(sin álbum)</span>}</td>
                <td>{t.audioFilename}</td>
                <td><button className="danger" onClick={()=>onDelete(t.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GenerateView(){
  const [status, setStatus] = useState(null);
  const run = async()=>{
    setStatus('Generando...');
    try { const r = await api.generate(); setStatus(`OK: ${r.tracks} pistas, ${r.audios} audios, ${r.covers} carátulas.`); }
    catch(e){ setStatus('Error: '+String(e)); }
  };
  return (
    <div className="content">
      <h2 className="header">Generar assets para la app</h2>
      <div className="card">
        <p>Esto copiará los audios y carátulas utilizados y generará los mapas estáticos que la app Expo requiere para funcionar 100% offline.</p>
        <div className="actions">
          <button className="success" onClick={run}>Generar</button>
        </div>
        {status && <p className="small" style={{marginTop:8}}>{status}</p>}
      </div>
    </div>
  )
}

function LibraryView(){
  const [lib, setLib] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const load = async()=>{
    setLoading(true);
    try {
      const [r, t, a] = await Promise.all([api.getLibrary(), api.getTracks(), api.getAlbums()]);
      setLib(r); setTracks(t); setAlbums(a);
    }
    catch(e){ alert('Error cargando library: '+e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const items = lib?.items || [];
  const trackById = useMemo(() => Object.fromEntries(tracks.map(t=>[t.id,t])), [tracks]);
  const albumById = useMemo(() => Object.fromEntries(albums.map(a=>[a.id,a])), [albums]);

  return (
    <div className="content">
      <h2 className="header">Library (App)</h2>
      <div className="card" style={{marginBottom:16}}>
        <p className="small">Fuente: {lib?.source || '—'} | Items: {items.length}</p>
        <div className="actions" style={{marginTop:4}}>
          <button onClick={load} disabled={loading}>{loading?'Actualizando...':'Refrescar'}</button>
        </div>
      </div>
      <div className="card list" style={{maxHeight:'60vh', overflow:'auto'}}>
        <table>
          <thead><tr><th>Título</th><th>Artista</th><th>Álbum</th><th>Género</th><th>Audio</th><th>Cover</th><th></th></tr></thead>
          <tbody>
            {items.map(it => {
              const trk = trackById[it.id];
              const alb = trk?.albumId ? albumById[trk.albumId] : null;
              return <LibraryRow key={it.id} item={it} track={trk} album={alb} albums={albums} onChanged={load} />
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LibraryRow({ item, track, album, albums, onChanged }){
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  // Track fields
  const [title, setTitle] = useState(item.title);
  const [artist, setArtist] = useState(item.artist);
  const [genre, setGenre] = useState(item.genre || 'Paseo');
  const [albumId, setAlbumId] = useState(track?.albumId || '');
  const [audioFile, setAudioFile] = useState(null);
  // Album fields
  const [albumTitle, setAlbumTitle] = useState(album?.title || item.album || '');
  const [albumArtist, setAlbumArtist] = useState(album?.artist || '');
  const [coverFile, setCoverFile] = useState(null);
  const [createNewAlbum, setCreateNewAlbum] = useState(false);

  useEffect(()=>{
    // Reset when toggling edit or data changes
    if (!editing) return;
    setTitle(item.title);
    setArtist(item.artist);
    setGenre(item.genre || 'Paseo');
    setAlbumId(track?.albumId || '');
    setAlbumTitle(album?.title || item.album || '');
    setAlbumArtist(album?.artist || '');
    setAudioFile(null); setCoverFile(null); setCreateNewAlbum(false);
  }, [editing, item, track, album]);

  const save = async()=>{
    if (!track) { alert('No se encontró el track base'); return; }
    setBusy(true);
    try {
      let targetAlbumId = albumId || null;
      // Crear nuevo álbum si aplica
      if (createNewAlbum) {
        if (!albumTitle) { alert('Título de álbum requerido'); setBusy(false); return; }
        const created = await api.createAlbum({ title: albumTitle, artist: albumArtist||artist, coverFilename: null });
        targetAlbumId = created.id;
      }
      // Subir audio si cambió
      let audioFilename = track.audioFilename;
      if (audioFile) {
        const up = await api.uploadAudio(audioFile);
        audioFilename = up.filename;
      }
      // Actualizar track
      await api.updateTrack(track.id, { title, artist, genre, albumId: targetAlbumId, audioFilename });
      // Actualizar/crear cover
      let targetAlbumForCover = targetAlbumId && albums.find(a=>a.id===targetAlbumId) || album || null;
      if (coverFile) {
        const upc = await api.uploadCover(coverFile);
        if (targetAlbumId) {
          await api.updateAlbum(targetAlbumId, { coverFilename: upc.filename });
        } else if (album) {
          await api.updateAlbum(album.id, { coverFilename: upc.filename });
        }
      }
      // Renombrar álbum si no es nuevo y cambió el título o artista
      if (!createNewAlbum && targetAlbumId && (albumTitle !== (album?.title||'') || albumArtist !== (album?.artist||''))) {
        await api.updateAlbum(targetAlbumId, { title: albumTitle, artist: albumArtist });
      }
      // Regenerar assets para reflejar la library de la app
      await api.generate();
      setEditing(false);
      onChanged && onChanged();
    } catch(e) {
      alert('Error guardando: '+e);
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <tr>
        <td>{item.title}</td>
        <td>{item.artist}</td>
        <td>{item.album || <span className="small">(sin)</span>}</td>
        <td>{item.genre}</td>
        <td className="small">{track?.audioFilename || item.audioUrl}</td>
        <td className="small">{album?.coverFilename || item.imageUrl || <span className="small">(sin)</span>}</td>
        <td style={{whiteSpace:'nowrap'}}>
          <button onClick={()=>setEditing(true)}>Editar</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" />
      </td>
      <td>
        <input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artista" />
      </td>
      <td>
        <div style={{display:'grid', gap:6}}>
          <select value={createNewAlbum? '__new__' : (albumId||'')} onChange={e=>{
            const v = e.target.value; if (v==='__new__'){ setCreateNewAlbum(true); setAlbumId(''); } else { setCreateNewAlbum(false); setAlbumId(v); }
          }}>
            <option value="">(sin álbum)</option>
            {albums.map(a=> <option key={a.id} value={a.id}>{a.title} – {a.artist}</option>)}
            <option value="__new__">➕ Nuevo álbum…</option>
          </select>
          {(createNewAlbum || albumId) && (
            <>
              <input value={albumTitle} onChange={e=>setAlbumTitle(e.target.value)} placeholder="Título del álbum" />
              <input value={albumArtist} onChange={e=>setAlbumArtist(e.target.value)} placeholder="Artista del álbum" />
            </>
          )}
        </div>
      </td>
      <td>
        <select value={genre} onChange={e=>setGenre(e.target.value)}>
          {['Merengue','Paseo','Puya','Sone'].map(g=> <option key={g} value={g}>{g==='Sone'?'Son':g}</option>)}
        </select>
      </td>
      <td>
        <input type="file" accept="audio/*" onChange={e=>setAudioFile(e.target.files?.[0]||null)} />
        {track?.audioFilename && <div className="small">Actual: {track.audioFilename}</div>}
      </td>
      <td>
        <input type="file" accept="image/*" onChange={e=>setCoverFile(e.target.files?.[0]||null)} />
        {album?.coverFilename && <div className="small">Actual: {album.coverFilename}</div>}
      </td>
      <td style={{whiteSpace:'nowrap'}}>
        <button className="success" onClick={save} disabled={busy}>{busy?'Guardando…':'Guardar'}</button>
        <button className="danger" onClick={()=>setEditing(false)} disabled={busy} style={{marginLeft:8}}>Cancelar</button>
      </td>
    </tr>
  );
}

export default function App(){
  const [current, setCurrent] = useState('albums');
  return (
    <div className="layout">
      <Sidebar current={current} setCurrent={setCurrent} />
      {current==='albums' && <AlbumsView />}
      {current==='tracks' && <TracksView />}
      {current==='library' && <LibraryView />}
      {current==='generate' && <GenerateView />}
    </div>
  )
}
