import { useState } from "react";
import { Flag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useScrum } from "@/context/ScrumContext";
import { COLUNAS } from "@/lib/scrum";
import { ItemCard } from "./ItemCard";
import { Dica } from "./Dica";

export function SprintBoard({ irParaBacklog }: { irParaBacklog: () => void }) {
  const { s, dispatch } = useScrum();
  const [encerrar, setEncerrar] = useState(false);
  const [daily, setDaily] = useState(false);

  if (!s.sprint) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border-2 border-dashed p-10 text-center">
        <h2 className="font-display text-2xl font-bold">Nenhuma sprint em andamento</h2>
        <p className="mt-2 text-muted-foreground">
          Vá ao Backlog, escolha os itens e faça a Sprint Planning.
        </p>
        <Button className="mt-4" onClick={irParaBacklog}>
          Ir para o Backlog
        </Button>
      </div>
    );
  }

  const naSprint = s.itens.filter((i) => i.coluna);
  const total = naSprint.reduce((t, i) => t + i.pontos, 0);
  const feitos = naSprint.filter((i) => i.coluna === "feito").reduce((t, i) => t + i.pontos, 0);
  const passados = Math.floor((Date.now() - new Date(s.sprint.inicio).getTime()) / 86400000);
  const restam = Math.max(0, s.sprint.dias - passados);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            Sprint {s.sprint.numero} · faltam {restam} dias
          </p>
          <h2 className="font-display text-2xl font-bold">🎯 {s.sprint.meta}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDaily(true)}>
            <MessageCircle className="h-4 w-4" />
            Daily
          </Button>
          <Button onClick={() => setEncerrar(true)}>
            <Flag className="h-4 w-4" />
            Encerrar Sprint
          </Button>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-3 text-sm">
        <Progress value={total ? (feitos / total) * 100 : 0} className="h-3 flex-1" />
        <span className="font-display font-bold">
          {feitos}/{total} pts
        </span>
      </div>
      <Dica>
        O <b>time de desenvolvimento</b> se auto-organiza: arraste os cards (ou use ◀ ▶) conforme o
        trabalho anda. Novos itens não entram no meio da sprint — vão para o backlog.
      </Dica>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUNAS.map((c) => {
          const itens = naSprint.filter((i) => i.coluna === c.id);
          return (
            <section
              key={c.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id) dispatch({ type: "MOVER", id, coluna: c.id });
              }}
              className="flex min-w-0 flex-col rounded-xl border border-border bg-muted/40 p-3"
            >
              <h3 className="font-display font-bold">
                {c.titulo} <span className="text-muted-foreground">{itens.length}</span>
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">{c.dica}</p>
              <div className="grid gap-3">
                {itens.map((i) => (
                  <ItemCard key={i.id} item={i} modo="sprint" />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {s.daily.length > 0 && (
        <section className="mt-6">
          <h3 className="font-display text-lg font-bold">Registros da Daily</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {s.daily.map((d, i) => (
              <div key={i} className="rounded-lg border bg-card p-3 text-sm">
                <p className="font-semibold">
                  {d.pessoa} <span className="font-normal text-muted-foreground">· {d.data}</span>
                </p>
                <p>
                  <b>Ontem:</b> {d.ontem}
                </p>
                <p>
                  <b>Hoje:</b> {d.hoje}
                </p>
                {d.impedimento && (
                  <p className="text-destructive">
                    <b>Impedimento:</b> {d.impedimento}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <DailyDialog aberto={daily} onFechar={() => setDaily(false)} />
      <EncerrarDialog
        aberto={encerrar}
        onFechar={() => setEncerrar(false)}
        feitos={feitos}
        total={total}
      />
    </div>
  );
}

function DailyDialog({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { s, dispatch } = useScrum();
  const [f, setF] = useState({ pessoa: "", ontem: "", hoje: "", impedimento: "" });
  const salvar = () => {
    dispatch({
      type: "REGISTRAR_DAILY",
      registro: { ...f, data: new Date().toLocaleDateString("pt-BR") },
    });
    setF({ pessoa: "", ontem: "", hoje: "", impedimento: "" });
    onFechar();
  };
  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Daily Scrum (15 min)</DialogTitle>
          <DialogDescription>
            Cada pessoa responde 3 perguntas. O Scrum Master ajuda a remover impedimentos.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 text-sm">
          <select
            value={f.pessoa}
            onChange={(e) => setF({ ...f, pessoa: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2"
          >
            <option value="">Quem está falando?</option>
            {s.time.map((t) => (
              <option key={t}>{t.split(" (")[0]}</option>
            ))}
          </select>
          <Input
            placeholder="O que fiz ontem?"
            value={f.ontem}
            onChange={(e) => setF({ ...f, ontem: e.target.value })}
          />
          <Input
            placeholder="O que vou fazer hoje?"
            value={f.hoje}
            onChange={(e) => setF({ ...f, hoje: e.target.value })}
          />
          <Input
            placeholder="Algo está me travando? (opcional)"
            value={f.impedimento}
            onChange={(e) => setF({ ...f, impedimento: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button disabled={!f.pessoa || !f.hoje} onClick={salvar}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EncerrarDialog({
  aberto,
  onFechar,
  feitos,
  total,
}: {
  aberto: boolean;
  onFechar: () => void;
  feitos: number;
  total: number;
}) {
  const { dispatch } = useScrum();
  const [r, setR] = useState({ bom: "", melhorar: "", acao: "" });
  const salvar = () => {
    dispatch({ type: "ENCERRAR_SPRINT", retro: r });
    setR({ bom: "", melhorar: "", acao: "" });
    onFechar();
  };
  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Review + Retrospectiva</DialogTitle>
          <DialogDescription>
            <b>Review:</b> o time mostrou o que entregou ({feitos} de {total} pontos). O que não
            está em "Feito" volta para o topo do backlog.
            <br />
            <b>Retrospectiva:</b> como foi o jeito de trabalhar?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 text-sm">
          <label className="grid gap-1">
            😊 O que funcionou bem?
            <Textarea
              rows={2}
              value={r.bom}
              onChange={(e) => setR({ ...r, bom: e.target.value })}
            />
          </label>
          <label className="grid gap-1">
            🤔 O que pode melhorar?
            <Textarea
              rows={2}
              value={r.melhorar}
              onChange={(e) => setR({ ...r, melhorar: e.target.value })}
            />
          </label>
          <label className="grid gap-1">
            🛠️ Uma ação para a próxima sprint
            <Input value={r.acao} onChange={(e) => setR({ ...r, acao: e.target.value })} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Voltar
          </Button>
          <Button onClick={salvar}>Encerrar sprint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
