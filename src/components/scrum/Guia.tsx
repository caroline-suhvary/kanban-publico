import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrum } from "@/context/ScrumContext";
import { MAX_TIME } from "@/lib/scrum";

const PASSOS = [
  { t: "1. Product Backlog", d: "Lista de tudo que o produto precisa, em ordem de prioridade. Quem cuida é o Product Owner." },
  { t: "2. Sprint Planning", d: "O time escolhe itens do topo do backlog que cabem na sprint (1 a 4 semanas) e define uma Meta." },
  { t: "3. Sprint + Daily", d: "O time trabalha nos itens. Todo dia, 15 minutos: o que fiz, o que farei, o que me trava." },
  { t: "4. Sprint Review", d: "No fim, o time mostra o que ficou pronto. O que não ficou volta ao backlog." },
  { t: "5. Retrospectiva", d: "O time conversa sobre como trabalhou e escolhe uma melhoria. E começa a próxima sprint!" },
];
const PAPEIS = [
  { t: "Product Owner", d: "Decide O QUE fazer e em que ordem. Dono do backlog." },
  { t: "Scrum Master", d: "Garante que o Scrum funcione e remove impedimentos do time." },
  { t: "Desenvolvedores", d: "Decidem COMO fazer e entregam o trabalho a cada sprint." },
];

export function Guia({ comecar }: { comecar: () => void }) {
  const { s, dispatch, reiniciar, privado } = useScrum();
  const [time, setTime] = useState<string[] | null>(null);
  const lista = time ?? s.time;

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="font-display text-3xl font-bold">O ciclo do Scrum</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          {PASSOS.map((p) => (
            <li key={p.t} className="rounded-xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
              <h3 className="font-display font-bold">{p.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
            </li>
          ))}
        </ol>
        <Button className="mt-4" onClick={comecar}>Começar pelo Backlog →</Button>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Os 3 papéis</h2>
          <div className="mt-3 grid gap-2">
            {PAPEIS.map((p) => <div key={p.t} className="rounded-lg bg-muted p-3"><b>{p.t}:</b> <span className="text-sm">{p.d}</span></div>)}
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Time deste Scrum <span className="text-base text-muted-foreground">(até {MAX_TIME})</span></h2>
          <div className="mt-3 grid gap-2">
            {privado ? s.time.map((p,i)=><p key={i} className="border-b py-2 text-sm">{p}</p>) : <>
            {Array.from({ length: MAX_TIME }).map((_, i) => (
              <Input key={i} value={lista[i] ?? ""} placeholder={`Pessoa ${i + 1} (papel)`}
                onChange={(e) => { const n = [...lista]; n[i] = e.target.value; setTime(n); }} />
            ))}
            <div className="flex gap-2">
              <Button disabled={!time} onClick={() => { dispatch({ type: "DEFINIR_TIME", time: lista }); setTime(null); }}>Salvar time</Button>
              <Button variant="outline" onClick={() => { if (confirm("Apagar tudo e voltar ao exemplo?")) { reiniciar(); setTime(null); } }}>Recomeçar exemplo</Button>
            </div>
            </>}
          </div>
        </div>
      </section>
    </div>
  );
}
