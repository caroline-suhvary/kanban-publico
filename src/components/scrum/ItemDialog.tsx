import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ETIQUETAS, PONTOS, type EtiquetaId, type Item } from "@/lib/scrum";
import { useScrum } from "@/context/ScrumContext";
import { cn } from "@/lib/utils";

const vazio = { titulo: "", descricao: "", etiquetas: [] as EtiquetaId[], pontos: 3, responsavel: "", links: "" };

export function ItemDialog({ aberto, onFechar, item }: { aberto: boolean; onFechar: () => void; item?: Item }) {
  const { s, dispatch } = useScrum();
  const [f, setF] = useState(vazio);
  const [erroLink, setErroLink] = useState("");

  useEffect(() => {
    if (aberto) setF(item ? { ...item, links: item.links.join("\n") } : vazio);
    setErroLink("");
  }, [aberto, item]);

  const salvar = () => {
    const links = f.links.split("\n").map((l) => l.trim()).filter(Boolean);
    if (links.some((l) => !/^https?:\/\//i.test(l))) return setErroLink("Links precisam começar com https://");
    const dados = { titulo: f.titulo.trim(), descricao: f.descricao, etiquetas: f.etiquetas, pontos: f.pontos, responsavel: f.responsavel, links };
    if (!dados.titulo) return;
    if (item) dispatch({ type: "EDITAR_ITEM", id: item.id, dados });
    else dispatch({ type: "ADICIONAR_ITEM", item: dados });
    onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{item ? "Editar item" : "Novo item do backlog"}</DialogTitle>
          <DialogDescription>Dica: escreva como história de usuário — "Como [quem], quero [o quê] para [por quê]".</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1"><Label htmlFor="item-titulo">Título</Label><Input id="item-titulo" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Como visitante, quero..." /></div>
          <div className="grid gap-1"><Label>Descrição / critérios de aceite</Label><Textarea rows={2} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></div>
          <div className="grid gap-1">
            <Label>Story points (esforço, não horas)</Label>
            <div className="flex gap-1">
              {PONTOS.map((p) => (
                <Button variant={f.pontos===p?'default':'outline'} aria-pressed={f.pontos===p} key={p} type="button" onClick={() => setF({ ...f, pontos: p })}
                  className="h-9 w-9 p-0 font-display font-bold">{p}</Button>
              ))}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-1">
              {ETIQUETAS.map((e) => {
                const on = f.etiquetas.includes(e.id);
                return (
                  <Button variant="outline" size="sm" aria-pressed={on} key={e.id} type="button" onClick={() => setF({ ...f, etiquetas: on ? f.etiquetas.filter((x) => x !== e.id) : [...f.etiquetas, e.id] })}
                    className={cn("rounded border px-2 py-1 text-xs font-semibold", on ? e.classe : "border-border text-muted-foreground")}>{e.nome}</Button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Responsável</Label>
            <select value={f.responsavel} onChange={(e) => setF({ ...f, responsavel: e.target.value })} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
              <option value="">— ninguém ainda —</option>
              {s.time.map((t) => { const n = t.split(" (")[0]??t; return <option key={t} value={n}>{t}</option>; })}
            </select>
          </div>
          <div className="grid gap-1">
            <Label>Links (Google Drive, OneDrive…) — um por linha</Label>
            <Textarea rows={2} value={f.links} onChange={(e) => setF({ ...f, links: e.target.value })} placeholder="https://drive.google.com/..." />
            {erroLink && <p className="text-xs text-destructive">{erroLink}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>Cancelar</Button>
          <Button onClick={salvar} disabled={!f.titulo.trim()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
