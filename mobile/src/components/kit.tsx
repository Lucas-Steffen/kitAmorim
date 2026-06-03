import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { formatCurrency } from '@/utils';

type IoniconName = keyof typeof Ionicons.glyphMap;

// ---------- Texto / títulos ----------

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

// ---------- Card ----------

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: IoniconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} activeOpacity={0.7} onPress={onPress}>
      {icon ? (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={20} color={colors.accent} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </Wrapper>
  );
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

// ---------- Badge ----------

type Tone = 'accent' | 'success' | 'warning' | 'danger';

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  accent: { bg: colors.accentSoft, fg: colors.accent },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Badge({ label, tone = 'accent' }: { label: string; tone?: Tone }) {
  const t = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

// ---------- StatCard ----------

export function StatCard({
  icon,
  label,
  value,
  tone = 'accent',
}: {
  icon: IoniconName;
  label: string;
  value: string;
  tone?: Tone;
}) {
  const t = toneMap[tone];
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={20} color={t.fg} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ---------- EmptyState ----------

export function EmptyState({ icon, text }: { icon: IoniconName; text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.textSecondary} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ---------- Button ----------

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: IoniconName;
  disabled?: boolean;
  style?: object;
}) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        variant === 'ghost' && styles.btnGhost,
        isDanger && styles.btnDanger,
        disabled && styles.btnDisabled,
        style,
      ]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? colors.onAccent : isDanger ? colors.danger : colors.text}
        />
      ) : null}
      <Text
        style={[
          styles.btnText,
          isPrimary ? { color: colors.onAccent } : isDanger ? { color: colors.danger } : { color: colors.text },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Fab({ onPress, label = 'Adicionar' }: { onPress: () => void; label?: string }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={22} color={colors.onAccent} />
      <Text style={styles.fabText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------- Campos de formulário ----------

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  prefix,
  multiline,
  autoCapitalize,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline]}>
      {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

export type Option = { label: string; value: string; shortLabel?: string };

export function Select({
  value,
  options,
  onChange,
  placeholder = 'Selecione…',
}: {
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <TouchableOpacity activeOpacity={0.7} style={styles.inputWrap} onPress={() => setOpen(true)}>
        <Text style={[styles.input, !selected && { color: colors.placeholder }]} numberOfLines={1}>
          {selected ? (selected.shortLabel ?? selected.label) : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.selectSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.selectTitle}>Selecione</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {options.length === 0 ? (
                <Text style={styles.selectEmpty}>Nenhuma opção disponível</Text>
              ) : (
                options.map((o) => (
                  <TouchableOpacity
                    key={o.value}
                    style={styles.selectOption}
                    onPress={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}>
                    <Text style={styles.selectOptionText}>{o.label}</Text>
                    {o.value === value ? (
                      <Ionicons name="checkmark" size={18} color={colors.accent} />
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

async function pickFromGallery(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

async function capturePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

function showPhotoPicker(): Promise<string | null> {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancelar', 'Tirar foto', 'Escolher da galeria'], cancelButtonIndex: 0 },
        async (i) => {
          if (i === 1) resolve(await capturePhoto());
          else if (i === 2) resolve(await pickFromGallery());
          else resolve(null);
        },
      );
    } else {
      Alert.alert('Selecionar foto', '', [
        { text: 'Tirar foto', onPress: async () => resolve(await capturePhoto()) },
        { text: 'Escolher da galeria', onPress: async () => resolve(await pickFromGallery()) },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
      ]);
    }
  });
}

export function PhotoField({
  value,
  onChange,
  placeholder = 'Selecionar foto',
}: {
  value?: string;
  onChange: (uri: string) => void;
  placeholder?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.photoBox}
      onPress={async () => {
        const uri = await showPhotoPicker();
        if (uri) onChange(uri);
      }}>
      {value ? (
        <Image source={{ uri: value }} style={styles.photoThumb} contentFit="cover" />
      ) : (
        <>
          <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.photoText}>{placeholder}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function PhotosField({ value, onChange }: { value: string[]; onChange: (uris: string[]) => void }) {
  return (
    <View style={styles.photosRow}>
      {value.map((uri) => (
        <Image key={uri} source={{ uri }} style={styles.photoThumbSmall} contentFit="cover" />
      ))}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.photoAdd}
        onPress={async () => {
          const uri = await showPhotoPicker();
          if (uri) onChange([...value, uri]);
        }}>
        <Ionicons name="add" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

// ---------- CurrencyInput ----------

const NUMPAD_KEYS: (string | null)[] = ['1','2','3','4','5','6','7','8','9', null,'0','back'];

export function CurrencyInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [cents, setCents] = useState(0);

  useEffect(() => {
    const digits = value.replace(/\D/g, '');
    setCents(parseInt(digits || '0'));
  }, [value]);

  function press(d: string) {
    setCents((prev) => {
      const next = prev * 10 + parseInt(d);
      return next > 9_999_999_99 ? prev : next;
    });
  }

  function backspace() {
    setCents((prev) => Math.floor(prev / 10));
  }

  function confirm() {
    onChangeText((cents / 100).toFixed(2).replace('.', ','));
    setOpen(false);
  }

  const display = formatCurrency(cents / 100);

  return (
    <>
      <TouchableOpacity activeOpacity={0.7} style={styles.inputWrap} onPress={() => setOpen(true)}>
        <Text style={[styles.input, cents === 0 && { color: colors.placeholder }]}>
          {display}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" statusBarTranslucent onRequestClose={confirm}>
        <View style={styles.numpadRoot}>
          <Pressable style={styles.numpadOverlay} onPress={confirm} />
          <View style={styles.numpadSheet}>
            <View style={styles.numpadHandle} />
            <Text style={styles.numpadDisplay}>{display}</Text>
            <View style={styles.numpadGrid}>
              {NUMPAD_KEYS.map((k, i) =>
                k === null ? (
                  <View key={i} style={styles.numpadCell} />
                ) : k === 'back' ? (
                  <TouchableOpacity key={i} style={styles.numpadCell} activeOpacity={0.4} onPress={backspace}>
                    <Ionicons name="backspace-outline" size={26} color={colors.text} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={i} style={styles.numpadCell} activeOpacity={0.4} onPress={() => press(k)}>
                    <Text style={styles.numpadDigit}>{k}</Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            <TouchableOpacity style={styles.numpadOkBtn} activeOpacity={0.85} onPress={confirm}>
              <Text style={styles.numpadOkText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ---------- FormModal ----------

export function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel = 'Salvar',
  submitDisabled,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity hitSlop={8} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.sm }}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.modalActions}>
            <Button label="Cancelar" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
            <Button
              label={submitLabel}
              onPress={onSubmit}
              disabled={submitDisabled}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sectionTitleWrap: { gap: 2, marginBottom: spacing.xs },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  sectionHint: { color: colors.textSecondary, fontSize: 13 },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowSubtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },

  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: 5 },
  kvLabel: { color: colors.textSecondary, fontSize: 14 },
  kvValue: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },

  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  statIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: 13 },

  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnDanger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 15, fontWeight: '700' },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    height: 52,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: colors.onAccent, fontWeight: '700', fontSize: 15 },

  field: { gap: spacing.sm },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginLeft: spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  inputWrapMultiline: { alignItems: 'flex-start', paddingVertical: spacing.md },
  inputPrefix: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: spacing.md },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },

  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', paddingHorizontal: spacing.xl },
  selectSheet: { backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  selectTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  selectEmpty: { color: colors.textSecondary, paddingVertical: spacing.md },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectOptionText: { color: colors.text, fontSize: 15, flex: 1 },

  photoBox: {
    height: 110,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  photoText: { color: colors.textSecondary, fontSize: 13 },
  photoThumb: { width: '100%', height: '100%' },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoThumbSmall: { width: 72, height: 72, borderRadius: radius.sm },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  modalSheet: {
    backgroundColor: colors.backgroundAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  modalHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '700', flex: 1 },
  modalActions: { flexDirection: 'row', gap: spacing.md },

  // CurrencyInput numpad
  numpadRoot: { flex: 1, justifyContent: 'flex-end' },
  numpadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  numpadSheet: {
    backgroundColor: colors.backgroundAlt,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.xxl,
  },
  numpadHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  numpadDisplay: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'right',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    letterSpacing: -0.5,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 0,
  },
  numpadCell: {
    width: '33.33%',
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  numpadDigit: { color: colors.text, fontSize: 26, fontWeight: '400' },
  numpadOkBtn: {
    backgroundColor: colors.accent,
    height: 54,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadOkText: { color: colors.onAccent, fontSize: 17, fontWeight: '700' },
});