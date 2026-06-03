import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/data/auth-context';
import { forgotPassword, resetPassword } from '@/services/auth.service';

const p = {
  background: '#0B1424',
  card: '#111D33',
  cardBorder: '#1A2D48',
  inputBg: '#0D1829',
  inputBorder: '#1A2B44',
  inputFocus: '#5BA9F8',
  accent: '#5BA9F8',
  accentSoft: 'rgba(91, 169, 248, 0.12)',
  text: '#F4F8FF',
  textSecondary: '#7A90AE',
  placeholder: '#4A5F7A',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.10)',
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
} as const;

// ---------- Tela principal ----------

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  async function handleLogin() {
    if (!canSubmit) return;
    try {
      await login(email.trim(), password);
      router.replace('/home');
    } catch {}
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.branding}>
              <View style={styles.logoRing}>
                <View style={styles.logoBadge}>
                  <Ionicons name="business" size={38} color={p.accent} />
                </View>
              </View>
              <Text style={styles.appName}>KitAmorim</Text>
              <Text style={styles.tagline}>Gestão de kitnets simplificada</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
                <Text style={styles.cardSubtitle}>Insira suas credenciais para continuar</Text>
              </View>

              <View style={styles.fields}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <View style={[styles.inputRow, focused === 'email' && styles.inputRowFocused]}>
                    <Ionicons name="mail-outline" size={18} color={focused === 'email' ? p.accent : p.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="seu@email.com"
                      placeholderTextColor={p.placeholder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Senha</Text>
                    <Pressable hitSlop={8} onPress={() => setInviteOpen(true)}>
                      <Text style={styles.linkText}>Primeiro acesso</Text>
                    </Pressable>
                  </View>
                  <View style={[styles.inputRow, focused === 'password' && styles.inputRowFocused]}>
                    <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? p.accent : p.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={p.placeholder}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      onSubmitEditing={handleLogin}
                      returnKeyType="done"
                    />
                    <Pressable hitSlop={8} onPress={() => setShowPassword((v) => !v)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={p.textSecondary} />
                    </Pressable>
                  </View>
                  <Pressable hitSlop={8} style={styles.forgotLink} onPress={() => setForgotOpen(true)}>
                    <Text style={styles.forgotText}>Esqueci minha senha</Text>
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={p.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!canSubmit}
                onPress={handleLogin}
                style={[styles.button, !canSubmit && styles.buttonDisabled]}>
                {isLoading ? (
                  <ActivityIndicator color="#06101F" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Entrar</Text>
                    <Ionicons name="arrow-forward" size={18} color="#06101F" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>KitAmorim © 2026</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <InviteModal
        visible={inviteOpen}
        code={inviteCode}
        onChangeCode={setInviteCode}
        onClose={() => { setInviteOpen(false); setInviteCode(''); }}
        onConfirm={() => { setInviteOpen(false); setInviteCode(''); }}
      />

      <ForgotPasswordModal visible={forgotOpen} onClose={() => setForgotOpen(false)} />
    </View>
  );
}

// ---------- Modal: Esqueci minha senha ----------

type ForgotStep = 'email' | 'code' | 'success';

function ForgotPasswordModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [fpEmail, setFpEmail] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [fpNewPwd, setFpNewPwd] = useState('');
  const [fpConfirmPwd, setFpConfirmPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

  function reset() {
    setStep('email');
    setLoading(false);
    setErr(null);
    setFpEmail('');
    setFpCode('');
    setFpNewPwd('');
    setFpConfirmPwd('');
    setShowNewPwd(false);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  async function handleSendCode() {
    if (!fpEmail.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      await forgotPassword(fpEmail.trim());
      setStep('code');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (fpCode.length !== 6) { setErr('O código deve ter 6 dígitos.'); return; }
    if (fpNewPwd.length < 8) { setErr('A senha deve ter no mínimo 8 caracteres.'); return; }
    if (fpNewPwd !== fpConfirmPwd) { setErr('As senhas não coincidem.'); return; }
    setLoading(true);
    setErr(null);
    try {
      await resetPassword(fpEmail.trim(), fpCode.trim(), fpNewPwd);
      setStep('success');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>

          {step === 'success' ? (
            <View style={styles.successBox}>
              <View style={[styles.modalIconBadge, styles.modalIconSuccess]}>
                <Ionicons name="checkmark-circle-outline" size={28} color={p.success} />
              </View>
              <Text style={styles.modalTitle}>Senha redefinida!</Text>
              <Text style={styles.modalSubtitle}>Sua senha foi alterada com sucesso. Faça login com a nova senha.</Text>
              <TouchableOpacity activeOpacity={0.85} style={[styles.button, { marginTop: 4 }]} onPress={handleClose}>
                <Text style={styles.buttonText}>Fazer login</Text>
                <Ionicons name="arrow-forward" size={18} color="#06101F" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.modalIconBadge}>
                <Ionicons name={step === 'email' ? 'key-outline' : 'lock-open-outline'} size={26} color={p.accent} />
              </View>
              <Text style={styles.modalTitle}>
                {step === 'email' ? 'Esqueci minha senha' : 'Redefinir senha'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {step === 'email'
                  ? 'Informe seu e-mail cadastrado. Enviaremos um código de verificação.'
                  : `Código enviado para ${fpEmail}. Digite-o abaixo junto com sua nova senha.`}
              </Text>

              {step === 'email' && (
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color={p.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor={p.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={fpEmail}
                    onChangeText={setFpEmail}
                    returnKeyType="send"
                    onSubmitEditing={handleSendCode}
                  />
                </View>
              )}

              {step === 'code' && (
                <>
                  <View style={styles.inputRow}>
                    <Ionicons name="keypad-outline" size={18} color={p.textSecondary} />
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      placeholder="000000"
                      placeholderTextColor={p.placeholder}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={fpCode}
                      onChangeText={setFpCode}
                    />
                  </View>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={p.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nova senha (mín. 8 caracteres)"
                      placeholderTextColor={p.placeholder}
                      secureTextEntry={!showNewPwd}
                      autoCapitalize="none"
                      value={fpNewPwd}
                      onChangeText={setFpNewPwd}
                    />
                    <Pressable hitSlop={8} onPress={() => setShowNewPwd((v) => !v)}>
                      <Ionicons name={showNewPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={p.textSecondary} />
                    </Pressable>
                  </View>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={p.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirmar nova senha"
                      placeholderTextColor={p.placeholder}
                      secureTextEntry={!showNewPwd}
                      autoCapitalize="none"
                      value={fpConfirmPwd}
                      onChangeText={setFpConfirmPwd}
                      returnKeyType="done"
                      onSubmitEditing={handleReset}
                    />
                  </View>
                </>
              )}

              {err ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={14} color={p.danger} />
                  <Text style={styles.errorText}>{err}</Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity activeOpacity={0.7} style={[styles.modalButton, styles.modalButtonGhost]} onPress={handleClose}>
                  <Text style={styles.modalButtonGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={loading || (step === 'email' ? !fpEmail.trim() : fpCode.length < 6 || fpNewPwd.length < 8 || !fpConfirmPwd)}
                  style={[styles.modalButton, styles.modalButtonPrimary, (loading) && styles.buttonDisabled]}
                  onPress={step === 'email' ? handleSendCode : handleReset}>
                  {loading ? (
                    <ActivityIndicator color="#06101F" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{step === 'email' ? 'Enviar código' : 'Redefinir'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Modal: Primeiro acesso ----------

function InviteModal({
  visible, code, onChangeCode, onClose, onConfirm,
}: {
  visible: boolean; code: string; onChangeCode: (v: string) => void; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalIconBadge}>
            <Ionicons name="ticket-outline" size={26} color={p.accent} />
          </View>
          <Text style={styles.modalTitle}>Código de convite</Text>
          <Text style={styles.modalSubtitle}>Digite o código que você recebeu para liberar seu primeiro acesso.</Text>

          <View style={styles.inputRow}>
            <Ionicons name="ticket-outline" size={18} color={p.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Ex.: KIT-2026"
              placeholderTextColor={p.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              value={code}
              onChangeText={onChangeCode}
              returnKeyType="done"
              onSubmitEditing={onConfirm}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity activeOpacity={0.7} style={[styles.modalButton, styles.modalButtonGhost]} onPress={onClose}>
              <Text style={styles.modalButtonGhostText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={code.trim().length === 0}
              style={[styles.modalButton, styles.modalButtonPrimary, code.trim().length === 0 && styles.buttonDisabled]}
              onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------- Estilos ----------

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: p.background },
  flex: { flex: 1 },
  safeArea: { flex: 1 },

  orb1: { position: 'absolute', width: 360, height: 360, borderRadius: 180, backgroundColor: 'rgba(91,169,248,0.07)', top: -100, right: -100 },
  orb2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(91,169,248,0.04)', bottom: 60, left: -80 },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, justifyContent: 'center', gap: 32 },

  branding: { alignItems: 'center', gap: 12 },
  logoRing: { width: 108, height: 108, borderRadius: 54, borderWidth: 1.5, borderColor: 'rgba(91,169,248,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  logoBadge: { width: 84, height: 84, borderRadius: 42, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(91,169,248,0.2)' },
  appName: { fontSize: 30, fontWeight: '800', color: p.text, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: p.textSecondary },

  card: { backgroundColor: p.card, borderRadius: 24, borderWidth: 1, borderColor: p.cardBorder, padding: 24, gap: 20 },
  cardHeader: { gap: 4 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: p.text },
  cardSubtitle: { fontSize: 13, color: p.textSecondary },

  fields: { gap: 16 },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: p.textSecondary, marginLeft: 2 },
  linkText: { fontSize: 13, fontWeight: '600', color: p.accent },
  forgotLink: { alignSelf: 'flex-start', marginTop: 4 },
  forgotText: { fontSize: 13, color: p.textSecondary },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: p.inputBg, borderWidth: 1, borderColor: p.inputBorder, borderRadius: 14, paddingHorizontal: 14, height: 52 },
  inputRowFocused: { borderColor: p.inputFocus, backgroundColor: 'rgba(91,169,248,0.05)' },
  input: { flex: 1, color: p.text, fontSize: 15, height: '100%' },
  codeInput: { fontSize: 22, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: p.dangerSoft, borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  errorText: { color: p.danger, fontSize: 13, flex: 1 },

  button: { backgroundColor: p.accent, height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: p.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  buttonDisabled: { opacity: 0.4, shadowOpacity: 0 },
  buttonText: { color: '#06101F', fontSize: 16, fontWeight: '700' },

  footer: { textAlign: 'center', color: p.placeholder, fontSize: 12 },

  backdrop: { flex: 1, backgroundColor: 'rgba(4,9,18,0.76)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: p.card, borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, borderColor: p.cardBorder },
  modalIconBadge: { width: 56, height: 56, borderRadius: 18, backgroundColor: p.accentSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(91,169,248,0.2)' },
  modalIconSuccess: { backgroundColor: p.successSoft, borderColor: 'rgba(74,222,128,0.2)' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: p.text },
  modalSubtitle: { fontSize: 14, lineHeight: 20, color: p.textSecondary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalButton: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalButtonGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: p.cardBorder },
  modalButtonGhostText: { color: p.text, fontSize: 15, fontWeight: '600' },
  modalButtonPrimary: { backgroundColor: p.accent },
  successBox: { alignItems: 'flex-start', gap: 12 },
});
