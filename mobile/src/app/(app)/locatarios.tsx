import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Badge,
  Button,
  CurrencyInput,
  Divider,
  EmptyState,
  Fab,
  Field,
  FormModal,
  Input,
  KeyValue,
  PhotoField,
  Select,
} from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useAuth } from '@/data/auth-context';
import { fetchKitnets, getPhotoUrl, type KitnetApi } from '@/services/kitnets.service';
import {
  createTenant,
  deleteTenant,
  fetchTenants,
  getTenantPhotoUrl,
  updateTenant,
  type TenantApi,
} from '@/services/tenants.service';
import { colors, radius, spacing } from '@/theme';
import { addMonths, formatCurrency, formatDate, formatCpf, parseDateBR } from '@/utils';

// ---------- Helpers ----------

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function isoToBR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function tenantEndDate(startISO: string, months: number): Date {
  return addMonths(new Date(`${startISO}T00:00:00`), months);
}

// ---------- Card ----------

function TenantCard({ tenant, onDetail }: { tenant: TenantApi; onDetail: () => void }) {
  const lastTap = useRef(0);

  function handlePress() {
    const now = Date.now();
    if (now - lastTap.current < 350) { lastTap.current = 0; onDetail(); }
    else lastTap.current = now;
  }

  return (
    <TouchableOpacity activeOpacity={0.75} onPress={handlePress} style={styles.card}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{initials(tenant.fullName)}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{tenant.fullName}</Text>
          <Badge label={`Kitnet ${tenant.kitnet.number}`} />
        </View>
        <Text style={styles.cardSub} numberOfLines={1}>{tenant.email}</Text>
        <View style={styles.cardFoot}>
          <Ionicons name="cash-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.cardFootText}>{formatCurrency(tenant.rentalValue)}/mês</Text>
          <Text style={styles.cardSep}>·</Text>
          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.cardFootText}>Dia {tenant.paymentDay}</Text>
          <Text style={styles.cardSep}>·</Text>
          <Text style={styles.cardHint}>toque duplo para detalhes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------- Detail Modal ----------

function DetailModal({
  tenant, onClose, onEdit, onDelete,
}: {
  tenant: TenantApi | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) { setConfirmDelete(false); setDeleteErr(null); }
  }, [tenant]);

  async function handleDelete() {
    setDeleting(true); setDeleteErr(null);
    try { await onDelete(); }
    catch (e) { setDeleteErr(e instanceof Error ? e.message : 'Erro ao excluir'); setDeleting(false); }
  }

  return (
    <Modal visible={!!tenant} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.detailRoot}>
        <Pressable style={styles.detailOverlay} onPress={onClose} />
        <View style={styles.detailSheet}>
          <View style={styles.detailHandle} />

          {tenant && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>

              {/* Cabeçalho */}
              <View style={styles.detailHeader}>
                <View style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{initials(tenant.fullName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName}>{tenant.fullName}</Text>
                  <Text style={styles.detailEmail}>{tenant.email}</Text>
                </View>
              </View>

              {/* Kitnet */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Kitnet vinculada</Text>
                <View style={styles.detailKitnetRow}>
                  <View style={styles.detailKitnetIcon}>
                    <Ionicons name="business" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailKitnetName}>Kitnet {tenant.kitnet.number}</Text>
                    <Text style={styles.detailKitnetAddr} numberOfLines={2}>{tenant.kitnet.address}</Text>
                  </View>
                  <Badge label={formatCurrency(tenant.kitnet.monthlyRent)} tone="success" />
                </View>
              </View>

              <Divider />

              {/* Dados pessoais */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Dados pessoais</Text>
                <KeyValue label="CPF" value={tenant.cpf} />
                <KeyValue label="RG" value={tenant.rg} />
              </View>

              <Divider />

              {/* Locação */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Locação</Text>
                <KeyValue label="Valor mensal" value={formatCurrency(tenant.rentalValue)} />
                <KeyValue label="Início" value={isoToBR(tenant.rentalStartDate)} />
                <KeyValue
                  label="Fim previsto"
                  value={`${formatDate(tenantEndDate(tenant.rentalStartDate, tenant.rentalPeriod))} (${tenant.rentalPeriod} meses)`}
                />
                <KeyValue label="Vencimento" value={`Todo dia ${tenant.paymentDay}`} />
              </View>

              {/* Documentos */}
              {(tenant.documentFront || tenant.documentBack) && (
                <>
                  <Divider />
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Documentos</Text>
                    <View style={styles.docRow}>
                      {tenant.documentFront ? (
                        <View style={styles.docItem}>
                          <Image source={{ uri: getTenantPhotoUrl(tenant.documentFront) }} style={styles.docImg} contentFit="cover" />
                          <Text style={styles.docLabel}>Frente</Text>
                        </View>
                      ) : null}
                      {tenant.documentBack ? (
                        <View style={styles.docItem}>
                          <Image source={{ uri: getTenantPhotoUrl(tenant.documentBack) }} style={styles.docImg} contentFit="cover" />
                          <Text style={styles.docLabel}>Verso</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </>
              )}

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
                    <Text style={{ fontWeight: '700', color: colors.text }}>{tenant.fullName}</Text>?
                  </Text>
                  <View style={styles.confirmRow}>
                    <Button label="Cancelar" variant="ghost" onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} />
                    <Button
                      label={deleting ? 'Excluindo...' : 'Sim, excluir'}
                      variant="danger"
                      icon="trash-outline"
                      disabled={deleting}
                      onPress={handleDelete}
                      style={{ flex: 1 }}
                    />
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

export default function LocatariosScreen() {
  const { token } = useAuth();

  const [tenants, setTenants] = useState<TenantApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantApi | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Kitnets para o select
  const [kitnets, setKitnets] = useState<KitnetApi[]>([]);
  const [kitnetsLoading, setKitnetsLoading] = useState(false);

  // Campos do formulário
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [rg, setRg] = useState('');
  const [kitnetId, setKitnetId] = useState<string | null>(null);
  const [docFront, setDocFront] = useState<string | undefined>();
  const [docBack, setDocBack] = useState<string | undefined>();
  const [startDate, setStartDate] = useState('');    // dd/mm/aaaa
  const [periodMonths, setPeriodMonths] = useState('');
  const [rentalValue, setRentalValue] = useState('');
  const [paymentDay, setPaymentDay] = useState('');

  const [detail, setDetail] = useState<TenantApi | null>(null);

  // Data de fim calculada
  const startDateObj = parseDateBR(startDate);
  const months = Number(periodMonths) || 0;
  const endDateObj = startDateObj && months > 0 ? addMonths(startDateObj, months) : null;

  useEffect(() => { if (token) load(); }, [token]);

  async function load() {
    setLoading(true); setFetchErr(null);
    try { setTenants(await fetchTenants(token!)); }
    catch (e) { setFetchErr(e instanceof Error ? e.message : 'Erro ao carregar locatários'); }
    finally { setLoading(false); }
  }

  async function loadKitnets() {
    if (kitnets.length > 0 || !token) return;
    setKitnetsLoading(true);
    try { setKitnets(await fetchKitnets(token)); }
    catch {}
    finally { setKitnetsLoading(false); }
  }

  function resetForm() {
    setFullName(''); setCpf(''); setEmail(''); setRg('');
    setKitnetId(null); setDocFront(undefined); setDocBack(undefined);
    setStartDate(''); setPeriodMonths(''); setRentalValue(''); setPaymentDay('');
    setFormErr(null);
  }

  async function openCreate() {
    setEditTarget(null); resetForm(); setFormOpen(true);
    await loadKitnets();
  }

  async function openEdit(tenant: TenantApi) {
    setDetail(null); setEditTarget(tenant);
    setFullName(tenant.fullName);
    setCpf(tenant.cpf);
    setEmail(tenant.email);
    setRg(tenant.rg);
    setKitnetId(tenant.kitnet.id);
    setDocFront(undefined); setDocBack(undefined);
    setStartDate(isoToBR(tenant.rentalStartDate));
    setPeriodMonths(String(tenant.rentalPeriod));
    setRentalValue(tenant.rentalValue.toFixed(2).replace('.', ','));
    setPaymentDay(String(tenant.paymentDay));
    setFormErr(null);
    setFormOpen(true);
    await loadKitnets();
  }

  function closeForm() { setFormOpen(false); setEditTarget(null); resetForm(); }

  async function handleSubmit() {
    if (!startDateObj || !kitnetId || !token) return;
    const rentalValueNum = parseFloat(rentalValue.replace(',', '.'));
    const periodNum = parseInt(periodMonths);
    const paymentDayNum = parseInt(paymentDay);
    if (isNaN(rentalValueNum) || isNaN(periodNum) || isNaN(paymentDayNum)) return;

    const rentalStartDate = startDateObj.toISOString().split('T')[0];

    setSubmitting(true); setFormErr(null);
    try {
      const payload = {
        fullName: fullName.trim(),
        cpf: cpf.trim(),
        email: email.trim(),
        rg: rg.trim(),
        kitnetId,
        rentalStartDate,
        rentalPeriod: periodNum,
        rentalValue: rentalValueNum,
        paymentDay: paymentDayNum,
        ...(docFront ? { documentFront: docFront } : {}),
        ...(docBack ? { documentBack: docBack } : {}),
      };

      if (editTarget) {
        const updated = await updateTenant(editTarget.id, payload, token);
        setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTenant(payload, token);
        setTenants((prev) => [created, ...prev]);
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
    await deleteTenant(detail.id, token);
    setTenants((prev) => prev.filter((t) => t.id !== detail.id));
    setDetail(null);
  }

  // Kitnets disponíveis: sem locatário ativo, exceto a atual (no edit)
  const occupiedKitnetIds = new Set(tenants.map((t) => t.kitnet.id));
  const availableKitnets = kitnets.filter(
    (k) => !occupiedKitnetIds.has(k.id) || k.id === editTarget?.kitnet.id,
  );

  const canSubmit =
    fullName.trim() !== '' &&
    cpf.trim() !== '' &&
    kitnetId !== null &&
    !!startDateObj &&
    periodMonths !== '' &&
    rentalValue !== '' &&
    paymentDay !== '' &&
    !submitting;

  if (loading) {
    return (
      <Screen title="Locatários">
        <View style={styles.center}><ActivityIndicator color={colors.accent} size="large" /></View>
      </Screen>
    );
  }

  return (
    <Screen title="Locatários" footer={<Fab label="Novo locatário" onPress={openCreate} />}>
      {fetchErr ? (
        <View style={styles.errBanner}>
          <Ionicons name="alert-circle-outline" size={15} color={colors.danger} />
          <Text style={[styles.errText, { flex: 1 }]}>{fetchErr}</Text>
          <TouchableOpacity onPress={load}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity>
        </View>
      ) : null}

      {tenants.length === 0 && !fetchErr
        ? <EmptyState icon="people-outline" text="Nenhum locatário cadastrado ainda." />
        : tenants.map((t) => <TenantCard key={t.id} tenant={t} onDetail={() => setDetail(t)} />)
      }

      {/* Modal criar / editar */}
      <FormModal
        visible={formOpen}
        title={editTarget ? `Editar ${editTarget.fullName.split(' ')[0]}` : 'Novo locatário'}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitLabel={submitting ? 'Salvando...' : editTarget ? 'Salvar alterações' : 'Cadastrar'}
        submitDisabled={!canSubmit}>

        <Field label="Nome completo">
          <Input value={fullName} onChangeText={setFullName} placeholder="Nome e sobrenome" autoCapitalize="words" />
        </Field>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="CPF">
              <Input
                value={cpf}
                onChangeText={(v) => setCpf(formatCpf(v))}
                placeholder="000.000.000-00"
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="RG">
              <Input value={rg} onChangeText={setRg} placeholder="00.000.000-0" />
            </Field>
          </View>
        </View>

        <Field label="E-mail">
          <Input value={email} onChangeText={setEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
        </Field>

        <Field label="Kitnet vinculada">
          {kitnetsLoading ? (
            <View style={styles.selectLoading}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.selectLoadingText}>Carregando kitnets…</Text>
            </View>
          ) : (
            <Select
              value={kitnetId}
              onChange={(id) => {
                setKitnetId(id);
                const k = availableKitnets.find((x) => x.id === id);
                if (k && !rentalValue) setRentalValue(k.monthlyRent.toFixed(2).replace('.', ','));
              }}
              options={availableKitnets.map((k) => ({
                label: `Kitnet ${k.number} — ${k.address}`,
                value: k.id,
              }))}
              placeholder="Selecione a kitnet"
            />
          )}
        </Field>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="Início da locação">
              <Input
                value={startDate}
                onChangeText={(v) => setStartDate(formatDateInput(v))}
                placeholder="dd/mm/aaaa"
                keyboardType="number-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Período (meses)">
              <Input value={periodMonths} onChangeText={setPeriodMonths} placeholder="12" keyboardType="number-pad" />
            </Field>
          </View>
        </View>

        {endDateObj ? (
          <View style={styles.endDateBadge}>
            <Ionicons name="calendar-outline" size={14} color={colors.accent} />
            <Text style={styles.endDateText}>
              Fim previsto: <Text style={{ fontWeight: '700' }}>{formatDate(endDateObj)}</Text>
            </Text>
          </View>
        ) : null}

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="Valor mensal">
              <CurrencyInput value={rentalValue} onChangeText={setRentalValue} />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Dia do pagamento">
              <Input value={paymentDay} onChangeText={setPaymentDay} placeholder="5" keyboardType="number-pad" />
            </Field>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="Documento — frente">
              <PhotoField value={docFront} onChange={setDocFront} placeholder="Foto da frente" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Documento — verso">
              <PhotoField value={docBack} onChange={setDocBack} placeholder="Foto do verso" />
            </Field>
          </View>
        </View>

        {formErr ? (
          <View style={styles.errBanner}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.errText}>{formErr}</Text>
          </View>
        ) : null}
      </FormModal>

      {/* Modal detalhes */}
      <DetailModal
        tenant={detail}
        onClose={() => setDetail(null)}
        onEdit={() => detail && openEdit(detail)}
        onDelete={handleDelete}
      />
    </Screen>
  );
}

// ---------- Estilos ----------

const AVATAR_BG = 'rgba(91, 169, 248, 0.18)';

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AVATAR_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91,169,248,0.3)',
    flexShrink: 0,
  },
  cardAvatarText: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  cardBody: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  cardName: { color: colors.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  cardSub: { color: colors.textSecondary, fontSize: 13 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' },
  cardFootText: { color: colors.textSecondary, fontSize: 12 },
  cardSep: { color: colors.border, fontSize: 12 },
  cardHint: { color: colors.border, fontSize: 11 },

  fieldRow: { flexDirection: 'row', gap: spacing.md },

  selectLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  selectLoadingText: { color: colors.textSecondary, fontSize: 14 },

  endDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(91,169,248,0.2)',
  },
  endDateText: { color: colors.textSecondary, fontSize: 13 },

  detailRoot: { flex: 1, justifyContent: 'flex-end' },
  detailOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  detailSheet: {
    backgroundColor: colors.backgroundAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 16,
    maxHeight: '90%',
  },
  detailHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.lg },

  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  detailAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: AVATAR_BG, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(91,169,248,0.3)', flexShrink: 0 },
  detailAvatarText: { color: colors.accent, fontSize: 22, fontWeight: '700' },
  detailName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  detailEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },

  detailSection: { gap: spacing.sm },
  detailSectionTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },

  detailKitnetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  detailKitnetIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  detailKitnetName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  detailKitnetAddr: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

  docRow: { flexDirection: 'row', gap: spacing.md },
  docItem: { flex: 1, gap: spacing.xs },
  docImg: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md },
  docLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },

  detailActions: { flexDirection: 'row', gap: spacing.md },

  confirmBox: { gap: spacing.md, backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.lg, borderWidth: 1, borderColor: `${colors.danger}33` },
  confirmText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', gap: spacing.md },

  errBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: `${colors.danger}33` },
  errText: { color: colors.danger, fontSize: 13 },
  retryText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
