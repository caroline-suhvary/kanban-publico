import { expect, it } from 'vitest';
import { diasParaExclusao, LIMITES, podeCriar, podeParticipar } from './workspace';
it('limite de 50 contas', () => expect(LIMITES.usuarios).toBe(50));
it('limite de 100 Scrums', () => expect(LIMITES.scrums).toBe(100));
it('até 2 criados', () => { expect(podeCriar(1)).toBe(true); expect(podeCriar(2)).toBe(false); });
it('até 2 como convidado', () => { expect(podeParticipar(1)).toBe(true); expect(podeParticipar(2)).toBe(false); });
it('6 pessoas incluindo criador', () => expect(LIMITES.equipe).toBe(6));
it.each([25,26,27,28,29])('alerta aos %i dias', dias => expect(diasParaExclusao('2026-01-01', Date.parse('2026-01-01') + dias * 86400000)).toBe(30-dias));
it.each([24,30])('sem alerta regressivo aos %i dias', dias => expect(diasParaExclusao('2026-01-01', Date.parse('2026-01-01') + dias * 86400000)).toBeNull());