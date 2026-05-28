import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Paleta dedicada do login: tema escuro com azul claro de destaque,
 * independente do esquema de cor do sistema.
 */
const palette = {
  background: '#0B1424',
  backgroundAccent: '#0F1B30',
  card: '#16223C',
  inputBackground: '#101C32',
  border: '#243355',
  borderFocus: '#5BA9F8',
  accent: '#5BA9F8',
  accentSoft: 'rgba(91, 169, 248, 0.14)',
  text: '#F4F8FF',
  textSecondary: '#8094B3',
  placeholder: '#5E6F8C',
} as const;

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function handleLogin() {
    if (!canSubmit) return;
    // TODO: integrar com a autenticação real.
    router.replace('/home');
  }

  function handleConfirmInvite() {
    // TODO: validar o código de convite no backend.
    setInviteModalVisible(false);
    setInviteCode('');
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconBadge}>
                <Ionicons name="business" size={40} color={palette.accent} />
              </View>
              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
            </View>

            <View style={styles.form}>
              <Field label="E-mail">
                <Ionicons name="mail-outline" size={20} color={palette.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={palette.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </Field>

              <Field label="Senha">
                <Ionicons name="lock-closed-outline" size={20} color={palette.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={palette.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={palette.textSecondary}
                  />
                </Pressable>
              </Field>

              <Pressable
                hitSlop={8}
                style={styles.firstAccess}
                onPress={() => setInviteModalVisible(true)}>
                <Text style={styles.firstAccessText}>Primeiro acesso</Text>
              </Pressable>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!canSubmit}
                onPress={handleLogin}
                style={[styles.button, !canSubmit && styles.buttonDisabled]}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <InviteModal
        visible={inviteModalVisible}
        code={inviteCode}
        onChangeCode={setInviteCode}
        onClose={() => setInviteModalVisible(false)}
        onConfirm={handleConfirmInvite}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>{children}</View>
    </View>
  );
}

type InviteModalProps = {
  visible: boolean;
  code: string;
  onChangeCode: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function InviteModal({ visible, code, onChangeCode, onClose, onConfirm }: InviteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalIconBadge}>
            <Ionicons name="key-outline" size={26} color={palette.accent} />
          </View>
          <Text style={styles.modalTitle}>Código de convite</Text>
          <Text style={styles.modalSubtitle}>
            Digite o código que você recebeu para liberar seu primeiro acesso.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="ticket-outline" size={20} color={palette.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Ex.: KIT-2026"
              placeholderTextColor={palette.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              value={code}
              onChangeText={onChangeCode}
              returnKeyType="done"
              onSubmitEditing={onConfirm}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.modalButton, styles.modalButtonGhost]}
              onPress={onClose}>
              <Text style={styles.modalButtonGhostText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={code.trim().length === 0}
              style={[
                styles.modalButton,
                styles.modalButtonPrimary,
                code.trim().length === 0 && styles.buttonDisabled,
              ]}
              onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 40,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textSecondary,
  },
  form: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.inputBackground,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
    height: '100%',
  },
  firstAccess: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  firstAccessText: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: palette.accent,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#06101F',
    fontSize: 16,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 9, 18, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalButtonGhostText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: palette.accent,
  },
});