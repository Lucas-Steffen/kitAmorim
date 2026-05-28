import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Button, Card, EmptyState, Field, SectionTitle, Select } from '@/components/kit';
import { Screen } from '@/components/sidebar';
import { useStore, type Locatario, type ModeloContrato } from '@/data/store';
import { colors } from '@/theme';
import { formatCurrency, formatDate } from '@/utils';

function fillTemplate(modelo: ModeloContrato, loc: Locatario, kitnet?: { numero: string; endereco: string }) {
  const map: Record<string, string> = {
    nome: loc.nome,
    cpf: loc.cpf,
    rg: loc.rg,
    kitnet_numero: kitnet?.numero ?? '—',
    kitnet_endereco: kitnet?.endereco ?? '—',
    valor_locacao: formatCurrency(loc.valorLocacao),
    dia_pagamento: String(loc.diaPagamento),
    inicio: formatDate(loc.inicioLocacao),
    fim: formatDate(loc.fimEsperado),
    periodo_meses: String(loc.periodoMeses),
  };
  return modelo.conteudo.replace(/\{\{(\w+)\}\}/g, (_, key) => map[key] ?? `{{${key}}}`);
}

function buildHtml(titulo: string, corpo: string) {
  const safe = corpo.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 48px; color: #111; line-height: 1.6; }
    h1 { font-size: 20px; text-align: center; margin-bottom: 32px; }
    .corpo { white-space: pre-wrap; font-size: 14px; }
    .assinaturas { margin-top: 80px; display: flex; justify-content: space-between; }
    .linha { border-top: 1px solid #111; width: 40%; text-align: center; padding-top: 8px; font-size: 12px; }
  </style></head><body>
    <h1>${titulo}</h1>
    <div class="corpo">${safe}</div>
    <div class="assinaturas"><div class="linha">Locador</div><div class="linha">Locatário</div></div>
  </body></html>`;
}

export default function GeracaoScreen() {
  const { locatarios, modelos, getKitnet } = useStore();
  const [locatarioId, setLocatarioId] = useState<string | null>(null);
  const [modeloId, setModeloId] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  const loc = locatarios.find((l) => l.id === locatarioId);
  const modelo = modelos.find((m) => m.id === modeloId);
  const kitnet = loc ? getKitnet(loc.kitnetId) : undefined;
  const preview = loc && modelo ? fillTemplate(modelo, loc, kitnet) : null;

  async function gerarPdf() {
    if (!loc || !modelo) return;
    try {
      setGerando(true);
      const html = buildHtml(modelo.nome, fillTemplate(modelo, loc, kitnet));
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Contrato gerado' });
      } else {
        Alert.alert('Contrato gerado', `PDF salvo em:\n${uri}`);
      }
    } catch (e) {
      Alert.alert('Erro ao gerar', String(e));
    } finally {
      setGerando(false);
    }
  }

  return (
    <Screen title="Geração de contratos">
      <Card>
        <SectionTitle hint="Selecione o locatário e o modelo">Dados do contrato</SectionTitle>
        <Field label="Locatário">
          <Select
            value={locatarioId}
            onChange={setLocatarioId}
            options={locatarios.map((l) => ({ label: l.nome, value: l.id }))}
            placeholder="Selecione o locatário"
          />
        </Field>
        <View style={{ height: 12 }} />
        <Field label="Modelo de contrato">
          <Select
            value={modeloId}
            onChange={setModeloId}
            options={modelos.map((m) => ({ label: m.nome, value: m.id }))}
            placeholder="Selecione o modelo"
          />
        </Field>
      </Card>

      <Card>
        <SectionTitle>Preview</SectionTitle>
        {preview ? (
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22 }}>{preview}</Text>
        ) : (
          <EmptyState icon="document-text-outline" text="Selecione locatário e modelo para ver o preview preenchido." />
        )}
      </Card>

      <Button
        label={gerando ? 'Gerando…' : 'Gerar contrato (PDF)'}
        icon="document-outline"
        onPress={gerarPdf}
        disabled={!preview || gerando}
      />
    </Screen>
  );
}