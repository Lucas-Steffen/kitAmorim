import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Badge, Button, Card, Divider, EmptyState, Field, KeyValue, SectionTitle, Select } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { lancamentoLabels, useStore, type LancamentoTipo } from '@/data/store';
import { colors } from '@/theme';
import { formatCurrency } from '@/utils';

export default function FechamentoScreen() {
  const { period, locatarios, lancamentos, getKitnet } = useStore();
  const [locatarioId, setLocatarioId] = useState<string | null>(null);
  const [fechados, setFechados] = useState<string[]>([]);

  const loc = locatarios.find((l) => l.id === locatarioId);
  const kitnet = loc ? getKitnet(loc.kitnetId) : undefined;
  const itens = loc ? lancamentos.filter((l) => l.locatarioId === loc.id && l.periodKey === period.key) : [];

  const tipos: LancamentoTipo[] = ['agua', 'energia', 'taxa', 'internet'];
  const porTipo = tipos
    .map((t) => ({ tipo: t, total: itens.filter((l) => l.tipo === t).reduce((s, l) => s + l.valor, 0) }))
    .filter((x) => x.total > 0);

  const totalLancamentos = itens.reduce((s, l) => s + l.valor, 0);
  const totalGeral = (loc?.valorLocacao ?? 0) + totalLancamentos;
  const fechadoChave = loc ? `${loc.id}-${period.key}` : '';
  const jaFechado = fechados.includes(fechadoChave);

  function fecharPeriodo() {
    if (!loc) return;
    Alert.alert(
      'Fechar período',
      `Confirmar o fechamento de ${period.label} para ${loc.nome}?\nTotal: ${formatCurrency(totalGeral)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar',
          onPress: () => setFechados((prev) => [...prev, fechadoChave]),
        },
      ],
    );
  }

  return (
    <Screen title="Fechamento do período">
      <Card>
        <SectionTitle hint={period.label}>Selecione o locatário</SectionTitle>
        <Field label="Locatário">
          <Select
            value={locatarioId}
            onChange={setLocatarioId}
            options={locatarios.map((l) => ({ label: l.nome, value: l.id }))}
            placeholder="Selecione o locatário"
          />
        </Field>
      </Card>

      {!loc ? (
        <EmptyState icon="cash-outline" text="Escolha um locatário para ver o resumo do período." />
      ) : (
        <>
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1 }}>{loc.nome}</Text>
              {jaFechado ? <Badge label="Período fechado" tone="success" /> : <Badge label="Em aberto" tone="warning" />}
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
              {kitnet ? `Kitnet ${kitnet.numero} · ${kitnet.endereco}` : 'Sem kitnet vinculada'}
            </Text>

            <Divider />
            <KeyValue label="Aluguel" value={formatCurrency(loc.valorLocacao)} />
            {porTipo.map((p) => (
              <KeyValue key={p.tipo} label={lancamentoLabels[p.tipo]} value={formatCurrency(p.total)} />
            ))}
            {porTipo.length === 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                Nenhum lançamento extra neste período.
              </Text>
            ) : null}
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Total a faturar</Text>
              <Text style={{ color: colors.accent, fontSize: 20, fontWeight: '800' }}>{formatCurrency(totalGeral)}</Text>
            </View>
          </Card>

          <Button
            label={jaFechado ? 'Período já fechado' : 'Fechar período'}
            icon="checkmark-circle-outline"
            onPress={fecharPeriodo}
            disabled={jaFechado}
          />
        </>
      )}
    </Screen>
  );
}