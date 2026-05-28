import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Badge, Card, EmptyState, Fab, Field, FormModal, Input, Select } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore, type LancamentoTipo } from '@/data/store';
import { colors } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';

type Extra = 'kwh' | 'descricao' | null;

export function LancamentoScreen({
  title,
  tipo,
  icon,
  extra = null,
}: {
  title: string;
  tipo: LancamentoTipo;
  icon: keyof typeof Ionicons.glyphMap;
  extra?: Extra;
}) {
  const { period, lancamentos, locatarios, addLancamento, getLocatario } = useStore();
  const [open, setOpen] = useState(false);

  const [locatarioId, setLocatarioId] = useState<string | null>(null);
  const [valor, setValor] = useState('');
  const [kwh, setKwh] = useState('');
  const [descricao, setDescricao] = useState('');

  const itens = lancamentos.filter((l) => l.tipo === tipo && l.periodKey === period.key);
  const total = itens.reduce((sum, l) => sum + l.valor, 0);

  const valid = locatarioId && valor.trim() && (extra !== 'descricao' || descricao.trim());

  function reset() {
    setLocatarioId(null);
    setValor('');
    setKwh('');
    setDescricao('');
  }

  function submit() {
    if (!locatarioId) return;
    addLancamento({
      tipo,
      locatarioId,
      valor: Number(valor.replace(',', '.')) || 0,
      kwh: extra === 'kwh' ? Number(kwh) || 0 : undefined,
      descricao: extra === 'descricao' ? descricao.trim() : undefined,
    });
    reset();
    setOpen(false);
  }

  return (
    <Screen title={title} footer={<Fab label="Novo lançamento" onPress={() => setOpen(true)} />}>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name={icon} size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Total do período · {period.label}</Text>
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{formatCurrency(total)}</Text>
            </View>
          </View>
          <Badge label={`${itens.length} lançado(s)`} />
        </View>
      </Card>

      {itens.length === 0 ? (
        <EmptyState icon={icon} text="Nenhum lançamento neste período." />
      ) : (
        itens.map((l) => {
          const loc = getLocatario(l.locatarioId);
          return (
            <Card key={l.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 }}>
                  {loc?.nome ?? 'Locatário removido'}
                </Text>
                <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '700' }}>
                  {formatCurrency(l.valor)}
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                {formatDate(l.data)}
                {l.kwh != null ? ` · ${l.kwh} kWh` : ''}
                {l.descricao ? ` · ${l.descricao}` : ''}
              </Text>
            </Card>
          );
        })
      )}

      <FormModal
        visible={open}
        title={`Lançar ${title.toLowerCase()}`}
        onClose={() => {
          reset();
          setOpen(false);
        }}
        onSubmit={submit}
        submitDisabled={!valid}>
        <Field label="Locatário">
          <Select
            value={locatarioId}
            onChange={setLocatarioId}
            options={locatarios.map((l) => ({ label: l.nome, value: l.id }))}
            placeholder="Vincular locatário"
          />
        </Field>
        {extra === 'kwh' ? (
          <Field label="Consumo (kWh)">
            <Input value={kwh} onChangeText={setKwh} placeholder="Ex.: 180" keyboardType="number-pad" />
          </Field>
        ) : null}
        {extra === 'descricao' ? (
          <Field label="Descrição da taxa/multa">
            <Input value={descricao} onChangeText={setDescricao} placeholder="Motivo" multiline />
          </Field>
        ) : null}
        <Field label="Valor">
          <Input value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" prefix="R$" />
        </Field>
      </FormModal>
    </Screen>
  );
}