import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { getCurrentPeriod, periodKeyOf, type Period } from '@/utils';

export type Kitnet = {
  id: string;
  numero: string;
  endereco: string;
  valor: number;
  fotos: string[];
};

export type Locatario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  rg: string;
  kitnetId: string;
  docFrente?: string;
  docVerso?: string;
  inicioLocacao: Date;
  periodoMeses: number;
  fimEsperado: Date;
  valorLocacao: number;
  diaPagamento: number;
};

export type LancamentoTipo = 'agua' | 'energia' | 'taxa' | 'internet';

export type Lancamento = {
  id: string;
  tipo: LancamentoTipo;
  locatarioId: string;
  valor: number;
  periodKey: string;
  data: Date;
  /** energia */
  kwh?: number;
  /** taxa/multa */
  descricao?: string;
};

export type ModeloContrato = {
  id: string;
  nome: string;
  /** Conteúdo do modelo (.docx mockado como texto com {{variaveis}}). */
  arquivo: string;
  conteudo: string;
};

export type TipoSolicitacao = {
  id: string;
  nome: string;
};

export type StatusSolicitacao = 'aberta' | 'em_andamento' | 'concluida';

export type Solicitacao = {
  id: string;
  tipoId: string;
  locatarioId: string;
  kitnetId: string;
  descricao: string;
  foto?: string;
  criadoEm: Date;
  status: StatusSolicitacao;
};

// ---------- Helpers ----------

let counter = 100;
const uid = (prefix: string) => `${prefix}_${++counter}`;

const period = getCurrentPeriod();
const day = (n: number) => new Date(period.start.getFullYear(), period.start.getMonth(), n);

// ---------- Seed (dados mockados) ----------

const seedKitnets: Kitnet[] = [
  { id: 'k1', numero: '101', endereco: 'Rua das Acácias, 240 — Centro', valor: 950, fotos: [] },
  { id: 'k2', numero: '102', endereco: 'Rua das Acácias, 240 — Centro', valor: 1050, fotos: [] },
  { id: 'k3', numero: '201', endereco: 'Rua das Acácias, 240 — Centro', valor: 1100, fotos: [] },
  { id: 'k4', numero: '202', endereco: 'Av. Beira-Rio, 88 — Jardim', valor: 1250, fotos: [] },
];

const seedLocatarios: Locatario[] = [
  {
    id: 'l1',
    nome: 'Mariana Ribeiro',
    cpf: '123.456.789-00',
    email: 'mariana.ribeiro@email.com',
    rg: 'MG-12.345.678',
    kitnetId: 'k1',
    inicioLocacao: new Date(period.start.getFullYear(), period.start.getMonth() - 3, 5),
    periodoMeses: 12,
    fimEsperado: new Date(period.start.getFullYear(), period.start.getMonth() + 9, 5),
    valorLocacao: 950,
    diaPagamento: 5,
  },
  {
    id: 'l2',
    nome: 'Carlos Eduardo Souza',
    cpf: '987.654.321-00',
    email: 'cadu.souza@email.com',
    rg: 'SP-98.765.432',
    kitnetId: 'k2',
    inicioLocacao: new Date(period.start.getFullYear(), period.start.getMonth() - 1, 10),
    periodoMeses: 6,
    fimEsperado: new Date(period.start.getFullYear(), period.start.getMonth() + 5, 10),
    valorLocacao: 1050,
    diaPagamento: 10,
  },
  {
    id: 'l3',
    nome: 'Juliana Alves',
    cpf: '456.123.789-11',
    email: 'ju.alves@email.com',
    rg: 'RJ-45.612.378',
    kitnetId: 'k3',
    inicioLocacao: new Date(period.start.getFullYear(), period.start.getMonth() - 6, 1),
    periodoMeses: 24,
    fimEsperado: new Date(period.start.getFullYear(), period.start.getMonth() + 18, 1),
    valorLocacao: 1100,
    diaPagamento: 1,
  },
];

const seedLancamentos: Lancamento[] = [
  { id: uid('lc'), tipo: 'agua', locatarioId: 'l1', valor: 48.9, periodKey: period.key, data: day(8) },
  { id: uid('lc'), tipo: 'agua', locatarioId: 'l2', valor: 52.3, periodKey: period.key, data: day(8) },
  { id: uid('lc'), tipo: 'energia', locatarioId: 'l1', valor: 132.4, kwh: 180, periodKey: period.key, data: day(9) },
  { id: uid('lc'), tipo: 'energia', locatarioId: 'l3', valor: 98.7, kwh: 134, periodKey: period.key, data: day(9) },
  { id: uid('lc'), tipo: 'internet', locatarioId: 'l1', valor: 99.9, periodKey: period.key, data: day(2) },
  { id: uid('lc'), tipo: 'internet', locatarioId: 'l2', valor: 99.9, periodKey: period.key, data: day(2) },
  {
    id: uid('lc'),
    tipo: 'taxa',
    locatarioId: 'l2',
    valor: 75,
    descricao: 'Multa por atraso no pagamento',
    periodKey: period.key,
    data: day(12),
  },
];

const seedModelos: ModeloContrato[] = [
  {
    id: 'm1',
    nome: 'Contrato de Locação Residencial',
    arquivo: 'contrato_residencial.docx',
    conteudo:
      'CONTRATO DE LOCAÇÃO\n\nLocatário(a): {{nome}}, CPF {{cpf}}, RG {{rg}}.\n' +
      'Imóvel: Kitnet nº {{kitnet_numero}}, situada em {{kitnet_endereco}}.\n' +
      'Valor mensal: {{valor_locacao}}, com vencimento todo dia {{dia_pagamento}}.\n' +
      'Vigência: de {{inicio}} a {{fim}} ({{periodo_meses}} meses).\n\n' +
      'As partes acordam com as cláusulas do presente instrumento.',
  },
  {
    id: 'm2',
    nome: 'Termo de Renovação',
    arquivo: 'termo_renovacao.docx',
    conteudo:
      'TERMO DE RENOVAÇÃO\n\nFica renovada a locação do(a) Sr(a). {{nome}} (CPF {{cpf}}) ' +
      'referente à Kitnet nº {{kitnet_numero}} pelo valor de {{valor_locacao}}.',
  },
];

const seedTipos: TipoSolicitacao[] = [
  { id: 't1', nome: 'Manutenção elétrica' },
  { id: 't2', nome: 'Manutenção hidráulica' },
  { id: 't3', nome: 'Limpeza' },
  { id: 't4', nome: 'Outros' },
];

const seedSolicitacoes: Solicitacao[] = [
  {
    id: 's1',
    tipoId: 't2',
    locatarioId: 'l1',
    kitnetId: 'k1',
    descricao: 'Vazamento na torneira da pia da cozinha.',
    criadoEm: day(6),
    status: 'aberta',
  },
  {
    id: 's2',
    tipoId: 't1',
    locatarioId: 'l3',
    kitnetId: 'k3',
    descricao: 'Tomada do quarto sem energia.',
    criadoEm: day(11),
    status: 'aberta',
  },
  {
    id: 's3',
    tipoId: 't3',
    locatarioId: 'l2',
    kitnetId: 'k2',
    descricao: 'Solicitação de limpeza da área comum.',
    criadoEm: day(3),
    status: 'concluida',
  },
];

// ---------- Context ----------

type Store = {
  period: Period;
  kitnets: Kitnet[];
  locatarios: Locatario[];
  lancamentos: Lancamento[];
  modelos: ModeloContrato[];
  tipos: TipoSolicitacao[];
  solicitacoes: Solicitacao[];
  addKitnet: (data: Omit<Kitnet, 'id'>) => void;
  addLocatario: (data: Omit<Locatario, 'id'>) => void;
  addLancamento: (data: Omit<Lancamento, 'id' | 'periodKey' | 'data'>) => void;
  addModelo: (data: Omit<ModeloContrato, 'id'>) => void;
  addTipo: (data: Omit<TipoSolicitacao, 'id'>) => void;
  addSolicitacao: (data: Omit<Solicitacao, 'id' | 'criadoEm' | 'status'>) => void;
  getKitnet: (id: string) => Kitnet | undefined;
  getLocatario: (id: string) => Locatario | undefined;
  getTipo: (id: string) => TipoSolicitacao | undefined;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [kitnets, setKitnets] = useState<Kitnet[]>(seedKitnets);
  const [locatarios, setLocatarios] = useState<Locatario[]>(seedLocatarios);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(seedLancamentos);
  const [modelos, setModelos] = useState<ModeloContrato[]>(seedModelos);
  const [tipos, setTipos] = useState<TipoSolicitacao[]>(seedTipos);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(seedSolicitacoes);

  const addKitnet = useCallback((data: Omit<Kitnet, 'id'>) => {
    setKitnets((prev) => [{ ...data, id: uid('k') }, ...prev]);
  }, []);

  const addLocatario = useCallback((data: Omit<Locatario, 'id'>) => {
    setLocatarios((prev) => [{ ...data, id: uid('l') }, ...prev]);
  }, []);

  const addLancamento = useCallback((data: Omit<Lancamento, 'id' | 'periodKey' | 'data'>) => {
    const now = new Date();
    setLancamentos((prev) => [
      { ...data, id: uid('lc'), periodKey: periodKeyOf(now), data: now },
      ...prev,
    ]);
  }, []);

  const addModelo = useCallback((data: Omit<ModeloContrato, 'id'>) => {
    setModelos((prev) => [{ ...data, id: uid('m') }, ...prev]);
  }, []);

  const addTipo = useCallback((data: Omit<TipoSolicitacao, 'id'>) => {
    setTipos((prev) => [{ ...data, id: uid('t') }, ...prev]);
  }, []);

  const addSolicitacao = useCallback((data: Omit<Solicitacao, 'id' | 'criadoEm' | 'status'>) => {
    setSolicitacoes((prev) => [
      { ...data, id: uid('s'), criadoEm: new Date(), status: 'aberta' },
      ...prev,
    ]);
  }, []);

  const value = useMemo<Store>(
    () => ({
      period: getCurrentPeriod(),
      kitnets,
      locatarios,
      lancamentos,
      modelos,
      tipos,
      solicitacoes,
      addKitnet,
      addLocatario,
      addLancamento,
      addModelo,
      addTipo,
      addSolicitacao,
      getKitnet: (id) => kitnets.find((k) => k.id === id),
      getLocatario: (id) => locatarios.find((l) => l.id === id),
      getTipo: (id) => tipos.find((t) => t.id === id),
    }),
    [
      kitnets,
      locatarios,
      lancamentos,
      modelos,
      tipos,
      solicitacoes,
      addKitnet,
      addLocatario,
      addLancamento,
      addModelo,
      addTipo,
      addSolicitacao,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de <StoreProvider>');
  return ctx;
}

export const lancamentoLabels: Record<LancamentoTipo, string> = {
  agua: 'Água',
  energia: 'Energia',
  taxa: 'Taxa/Multa',
  internet: 'Internet',
};