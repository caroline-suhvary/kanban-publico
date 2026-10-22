import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Plus, Users, LogOut, RefreshCw, Copy, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/context/AccountContext";
import { ScrumProvider, useScrum } from "@/context/ScrumContext";
import { estadoDemo, type ScrumState } from "@/lib/scrum";
import type { Json } from "@/integrations/supabase/types";
import { diasParaExclusao, podeCriar } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AccountDialog } from "./AccountDialog";
type Perfil = {
  id: string;
  email: string;
  nome: string;
  avatar_url: string;
  ultimo_acesso: string;
};

type Membro = { scrum_id: string; usuario_id: string; papel: string };
type Scrum = { id: string; nome: string; criador: string; estado: Json; revisao: number };
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { user } = useAccount();
  const cache = useQueryClient();
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState("demo");
  const [auth, setAuth] = useState(false);
  const [team, setTeam] = useState(false);
  const [account, setAccount] = useState(false);
  const [create, setCreate] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileName, setProfileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const [sim, setSim] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setDark(localStorage.getItem("scrumbao:theme") === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("scrumbao:theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    setSelected("demo");
    setAccount(false);
  }, [user?.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conviteId = params.get("convite");
    if (!conviteId) return;

    if (!user) {
      // Se não estiver logado, abre a tela de login
      setAuth(true);
    } else {
      // Se já estiver logado, aceita o convite automaticamente
      void run(async () => {
        const { data, error } = await supabase.rpc("scrumbao_aceitar", { p_convite: conviteId });
        // Limpa o ?convite= da URL para não repetir
        window.history.replaceState({}, "", window.location.pathname);
        if (error) throw error;
        if (data) setSelected(data);
      });
    }
  }, [user?.id]);

  const query = useQuery({
    queryKey: ["workspaces", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [s, m, p, c] = await Promise.all([
        supabase.from("scrums").select("*"),
        supabase.from("scrum_membros").select("*"),
        supabase.from("perfis").select("*"),
        supabase.from("convites").select("*"),
      ]);
      for (const result of [s, m, p, c]) if (result.error) throw result.error;
      return {
        scrums: s.data as Scrum[],
        membros: m.data as Membro[],
        perfis: p.data as Perfil[],
        convites: c.data ?? [],
      };
    },
  });
  const data = query.data;
  const current = data?.scrums.find((s) => s.id === selected);
  const own = data?.scrums.filter((s) => s.criador === user?.id) ?? [];
  const invited = data?.scrums.filter((s) => s.criador !== user?.id) ?? [];
  const creator = current?.criador === user?.id;
  const profile = data?.perfis.find((p) => p.id === user?.id);
  const members = data?.membros.filter((m) => m.scrum_id === selected) ?? [];
  const owner = data?.perfis.find((p) => p.id === current?.criador);
  const remaining = owner ? diasParaExclusao(owner.ultimo_acesso, Date.now()) : null;
  const pending = data?.convites.filter((c) => c.email === user?.email?.toLowerCase()) ?? [];
  const teamInvites = data?.convites.filter((c) => c.scrum_id === selected) ?? [];
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErro("");
    try {
      await fn();
      await cache.invalidateQueries({ queryKey: ["workspaces"] });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }
  async function newScrum(origem?: string) {
    await run(async () => {
      const demo = estadoDemo();
      const empty = { ...demo, itens: [], time: [], produto: nome };
      const { data, error } = await supabase.rpc("scrumbao_criar", {
        p_nome: origem ? `${current?.nome} (cópia)` : nome,
        p_estado: empty as unknown as Json,
        ...(origem ? { p_origem: origem } : {}),
      });
      if (error) throw error;
      setSelected(data);
      setCreate(false);
      setNome("");
    });
  }
  const workspace = current
    ? {
        id: current.id,
        revisao: current.revisao,
        estado: {
          ...(current.estado as unknown as ScrumState),
          time: members.map((m) => {
            const p = data?.perfis.find((p) => p.id === m.usuario_id);
            return `${p?.nome || p?.email || "Participante"} (${m.papel === "criador" ? "Criador" : "Convidado"})`;
          }),
        },
      }
    : undefined;
  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-foreground bg-primary text-primary-foreground">
        <div className="flex min-h-[76px] w-full flex-wrap items-center justify-between gap-3 pr-4">
          {/* Lado Esquerdo: Logo colado na borda + Título + Dropdown de Scrums */}
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <img
              src="/logo.png"
              alt="Scrumbão"
              className="h-[76px] w-[76px] aspect-square shrink-0 object-cover"
            />

            <div className="flex flex-col py-1">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
                Scrumbão
              </h1>
              <p className="text-xs opacity-90 hidden sm:block">
                {current?.nome ?? "App de receitas da vovó"}
              </p>
            </div>

            {/* Quando logado: o dropdown de Scrums e ações ficam aqui, ao lado do logo */}
            {user && (
              <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[260px] max-w-2xl py-1">
                <label className="min-w-0 flex-1 text-foreground">
                  <span className="sr-only">Selecionar Scrum</span>
                  <select
                    aria-label="Selecionar Scrum"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm font-medium"
                    value={selected}
                    onChange={(e) => {
                      setSelected(e.target.value);
                      setErro("");
                    }}
                  >
                    <option value="demo">Demonstração pública · App da vovó</option>
                    <optgroup label={`Meus Scrums (${own.length}/2)`}>
                      {own.map((s) => (
                        <option value={s.id} key={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={`Scrums onde participo (${invited.length}/2)`}>
                      {invited.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-foreground shrink-0"
                  disabled={!podeCriar(own.length) || busy}
                  onClick={() => setCreate(true)}
                  title="Criar novo Scrum"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Novo Scrum</span>
                </Button>

                {current && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-foreground shrink-0"
                    onClick={() => setTeam(true)}
                    title="Equipe do Scrum"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Equipe ({members.length}/6)
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Lado Direito: Tema Claro/Escuro + Perfil / Sair */}
          <div className="flex items-center gap-2 py-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-foreground"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline ml-1">{dark ? "Claro" : "Escuro"}</span>
            </Button>

            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 max-w-56 text-foreground gap-2"
                  onClick={() => {
                    setProfileName(profile?.nome ?? "");
                    setAvatar(profile?.avatar_url ?? "");
                    setAccount(true);
                  }}
                >
                  {profile?.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  <span className="truncate">{profile?.nome || user.email}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 text-foreground shrink-0"
                  aria-label="Sair"
                  title="Sair"
                  onClick={() =>
                    run(async () => {
                      await cache.cancelQueries();
                      cache.clear();
                      const { error } = await supabase.auth.signOut();
                      if (error) throw error;
                      setSelected("demo");
                    })
                  }
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="h-10 text-foreground"
                onClick={() => setAuth(true)}
              >
                Entrar / Criar conta
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4">
        {erro && (
          <p role="alert" className="mt-4 text-destructive">
            {erro}
          </p>
        )}
        {query.error && (
          <p role="alert" className="mt-4 text-destructive">
            Não foi possível carregar seus Scrums.{" "}
            <Button variant="link" onClick={() => query.refetch()}>
              Tentar novamente
            </Button>
          </p>
        )}
        {pending.length > 0 && (
          <section className="border-b py-4">
            <h2 className="font-display font-bold">Convites para você</h2>
            {pending.map((c) => (
              <div className="mt-2 flex flex-wrap items-center gap-3" key={c.id}>
                <span>Convite para participar de um Scrum</span>
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const { data, error } = await supabase.rpc("scrumbao_aceitar", {
                        p_convite: c.id,
                      });
                      if (error) throw error;
                      setSelected(data);
                    })
                  }
                >
                  Aceitar convite
                </Button>
              </div>
            ))}
          </section>
        )}
        {(remaining !== null || sim !== null) && (
          <section
            className="mt-4 flex flex-wrap items-center justify-between gap-3 border-2 border-label-urgent bg-label-urgent/10 p-4"
            role="alert"
          >
            <div>
              <b>
                {sim !== null ? "Simulação · " : ""}Faltam {remaining ?? sim} dia(s) para exclusão
              </b>
              <p className="text-sm">
                O criador está há {30 - (remaining ?? sim ?? 0)} dias sem acessar. Preserve o
                trabalho em uma cópia.
              </p>
            </div>
            {current && !creator ? (
              <Button
                disabled={busy || !podeCriar(own.length)}
                onClick={() => newScrum(current.id)}
              >
                <Copy />
                Clonar este Scrum na minha conta
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSim(null)}>
                Fechar simulação
              </Button>
            )}
          </section>
        )}
        {selected === "demo" && (
          <div className="border-b py-2 text-xs text-muted-foreground">
            App da Vovó é uma demonstração pública para treinamento e você pode fazer alterações. As
            modificações não serão salvas.
          </div>
        )}
      </div>
      {selected !== "demo" && !current ? (
        <div className="mx-auto max-w-7xl px-4 py-8">
          {query.isFetching ? (
            "Carregando Scrum…"
          ) : (
            <>
              <p>Este Scrum não está disponível.</p>
              <Button onClick={() => setSelected("demo")}>Voltar à demonstração</Button>
            </>
          )}
        </div>
      ) : (
        <ScrumProvider
          key={`${user?.id ?? "public"}:${selected}:${current?.revisao ?? 0}`}
          workspace={workspace}
        >
          <SyncStatus />
          {children}
        </ScrumProvider>
      )}
      <AccountDialog open={auth} onClose={() => setAuth(false)} />
      <Dialog open={create} onOpenChange={setCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo Scrum</DialogTitle>
            <DialogDescription>Meus Scrums: {own.length}/2</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void newScrum();
            }}
          >
            <label>
              Nome do produto
              <Input
                required
                maxLength={120}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Meu novo produto"
              />
            </label>
            <Button disabled={busy || !podeCriar(own.length)}>Criar Scrum</Button>
          </form>
          {erro && (
            <p role="alert" className="text-destructive">
              {erro}
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={account} onOpenChange={setAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minha conta</DialogTitle>
            <DialogDescription>{user?.email}</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                if (avatar && !/^https:\/\//i.test(avatar))
                  throw new Error("Use um link HTTPS para a foto.");
                const { error } = await supabase.rpc("scrumbao_conta", {
                  p_nome: profileName,
                  p_avatar: avatar,
                });
                if (error) throw error;
                setAccount(false);
              });
            }}
          >
            <label>
              Nome
              <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </label>
            <label>
              Link da foto
              <Input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://…"
              />
            </label>
            <Button disabled={busy}>Salvar perfil</Button>
          </form>
          {erro && <p role="alert">{erro}</p>}
        </DialogContent>
      </Dialog>
      <Dialog open={team} onOpenChange={setTeam}>
        <DialogContent className="max-h-[85dvh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Equipe · {members.length}/6</DialogTitle>
            <DialogDescription>{current?.nome}</DialogDescription>
          </DialogHeader>
          {members.map((m) => {
            const p = data?.perfis.find((p) => p.id === m.usuario_id);
            return (
              <div
                key={m.usuario_id}
                className="flex min-w-0 items-center justify-between gap-2 border-b py-2"
              >
                <div className="min-w-0">
                  <p className="break-words font-semibold">{p?.nome || p?.email}</p>
                  <p className="break-all text-xs text-muted-foreground">
                    {p?.email} · {m.papel}
                  </p>
                </div>
                {creator && m.papel === "convidado" && (
                  <Button
                    aria-label="Excluir participante"
                    title="Excluir participante"
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    onClick={() => {
                      if (confirm("Excluir este participante? Ele precisará de outro convite."))
                        void run(async () => {
                          const { error } = await supabase.rpc("scrumbao_remover", {
                            p_id: selected,
                            p_usuario: m.usuario_id,
                          });
                          if (error) throw error;
                        });
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            );
          })}
          {creator && (
            <>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const { error } = await supabase.rpc("scrumbao_convidar", {
                      p_id: selected,
                      p_email: email,
                    });
                    if (error) throw error;
                    setEmail("");
                  });
                }}
              >
                <label>
                  Convidar por e-mail
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <Button disabled={busy || members.length + teamInvites.length >= 6}>
                  Criar convite
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Convites aparecem na conta do destinatário ao entrar com esse e-mail. Envio de
                e-mail ainda não configurado.
              </p>
              {teamInvites.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-sm"
                >
                  <span className="break-all">{c.email} · pendente</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => {
                        const link = `${window.location.origin}/?convite=${c.id}`;
                        navigator.clipboard.writeText(link);
                        setCopiedId(c.id);
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                    >
                      {copiedId === c.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === c.id ? "Copiado!" : "Copiar link"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      aria-label="Cancelar convite"
                      title="Cancelar convite"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          const { error } = await supabase.rpc("scrumbao_remover", {
                            p_id: selected,
                            p_convite: c.id,
                          });
                          if (error) throw error;
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  creator
                    ? "Encerrar e excluir este Scrum permanentemente?"
                    : "Sair do Scrum? Você precisará de um novo convite para retornar.",
                )
              )
                void run(async () => {
                  const { error } = await supabase.rpc("scrumbao_remover", {
                    p_id: selected,
                    ...(!creator && user ? { p_usuario: user.id } : {}),
                  });
                  if (error) throw error;
                  setTeam(false);
                  setSelected("demo");
                });
            }}
          >
            {creator ? "Encerrar Scrum" : "Sair do Scrum"}
          </Button>
          {erro && (
            <p role="alert" className="text-destructive">
              {erro}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function SyncStatus() {
  const { privado, salvando, erro, recarregar } = useScrum();
  return privado ? (
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pt-3 text-sm">
      <span className="text-muted-foreground">
        {salvando
          ? "Salvando…"
          : erro
            ? "Alteração não salva"
            : "Scrum privado · salvo na sua conta"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        title="Recarregar quadro"
        aria-label="Recarregar quadro"
        disabled={salvando}
        onClick={recarregar}
      >
        <RefreshCw />
      </Button>
      {erro && (
        <p role="alert" className="text-destructive">
          {erro}
        </p>
      )}
    </div>
  ) : null;
}
