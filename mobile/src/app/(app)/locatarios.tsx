import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  Badge,
  Card,
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
import { useStore } from '@/data/store';
import { colors } from '@/theme';
import { addMonths, formatCurrency, formatDate, parseDateBR } from '@/utils';

export default function LocatariosScreen() {
  const { locatarios, kitnets, addLocatario, getKitnet } = useStore();
  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [rg, setRg] = useState('');
  const [kitnetId, setKitnetId] = useState<string | null>(null);
  const [docFrente, setDocFrente] = useState<string | undefined>();
  const [docVerso, setDocVerso] = useState<string | undefined>();
  const [inicio, setInicio] = useState('');
  const [periodoMeses, setPeriodoMeses] = useState('');
  const [valor, setValor] = useState('');
  const [diaPagamento, setDiaPagamento] = useState('');

  const inicioDate = parseDateBR(inicio);
  const meses = Number(periodoMeses) || 0;
  const fimEsperado = inicioDate && meses > 0 ? addMonths(inicioDate, meses) : null;

  const valid = nome.trim() && cpf.trim() && kitnetId && inicioDate && meses > 0 && valor.trim();

  function reset() {
    setNome('');
    setCpf('');
    setEmail('');
    setRg('');
    setKitnetId(null);
    setDocFrente(undefined);
    setDocVerso(undefined);
    setInicio('');
    setPeriodoMeses('');
    setValor('');
    setDiaPagamento('');
  }

  function submit() {
    if (!inicioDate || !kitnetId || !fimEsperado) return;
    addLocatario({
      nome: nome.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      rg: rg.trim(),
      kitnetId,
      docFrente,
      docVerso,
      inicioLocacao: inicioDate,
      periodoMeses: meses,
      fimEsperado,
      valorLocacao: Number(valor.replace(',', '.')) || 0,
      diaPagamento: Number(diaPagamento) || 1,
    });
    reset();
    setOpen(false);
  }

  return (
    <Screen title="Cadastro de Locatários" footer={<Fab label="Novo locatário" onPress={() => setOpen(true)} />}>
      {locatarios.length === 0 ? (
        <EmptyState icon="people-outline" text="Nenhum locatário cadastrado ainda." />
      ) : (
        locatarios.map((l) => {
          const kit = getKitnet(l.kitnetId);
          return (
            <Card key={l.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1 }}>{l.nome}</Text>
                <Badge label={kit ? `Kitnet ${kit.numero}` : 'Sem kitnet'} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                {l.cpf} · {l.email}
              </Text>
              <Divider />
              <KeyValue label="Locação" value={formatCurrency(l.valorLocacao)} />
              <KeyValue label="Vencimento" value={`Dia ${l.diaPagamento}`} />
              <KeyValue label="Início" value={formatDate(l.inicioLocacao)} />
              <KeyValue label="Fim previsto" value={`${formatDate(l.fimEsperado)} (${l.periodoMeses} meses)`} />
            </Card>
          );
        })
      )}

      <FormModal
        visible={open}
        title="Novo locatário"
        onClose={() => {
          reset();
          setOpen(false);
        }}
        onSubmit={submit}
        submitDisabled={!valid}>
        <Field label="Nome completo">
          <Input value={nome} onChangeText={setNome} placeholder="Nome e sobrenome" autoCapitalize="words" />
        </Field>
        <Field label="CPF">
          <Input value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="number-pad" />
        </Field>
        <Field label="E-mail">
          <Input value={email} onChangeText={setEmail} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
        </Field>
        <Field label="RG">
          <Input value={rg} onChangeText={setRg} placeholder="00.000.000-0" />
        </Field>
        <Field label="Kitnet vinculada">
          <Select
            value={kitnetId}
            onChange={(id) => {
              setKitnetId(id);
              const k = kitnets.find((x) => x.id === id);
              if (k && !valor) setValor(String(k.valor).replace('.', ','));
            }}
            options={kitnets.map((k) => ({ label: `Kitnet ${k.numero} — ${k.endereco}`, value: k.id }))}
            placeholder="Selecione a kitnet"
          />
        </Field>
        <Field label="Documento — frente">
          <PhotoField value={docFrente} onChange={setDocFrente} placeholder="Foto da frente" />
        </Field>
        <Field label="Documento — verso">
          <PhotoField value={docVerso} onChange={setDocVerso} placeholder="Foto do verso" />
        </Field>
        <Field label="Início da locação">
          <Input value={inicio} onChangeText={setInicio} placeholder="dd/mm/aaaa" keyboardType="number-pad" />
        </Field>
        <Field label="Período de locação (meses)">
          <Input value={periodoMeses} onChangeText={setPeriodoMeses} placeholder="Ex.: 12" keyboardType="number-pad" />
        </Field>
        <Field label="Data esperada de fim">
          <View style={{ paddingHorizontal: 4 }}>
            <Text style={{ color: fimEsperado ? colors.text : colors.placeholder, fontSize: 15 }}>
              {fimEsperado ? formatDate(fimEsperado) : 'Calculada a partir do início + período'}
            </Text>
          </View>
        </Field>
        <Field label="Valor da locação">
          <Input value={valor} onChangeText={setValor} placeholder="0,00" keyboardType="decimal-pad" prefix="R$" />
        </Field>
        <Field label="Dia do pagamento">
          <Input value={diaPagamento} onChangeText={setDiaPagamento} placeholder="Ex.: 5" keyboardType="number-pad" />
        </Field>
      </FormModal>
    </Screen>
  );
}