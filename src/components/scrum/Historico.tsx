import { useScrum } from "@/context/ScrumContext";
import { velocidade } from "@/lib/scrum";
import { Dica } from "./Dica";

export function Historico() {
  const { s } = useScrum();
  const max = Math.max(1, ...s.historico.map((h) => h.pontosPlanejados));
  return (
    <div className="grid gap-4">
      <h2 className="font-display text-2xl font-bold">Sprints encerradas · velocidade média {velocidade(s.historico)} pts</h2>
      <Dica>A <b>velocidade</b> é quantos pontos o time entrega por sprint. Ela ajuda a não prometer demais na próxima Planning.</Dica>
      {s.historico.length === 0 && <p className="text-muted-foreground">Nenhuma sprint encerrada ainda.</p>}
      {[...s.historico].reverse().map((h) => (
        <article key={h.numero} className="rounded-xl border-2 border-foreground bg-card p-4">
          <p className="font-display text-sm font-bold uppercase text-primary">Sprint {h.numero}</p>
          <h3 className="font-display text-lg font-bold">🎯 {h.meta}</h3>
          <div className="my-3 flex items-center gap-2 text-sm">
            <div className="h-3 flex-1 rounded-full bg-muted">
              <div className="h-3 rounded-full bg-muted-foreground/30" style={{ width: `${(h.pontosPlanejados / max) * 100}%` }}>
                <div className="h-3 rounded-full bg-primary" style={{ width: `${h.pontosPlanejados ? (h.pontosEntregues / h.pontosPlanejados) * 100 : 0}%` }} />
              </div>
            </div>
            <span>{h.pontosEntregues}/{h.pontosPlanejados} pts</span>
          </div>
          {h.entregues.length > 0 && <p className="text-sm"><b>Entregue:</b> {h.entregues.join(" · ")}</p>}
          <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
            <p className="rounded bg-muted p-2">😊 {h.retro.bom || "—"}</p>
            <p className="rounded bg-muted p-2">🤔 {h.retro.melhorar || "—"}</p>
            <p className="rounded bg-muted p-2">🛠️ {h.retro.acao || "—"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
