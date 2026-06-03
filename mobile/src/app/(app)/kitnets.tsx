import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import {
  Badge,
  Button,
  CurrencyInput,
  EmptyState,
  Fab,
  Field,
  FormModal,
  Input,
  PhotosField,
  Select,
  type Option,
} from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useAuth } from '@/data/auth-context';
import {
  createKitnet,
  deleteKitnet,
  fetchKitnets,
  getPhotoUrl,
  updateKitnet,
  type KitnetApi,
} from '@/services/kitnets.service';
import { colors, radius, spacing } from '@/theme';
import { formatCurrency } from '@/utils';

// ---------- Estados brasileiros ----------

const ESTADOS: Option[] = [
  { value: 'AC', label: 'AC — Acre',                shortLabel: 'AC' },
  { value: 'AL', label: 'AL — Alagoas',             shortLabel: 'AL' },
  { value: 'AP', label: 'AP — Amapá',               shortLabel: 'AP' },
  { value: 'AM', label: 'AM — Amazonas',            shortLabel: 'AM' },
  { value: 'BA', label: 'BA — Bahia',               shortLabel: 'BA' },
  { value: 'CE', label: 'CE — Ceará',               shortLabel: 'CE' },
  { value: 'DF', label: 'DF — Distrito Federal',    shortLabel: 'DF' },
  { value: 'ES', label: 'ES — Espírito Santo',      shortLabel: 'ES' },
  { value: 'GO', label: 'GO — Goiás',               shortLabel: 'GO' },
  { value: 'MA', label: 'MA — Maranhão',            shortLabel: 'MA' },
  { value: 'MT', label: 'MT — Mato Grosso',         shortLabel: 'MT' },
  { value: 'MS', label: 'MS — Mato Grosso do Sul',  shortLabel: 'MS' },
  { value: 'MG', label: 'MG — Minas Gerais',        shortLabel: 'MG' },
  { value: 'PA', label: 'PA — Pará',                shortLabel: 'PA' },
  { value: 'PB', label: 'PB — Paraíba',             shortLabel: 'PB' },
  { value: 'PR', label: 'PR — Paraná',              shortLabel: 'PR' },
  { value: 'PE', label: 'PE — Pernambuco',          shortLabel: 'PE' },
  { value: 'PI', label: 'PI — Piauí',               shortLabel: 'PI' },
  { value: 'RJ', label: 'RJ — Rio de Janeiro',      shortLabel: 'RJ' },
  { value: 'RN', label: 'RN — Rio Grande do Norte', shortLabel: 'RN' },
  { value: 'RS', label: 'RS — Rio Grande do Sul',   shortLabel: 'RS' },
  { value: 'RO', label: 'RO — Rondônia',            shortLabel: 'RO' },
  { value: 'RR', label: 'RR — Roraima',             shortLabel: 'RR' },
  { value: 'SC', label: 'SC — Santa Catarina',      shortLabel: 'SC' },
  { value: 'SP', label: 'SP — São Paulo',           shortLabel: 'SP' },
  { value: 'SE', label: 'SE — Sergipe',             shortLabel: 'SE' },
  { value: 'TO', label: 'TO — Tocantins',           shortLabel: 'TO' },
];

// ---------- Hook de geocodificação (Nominatim / OSM) ----------

type GeoStatus = 'idle' | 'searching' | 'found' | 'not_found';
type Coords = { lat: number; lng: number };

async function nominatim(query: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'KitAmorim/1.0', 'Accept-Language': 'pt-BR,pt;q=0.9' },
  });
  const data = await res.json();
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

function useGeocode(address: string): { coords: Coords | null; status: GeoStatus } {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');

  useEffect(() => {
    const trimmed = address.trim();
    if (trimmed.length < 8) {
      setStatus('idle');
      setCoords(null);
      return;
    }
    setStatus('searching');
    const timer = setTimeout(async () => {
      try {
        // Tentativa 1: endereço completo com dica de país
        let result = await nominatim(trimmed + ', Brasil');

        // Tentativa 2: apenas cidade + UF (extrai do padrão "..., Cidade, UF")
        if (!result) {
          const match = trimmed.match(/,\s*([^,]+?),\s*([A-Z]{2})\s*$/);
          if (match) result = await nominatim(`${match[1]}, ${match[2]}, Brasil`);
        }

        if (result) {
          setCoords(result);
          setStatus('found');
        } else {
          setCoords(null);
          setStatus('not_found');
        }
      } catch {
        setCoords(null);
        setStatus('not_found');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [address]);

  return { coords, status };
}

// ---------- Componente de mapa (preview) ----------

function MapPreview({
  address,
  initialCoords,
  onCoords,
}: {
  address: string;
  initialCoords?: Coords | null;
  onCoords?: (c: Coords | null) => void;
}) {
  const { coords, status } = useGeocode(address);

  // Se o Nominatim não encontrar, cai de volta nas coords do CEP (initialCoords)
  const fallback = status === 'not_found' && !!initialCoords;
  const active = status === 'found' ? coords : (status === 'idle' || fallback) ? initialCoords : null;
  const showMap = !!active;

  useEffect(() => {
    if (status !== 'idle' && onCoords) onCoords(coords);
  }, [coords, status]);

  if (status === 'idle' && !initialCoords) return null;

  return (
    <View style={styles.mapWrap}>
      {status === 'searching' && (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.mapStatusText}>Localizando endereço…</Text>
        </View>
      )}
      {status === 'not_found' && !initialCoords && (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.mapStatusText}>Endereço não encontrado — verifique o CEP</Text>
        </View>
      )}
      {showMap && active && (
        <>
          <MapView
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            region={{ latitude: active.lat, longitude: active.lng, latitudeDelta: 0.008, longitudeDelta: 0.008 }}>
            <Marker coordinate={{ latitude: active.lat, longitude: active.lng }} />
          </MapView>
          {fallback && (
            <View style={styles.mapFallbackBadge}>
              <Ionicons name="information-circle-outline" size={13} color={colors.warning} />
              <Text style={styles.mapFallbackText}>Localização aproximada pelo CEP</Text>
            </View>
          )}
          <Text style={styles.mapAttrib}>© OpenStreetMap contributors</Text>
        </>
      )}
    </View>
  );
}

// ---------- Card ----------

function KitnetCard({ kitnet, onDetail }: { kitnet: KitnetApi; onDetail: () => void }) {
  const lastTap = useRef(0);

  function handlePress() {
    const now = Date.now();
    if (now - lastTap.current < 350) { lastTap.current = 0; onDetail(); }
    else lastTap.current = now;
  }

  const thumb = kitnet.photos[0];

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={styles.card}>
      <View style={styles.cardThumb}>
        {thumb ? (
          <Image source={{ uri: getPhotoUrl(thumb) }} style={styles.cardThumbImg} contentFit="cover" />
        ) : (
          <View style={styles.cardThumbPlaceholder}>
            <Ionicons name="business" size={26} color={colors.accent} />
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Kitnet {kitnet.number}</Text>
          <Badge label={formatCurrency(kitnet.monthlyRent)} tone="success" />
        </View>
        <Text style={styles.cardAddress} numberOfLines={2}>{kitnet.address}</Text>
        <View style={styles.cardFoot}>
          <Ionicons name="camera-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.cardFootText}>{kitnet.photos.length} foto{kitnet.photos.length !== 1 ? 's' : ''}</Text>
          {kitnet.latitude ? <><Text style={styles.cardHint}> · </Text><Ionicons name="location-outline" size={12} color={colors.textSecondary} /><Text style={styles.cardHint}>mapa</Text></> : null}
          <Text style={styles.cardHint}> · toque duplo para detalhes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Detail Modal ----------

function DetailModal({
  kitnet, onClose, onEdit, onDelete,
}: {
  kitnet: KitnetApi | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  useEffect(() => { if (!kitnet) { setConfirmDelete(false); setDeleteErr(null); } }, [kitnet]);

  async function handleDelete() {
    setDeleting(true); setDeleteErr(null);
    try { await onDelete(); }
    catch (e) { setDeleteErr(e instanceof Error ? e.message : 'Erro ao excluir'); setDeleting(false); }
  }

  return (
    <Modal visible={!!kitnet} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.detailRoot}>
        <Pressable style={styles.detailOverlay} onPress={onClose} />
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />
          {kitnet && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>
              {kitnet.photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
                  {kitnet.photos.map((ph, i) => (
                    <Image key={i} source={{ uri: getPhotoUrl(ph) }} style={styles.detailPhoto} contentFit="cover" />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.detailNoPhoto}>
                  <Ionicons name="business-outline" size={40} color={colors.textSecondary} />
                  <Text style={styles.detailNoPhotoText}>Sem fotos cadastradas</Text>
                </View>
              )}

              <View style={styles.detailInfo}>
                <View style={styles.detailTitleRow}>
                  <Text style={styles.detailTitle}>Kitnet {kitnet.number}</Text>
                  <Badge label={`${formatCurrency(kitnet.monthlyRent)}/mês`} tone="success" />
                </View>
                <View style={styles.detailAddressRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.detailAddress}>{kitnet.address}</Text>
                </View>
              </View>

              {kitnet.latitude && kitnet.longitude ? (
                <View style={styles.detailMapWrap}>
                  <MapView
                    style={styles.detailMap}
                    scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
                    region={{ latitude: kitnet.latitude, longitude: kitnet.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }}>
                    <Marker coordinate={{ latitude: kitnet.latitude, longitude: kitnet.longitude }} />
                  </MapView>
                  <Text style={styles.mapAttrib}>© OpenStreetMap contributors</Text>
                </View>
              ) : null}

              {deleteErr ? (
                <View style={styles.errBanner}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                  <Text style={styles.errText}>{deleteErr}</Text>
                </View>
              ) : null}

              {confirmDelete ? (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmText}>
                    Tem certeza que deseja excluir{'\n'}
                    <Text style={{ fontWeight: '700', color: colors.text }}>Kitnet {kitnet.number}</Text>?
                  </Text>
                  <View style={styles.confirmRow}>
                    <Button label="Cancelar" variant="ghost" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
                    <Button label={deleting ? 'Excluindo...' : 'Sim, excluir'} variant="danger" icon="trash-outline" disabled={deleting} onPress={handleDelete} style={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <View style={styles.detailActions}>
                  <Button label="Editar" variant="ghost" icon="pencil-outline" onPress={onEdit} style={{ flex: 1 }} />
                  <Button label="Excluir" variant="danger" icon="trash-outline" onPress={() => setConfirmDelete(true)} style={{ flex: 1 }} />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------- Tela principal ----------

export default function KitnetsScreen() {
  const { token } = useAuth();

  const [kitnets, setKitnets] = useState<KitnetApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KitnetApi | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Campos de identificação
  const [unitNumber, setUnitNumber] = useState('');
  const [rent, setRent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // Campos de endereço
  const [cep, setCep] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepErr, setCepErr] = useState<string | null>(null);
  const [street, setStreet] = useState('');
  const [streetNum, setStreetNum] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Coordenadas (vem do geocoding ou da BrasilAPI)
  const [formCoords, setFormCoords] = useState<Coords | null>(null);

  const [detail, setDetail] = useState<KitnetApi | null>(null);

  // Endereço para exibição e backend (com bairro e UF no estilo "Cidade - MT")
  const fullAddress = useMemo(() => {
    const streetLine = streetNum ? `${street}, ${streetNum}` : street;
    const cityLine = cidade && estado ? `${cidade} - ${estado}` : (cidade || estado || '');
    return [streetLine, bairro, cityLine].filter(Boolean).join(', ');
  }, [street, streetNum, bairro, cidade, estado]);

  // Endereço simplificado para o geocoding: sem bairro, UF separada por vírgula
  const geocodeAddress = useMemo(() => {
    const streetLine = streetNum ? `${street}, ${streetNum}` : street;
    const cityLine = cidade && estado ? `${cidade}, ${estado}` : (cidade || estado || '');
    return [streetLine, cityLine].filter(Boolean).join(', ');
  }, [street, streetNum, cidade, estado]);

  useEffect(() => { if (token) load(); }, [token]);

  async function load() {
    setLoading(true); setFetchErr(null);
    try { setKitnets(await fetchKitnets(token!)); }
    catch (e) { setFetchErr(e instanceof Error ? e.message : 'Erro ao carregar kitnets'); }
    finally { setLoading(false); }
  }

  // Busca CEP na BrasilAPI
  async function lookupCep(digits: string) {
    setCepLoading(true); setCepErr(null);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
      if (!res.ok) { setCepErr('CEP não encontrado'); return; }
      const data = await res.json();
      setStreet(data.street ?? '');
      setBairro(data.neighborhood ?? '');
      setCidade(data.city ?? '');
      setEstado(data.state ?? '');
      // BrasilAPI retorna coords aproximadas do CEP — usa como ponto inicial
      const lat = parseFloat(data.location?.coordinates?.latitude);
      const lng = parseFloat(data.location?.coordinates?.longitude);
      if (!isNaN(lat) && !isNaN(lng)) setFormCoords({ lat, lng });
    } catch {
      setCepErr('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setCepLoading(false);
    }
  }

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    if (digits.length === 8) lookupCep(digits);
  }

  function resetForm() {
    setUnitNumber(''); setRent(''); setPhotos([]);
    setCep(''); setCepErr(null);
    setStreet(''); setStreetNum(''); setBairro(''); setCidade(''); setEstado('');
    setFormCoords(null); setFormErr(null);
  }

  function openCreate() {
    setEditTarget(null); resetForm(); setFormOpen(true);
  }

  function openEdit(kitnet: KitnetApi) {
    setDetail(null); setEditTarget(kitnet);
    setUnitNumber(kitnet.number);
    setRent(kitnet.monthlyRent.toFixed(2).replace('.', ','));
    setPhotos(kitnet.photos);
    // Endereço existente vai para `street` para exibição e edição
    setCep(''); setCepErr(null);
    setStreet(kitnet.address); setStreetNum(''); setBairro(''); setCidade(''); setEstado('');
    setFormCoords(kitnet.latitude && kitnet.longitude ? { lat: kitnet.latitude, lng: kitnet.longitude } : null);
    setFormErr(null);
    setFormOpen(true);
  }

  function closeForm() { setFormOpen(false); setEditTarget(null); resetForm(); }

  async function handleSubmit() {
    const monthlyRent = parseFloat(rent.replace(',', '.'));
    if (!unitNumber.trim() || !street.trim() || isNaN(monthlyRent) || !token) return;
    setSubmitting(true); setFormErr(null);
    try {
      const payload = {
        number: unitNumber.trim(),
        address: fullAddress || street.trim(),
        monthlyRent,
        ...(formCoords ? { latitude: formCoords.lat, longitude: formCoords.lng } : {}),
      };
      if (editTarget) {
        const hasNewPhotos = photos.some((ph) => !ph.startsWith('http'));
        const updated = await updateKitnet(editTarget.id, { ...payload, ...(hasNewPhotos ? { photos } : {}) }, token);
        setKitnets((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
      } else {
        const created = await createKitnet({ ...payload, photos }, token);
        setKitnets((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!detail || !token) throw new Error('Sem permissão');
    await deleteKitnet(detail.id, token);
    setKitnets((prev) => prev.filter((k) => k.id !== detail.id));
    setDetail(null);
  }

  const canSubmit = unitNumber.trim() !== '' && street.trim() !== '' && rent.trim() !== '' && !submitting;
  const editInitialCoords = editTarget?.latitude && editTarget?.longitude
    ? { lat: editTarget.latitude, lng: editTarget.longitude } : null;

  if (loading) {
    return (
      <Screen title="Kitnets">
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      </Screen>
    );
  }

  return (
    <Screen title="Kitnets" footer={<Fab label="Nova kitnet" onPress={openCreate} />}>
      {fetchErr ? (
        <View style={styles.errBanner}>
          <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
          <Text style={[styles.errText, { flex: 1 }]}>{fetchErr}</Text>
          <TouchableOpacity onPress={load}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity>
        </View>
      ) : null}

      {kitnets.length === 0 && !fetchErr
        ? <EmptyState icon="business-outline" text="Nenhuma kitnet cadastrada ainda." />
        : kitnets.map((k) => <KitnetCard key={k.id} kitnet={k} onDetail={() => setDetail(k)} />)
      }

      {/* Modal criar / editar */}
      <FormModal
        visible={formOpen}
        title={editTarget ? `Editar Kitnet ${editTarget.number}` : 'Nova kitnet'}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Salvando...' : editTarget ? 'Salvar alterações' : 'Cadastrar'}
        submitDisabled={!canSubmit}>

        {/* Identificação */}
        <Field label="N° da Kitnet">
          <Input value={unitNumber} onChangeText={setUnitNumber} placeholder="Ex.: 101" />
        </Field>

        {/* CEP */}
        <Field label="CEP">
          <View style={styles.cepRow}>
            <TextInput
              style={styles.cepInput}
              placeholder="00000-000"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={9}
              value={cep}
              onChangeText={handleCepChange}
            />
            {cepLoading ? <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: spacing.sm }} /> : null}
          </View>
          {cepErr ? <Text style={styles.fieldErr}>{cepErr}</Text> : null}
        </Field>

        {/* Rua + Número */}
        <View style={styles.fieldRow}>
          <View style={{ flex: 3 }}>
            <Field label="Rua / Avenida">
              <Input value={street} onChangeText={setStreet} placeholder="Av. Paulista" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Nº">
              <Input value={streetNum} onChangeText={setStreetNum} placeholder="100" keyboardType="number-pad" />
            </Field>
          </View>
        </View>

        {/* Bairro */}
        <Field label="Bairro">
          <Input value={bairro} onChangeText={setBairro} placeholder="Bela Vista" />
        </Field>

        {/* Cidade + Estado */}
        <View style={styles.fieldRow}>
          <View style={{ flex: 2 }}>
            <Field label="Cidade">
              <Input value={cidade} onChangeText={setCidade} placeholder="São Paulo" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Estado">
              <Select value={estado} options={ESTADOS} onChange={setEstado} placeholder="UF" />
            </Field>
          </View>
        </View>

        {/* Mapa */}
        <MapPreview
          address={geocodeAddress}
          initialCoords={editInitialCoords}
          onCoords={(c) => { if (c) setFormCoords(c); }}
        />

        {/* Valor */}
        <Field label="Valor mensal">
          <CurrencyInput value={rent} onChangeText={setRent} />
        </Field>

        {/* Fotos */}
        <Field label="Fotos">
          <PhotosField value={photos} onChange={setPhotos} />
        </Field>

        {formErr ? (
          <View style={styles.errBanner}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errText}>{formErr}</Text>
          </View>
        ) : null}
      </FormModal>

      {/* Modal detalhes */}
      <DetailModal
        kitnet={detail}
        onClose={() => setDetail(null)}
        onEdit={() => detail && openEdit(detail)}
        onDelete={handleDelete}
      />
    </Screen>
  );
}

// ---------- Estilos ----------

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardThumb: { width: 90, height: 90 },
  cardThumbImg: { width: '100%', height: '100%' },
  cardThumbPlaceholder: { width: '100%', height: '100%', backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: spacing.md, gap: 4, justifyContent: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  cardAddress: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardFootText: { color: colors.textSecondary, fontSize: 12 },
  cardHint: { color: colors.border, fontSize: 11 },

  // Linha de campos lado a lado
  fieldRow: { flexDirection: 'row', gap: spacing.md },

  // CEP
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  cepInput: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: spacing.md, letterSpacing: 2 },
  fieldErr: { color: colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },

  // Mapa no formulário
  mapWrap: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, minHeight: 160 },
  map: { height: 160, width: '100%' },
  mapPlaceholder: { height: 160, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.inputBackground },
  mapStatusText: { color: colors.textSecondary, fontSize: 13 },
  mapAttrib: { backgroundColor: 'rgba(0,0,0,0.45)', color: '#ccc', fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-end' },
  mapFallbackBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  mapFallbackText: { color: colors.warning, fontSize: 11 },

  // Detail modal
  detailRoot: { flex: 1, justifyContent: 'flex-end' },
  detailOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  detailSheet: { backgroundColor: colors.backgroundAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxl + 16, maxHeight: '88%' },
  detailHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.lg },
  photoScroll: { gap: spacing.sm, paddingVertical: 2 },
  detailPhoto: { width: 200, height: 140, borderRadius: radius.md },
  detailNoPhoto: { height: 100, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  detailNoPhotoText: { color: colors.textSecondary, fontSize: 13 },
  detailInfo: { gap: spacing.sm },
  detailTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  detailTitle: { color: colors.text, fontSize: 22, fontWeight: '800', flexShrink: 1 },
  detailAddressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  detailAddress: { color: colors.textSecondary, fontSize: 14, flex: 1, lineHeight: 20 },
  detailMapWrap: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  detailMap: { height: 180, width: '100%' },
  detailActions: { flexDirection: 'row', gap: spacing.md },
  confirmBox: { gap: spacing.md, backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: `${colors.danger}33` },
  confirmText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', gap: spacing.md },
  errBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: `${colors.danger}33` },
  errText: { color: colors.danger, fontSize: 13 },
  retryText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
