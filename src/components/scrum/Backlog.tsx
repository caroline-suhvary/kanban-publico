import { useState } from "react";
import { Plus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useScrum } from "@/context/ScrumContext";
import { velocidade } from "@/lib/scrum";
import { ItemCard } from "./ItemCard";
import { ItemDialog } from "./ItemDialog";
import { Dica } from "./Dica";

export function Backlog({ irParaSprint }: { irParaSprint: () => void }) {
  const { s, dispatch } = useScrum();
  const backlog = s.itens.filter((i) => i.coluna === null);
  const [novo, setNovo] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [meta, setMeta] = useState("");
  const [dias, setDias] = useState(14);
  const [inicio,setInicio]=useState('');
  const pontosSel = backlog.filter((i) => sel.includes(i.id)).reduce((t, i) => t + i.pontos, 0);
  const vel = velocidade(s.historico);

  const iniciar = () => {
    dispatch({ type: "INICIAR_SPRINT", meta, dias, ids: sel, hoje: inicio || new Date().toISOString().slice(0, 10) });
    setSel([]); setMeta(""); irParaSprint();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Product Backlog <span className="text-muted-foreground">({backlog.length})</span></h2>
          <Button onClick={() => setNovo(true)}><Plus className="h-4 w-4" />Novo item</Button>
        </div>
        <Dica>
          O <b>Product Owner</b> mantém esta lista em ordem de prioridade: o mais valioso fica no topo. Use ▲▼ para priorizar.
        </Dica>
        <div className="mt-4 grid gap-3">
          {backlog.length === 0 && <p className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">Backlog vazio. Adicione o que o produto precisa.</p>}
          {backlog.map((i, n) => (
            <div key={i.id} className="flex items-start gap-3">
              {!s.sprint && (
                <Checkbox className="mt-4" checked={sel.includes(i.id)} aria-label="Escolher para a sprint"
                  onCheckedChange={(c) => setSel(c ? [...sel, i.id] : sel.filter((x) => x !== i.id))} />
              )}
              <div className="flex-1"><ItemCard item={i} prioridade={n + 1} modo="backlog" /></div>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-xl border-2 border-foreground bg-secondary p-4 shadow-[4px_4px_0_0_var(--color-foreground)] lg:sticky lg:top-4">
        <h2 className="font-display text-xl font-bold">Sprint Planning</h2>
        {s.sprint ? (
          <p className="mt-2 text-sm">A Sprint {s.sprint.numero} está em andamento. Encerre-a no quadro antes de planejar a próxima.
            <Button variant="link" className="px-1" onClick={irParaSprint}>Ver quadro →</Button></p>
        ) : (
          <div className="mt-3 grid gap-3 text-sm">
            <p className="text-muted-foreground">1. Marque os itens do backlog que o time consegue entregar. 2. Escreva a Meta. 3. Comece!</p>
            <div className="rounded-lg bg-card p-3">
              <div className="flex justify-between"><span>Itens escolhidos</span><b>{sel.length}</b></div>
              <div className="flex justify-between"><span>Pontos escolhidos</span><b>{pontosSel}</b></div>
              <div className="flex justify-between text-muted-foreground"><span>Velocidade média do time</span><span>{vel ? `${vel} pts` : "sem histórico"}</span></div>
              {vel > 0 && pontosSel > vel * 1.2 && <p className="mt-1 text-xs text-destructive">Cuidado: mais pontos do que o time costuma entregar.</p>}
            </div>
            <label className="grid gap-1">Meta da Sprint
              <Input value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Ex.: visitante consegue encontrar uma receita" />
            </label>
            <label className="grid gap-1">Duração
              <Input type="date" aria-label="Data de início da Sprint" value={inicio} onChange={e=>setInicio(e.target.value)}/>
              <select value={dias} onChange={(e) => setDias(+e.target.value)} className="h-9 rounded-md border border-input bg-background px-2">
                {[7, 14, 21, 28].map((d) => <option key={d} value={d}>{d / 7} semana{d > 7 ? "s" : ""}</option>)}
              </select>
            </label>
            <Button onClick={iniciar} disabled={!sel.length || !meta.trim()}><Rocket className="h-4 w-4" />Iniciar Sprint {s.historico.length + 1}</Button>
          </div>
        )}
      </aside>
      <ItemDialog aberto={novo} onFechar={() => setNovo(false)} />
    </div>
  );
}
