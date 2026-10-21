/**
 * Scrumbão — regras do Scrum simplificado (funções PURAS, sem tela e sem banco).
 * 📥 RECEBE: o estado atual e uma ação.
 * 📤 DEVOLVE: o novo estado. O ScrumContext guarda isso no navegador.
 *
 * Fluxo do Scrum aqui:
 *  1. Product Backlog: lista priorizada de tudo que o produto precisa.
 *  2. Sprint Planning: escolhe itens do topo do backlog + define a Meta da Sprint.
 *  3. Sprint: os itens escolhidos andam no quadro (A fazer → Fazendo → Em revisão → Feito).
 *  4. Sprint Review + Retrospectiva: encerra a sprint; o que não ficou pronto volta ao backlog.
 */

export type EtiquetaId = "bug" | "feature" | "design" | "urgente";
export const ETIQUETAS: { id: EtiquetaId; nome: string; classe: string }[] = [
  { id: "bug", nome: "Bug", classe: "bg-label-bug/15 text-label-bug border-label-bug/30" },
  { id: "feature", nome: "Feature", classe: "bg-label-feature/15 text-label-feature border-label-feature/30" },
  { id: "design", nome: "Design", classe: "bg-label-design/15 text-label-design border-label-design/30" },
  { id: "urgente", nome: "Urgente", classe: "bg-label-urgent/15 text-label-urgent border-label-urgent/30" },
];

export type ColunaId = "afazer" | "fazendo" | "revisao" | "feito";
export const COLUNAS: { id: ColunaId; titulo: string; dica: string }[] = [
  { id: "afazer", titulo: "A fazer", dica: "Escolhido na Planning, ainda não começou." },
  { id: "fazendo", titulo: "Fazendo", dica: "Alguém do time está trabalhando nisso." },
  { id: "revisao", titulo: "Em revisão", dica: "Pronto para outra pessoa conferir." },
  { id: "feito", titulo: "Feito", dica: "Atende à Definição de Pronto." },
];

export const PONTOS = [1, 2, 3, 5, 8, 13] as const;

export type Item = {
  id: string;
  titulo: string;
  descricao: string;
  etiquetas: EtiquetaId[];
  pontos: number;
  responsavel: string;
  links: string[];
  /** null = está no Product Backlog; senão, coluna no quadro da sprint */
  coluna: ColunaId | null;
};

export type SprintEncerrada = {
  numero: number;
  meta: string;
  pontosPlanejados: number;
  pontosEntregues: number;
  entregues: string[];
  retro: { bom: string; melhorar: string; acao: string };
};

export type Sprint = { numero: number; meta: string; inicio: string; dias: number };

export type ScrumState = {
  produto: string;
  time: string[];
  itens: Item[];
  sprint: Sprint | null;
  historico: SprintEncerrada[];
  daily: { data: string; pessoa: string; ontem: string; hoje: string; impedimento: string }[];
};

export type ScrumAction =
  | { type: "ADICIONAR_ITEM"; item: Omit<Item, "id" | "coluna"> & { id?: string } }
  | { type: "EDITAR_ITEM"; id: string; dados: Partial<Omit<Item, "id">> }
  | { type: "EXCLUIR_ITEM"; id: string }
  | { type: "PRIORIZAR"; id: string; direcao: "cima" | "baixo" }
  | { type: "INICIAR_SPRINT"; meta: string; dias: number; ids: string[]; hoje: string }
  | { type: "MOVER"; id: string; coluna: ColunaId }
  | { type: "ENCERRAR_SPRINT"; retro: SprintEncerrada["retro"] }
  | { type: "REGISTRAR_DAILY"; registro: ScrumState["daily"][number] }
  | { type: "DEFINIR_TIME"; time: string[] }
  | { type: "RESTAURAR"; estado: ScrumState };

export const MAX_TIME = 6;

let contador = 0;
export const novoId = () => `i${Date.now().toString(36)}${(contador++).toString(36)}`;

export function scrumReducer(s: ScrumState, a: ScrumAction): ScrumState {
  switch (a.type) {
    case "ADICIONAR_ITEM": {
      const titulo = a.item.titulo.trim();
      if (!titulo) return s;
      return { ...s, itens: [...s.itens, { ...a.item, titulo, id: a.item.id ?? novoId(), coluna: null }] };
    }
    case "EDITAR_ITEM":
      return { ...s, itens: s.itens.map((i) => (i.id === a.id ? { ...i, ...a.dados } : i)) };
    case "EXCLUIR_ITEM":
      return { ...s, itens: s.itens.filter((i) => i.id !== a.id) };
    case "PRIORIZAR": {
      // só reordena dentro do backlog (itens fora da sprint)
      const backlog = s.itens.filter((i) => i.coluna === null);
      const idx = backlog.findIndex((i) => i.id === a.id);
      const alvo = backlog[a.direcao === "cima" ? idx - 1 : idx + 1];
      if (idx < 0 || !alvo) return s;
      const itens = [...s.itens];
      const x = itens.findIndex((i) => i.id === a.id);
      const y = itens.findIndex((i) => i.id === alvo.id);
      [itens[x], itens[y]] = [itens[y]!, itens[x]!];
      return { ...s, itens };
    }
    case "INICIAR_SPRINT": {
      if (s.sprint || a.ids.length === 0 || !a.meta.trim()) return s;
      const numero = s.historico.length + 1;
      return {
        ...s,
        sprint: { numero, meta: a.meta.trim(), dias: a.dias, inicio: a.hoje },
        itens: s.itens.map((i) => (a.ids.includes(i.id) && i.coluna === null ? { ...i, coluna: "afazer" } : i)),
        daily: [],
      };
    }
    case "MOVER":
      if (!s.sprint) return s;
      return { ...s, itens: s.itens.map((i) => (i.id === a.id && i.coluna ? { ...i, coluna: a.coluna } : i)) };
    case "ENCERRAR_SPRINT": {
      if (!s.sprint) return s;
      const naSprint = s.itens.filter((i) => i.coluna !== null);
      const feitos = naSprint.filter((i) => i.coluna === "feito");
      const encerrada: SprintEncerrada = {
        numero: s.sprint.numero,
        meta: s.sprint.meta,
        pontosPlanejados: naSprint.reduce((t, i) => t + i.pontos, 0),
        pontosEntregues: feitos.reduce((t, i) => t + i.pontos, 0),
        entregues: feitos.map((i) => i.titulo),
        retro: a.retro,
      };
      return {
        ...s,
        sprint: null,
        historico: [...s.historico, encerrada],
        // entregues saem do backlog; o resto volta ao backlog (no topo) para replanejar
        itens: [
          ...naSprint.filter((i) => i.coluna !== "feito").map((i) => ({ ...i, coluna: null })),
          ...s.itens.filter((i) => i.coluna === null),
        ],
        daily: [],
      };
    }
    case "REGISTRAR_DAILY":
      if (!s.sprint) return s;
      return { ...s, daily: [a.registro, ...s.daily] };
    case "DEFINIR_TIME":
      return { ...s, time: a.time.map((t) => t.trim()).filter(Boolean).slice(0, MAX_TIME) };
    case "RESTAURAR":
      return a.estado;
    default:
      return s;
  }
}

/** velocidade média (pontos entregues por sprint) — ajuda a planejar a próxima */
export function velocidade(h: SprintEncerrada[]) {
  if (!h.length) return 0;
  return Math.round(h.reduce((t, x) => t + x.pontosEntregues, 0) / h.length);
}

const item = (titulo: string, etiquetas: EtiquetaId[], pontos: number, responsavel: string, descricao = "", links: string[] = []): Item => ({
  id: novoId(), titulo, etiquetas, pontos, responsavel, descricao, links, coluna: null,
});

export function estadoDemo(): ScrumState {
  return {
    produto: "App de receitas da vovó",
    time: ["Carol (Product Owner)", "Bruno (Scrum Master)", "Ana (Dev)", "Diego (Dev)"],
    itens: [
      item("Como visitante, quero buscar receitas por ingrediente", ["feature"], 5, "Ana", "Campo de busca no topo da página inicial."),
      item("Como visitante, quero ver a foto e o passo a passo", ["feature", "design"], 3, "Diego", "", ["https://drive.google.com/"]),
      item("Corrigir acentos que somem no título", ["bug", "urgente"], 1, "Ana"),
      item("Como cozinheira, quero salvar receitas favoritas", ["feature"], 8, ""),
      item("Definir paleta de cores e logotipo", ["design"], 2, "Diego"),
      item("Como visitante, quero imprimir a receita", ["feature"], 3, ""),
    ],
    sprint: null,
    historico: [],
    daily: [],
  };
}
