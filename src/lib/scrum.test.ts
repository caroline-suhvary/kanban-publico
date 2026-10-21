import { describe, expect, it } from "vitest";
import { estadoDemo, scrumReducer, MAX_TIME } from "./scrum";

describe("regras do Scrum", () => {
  it("iniciar sprint leva os itens escolhidos para A fazer", () => {
    const s = estadoDemo();
    const ids = [s.itens[0]!.id, s.itens[2]!.id];
    const n = scrumReducer(s, { type: "INICIAR_SPRINT", meta: "Busca", dias: 14, ids, hoje: "2026-10-21" });
    expect(n.sprint?.numero).toBe(1);
    expect(n.itens.filter((i) => i.coluna === "afazer").map((i) => i.id)).toEqual(ids);
  });

  it("não inicia sprint sem meta", () => {
    const s = estadoDemo();
    const n = scrumReducer(s, { type: "INICIAR_SPRINT", meta: " ", dias: 14, ids: [s.itens[0]!.id], hoje: "x" });
    expect(n.sprint).toBeNull();
  });

  it("encerrar sprint devolve o não-pronto ao backlog e conta pontos entregues", () => {
    let s = estadoDemo();
    const [a, b] = [s.itens[0]!, s.itens[2]!]; // 5 e 1 pontos
    s = scrumReducer(s, { type: "INICIAR_SPRINT", meta: "M", dias: 7, ids: [a.id, b.id], hoje: "x" });
    s = scrumReducer(s, { type: "MOVER", id: b.id, coluna: "feito" });
    s = scrumReducer(s, { type: "ENCERRAR_SPRINT", retro: { bom: "", melhorar: "", acao: "" } });
    expect(s.sprint).toBeNull();
    expect(s.historico[0]).toMatchObject({ pontosPlanejados: 6, pontosEntregues: 1 });
    expect(s.itens.find((i) => i.id === a.id)?.coluna).toBeNull();
    expect(s.itens.find((i) => i.id === b.id)).toBeUndefined();
  });

  it("time tem no máximo 6 pessoas", () => {
    const n = scrumReducer(estadoDemo(), { type: "DEFINIR_TIME", time: ["1", "2", "3", "4", "5", "6", "7"] });
    expect(n.time).toHaveLength(MAX_TIME);
    expect(MAX_TIME).toBe(6);
  });
});
