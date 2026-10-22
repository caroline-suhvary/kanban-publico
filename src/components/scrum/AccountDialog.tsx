import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      if (signup) {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (result.error) throw result.error;
        if (!result.data.session) {
          setMessage("Link de confirmação enviado para seu e-mail.");
        } else {
          onClose();
        }
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        onClose();
      }
    } catch (e) {
      setIsError(true);
      setMessage(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{signup ? "Criar conta" : "Entrar no Scrumbão"}</DialogTitle>
          <DialogDescription>Seus Scrums privados, sua equipe.</DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin },
              });
              if (error) {
                setIsError(true);
                setMessage(error.message);
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          Continuar com Google
        </Button>

        <form className="grid gap-3" onSubmit={submit}>
          {signup && (
            <label className="text-sm font-medium">
              Nome
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </label>
          )}
          <label className="text-sm font-medium">
            E-mail
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </label>
          <label className="text-sm font-medium">
            Senha
            <Input
              type="password"
              required
              minLength={8}
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </label>
          <Button disabled={busy} type="submit">
            {busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        {!signup && (
          <Button
            variant="link"
            className="text-xs"
            disabled={busy || !email}
            onClick={async () => {
              setBusy(true);
              setIsError(false);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: window.location.origin + "/reset-password",
                });
                if (error) throw error;
                setMessage("Link para redefinir sua senha enviado para seu e-mail.");
              } catch (err) {
                setIsError(true);
                setMessage(err instanceof Error ? err.message : "Erro ao solicitar redefinição.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Esqueci minha senha
          </Button>
        )}

        {message && (
          <div
            className={`rounded p-3 text-sm font-medium ${isError ? "bg-destructive/15 text-destructive" : "bg-green-500/15 text-green-600 dark:text-green-400"}`}
          >
            {message}
          </div>
        )}

        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => {
            setSignup(!signup);
            setMessage("");
            setIsError(false);
          }}
        >
          {signup ? "Já tenho conta" : "Criar uma conta"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
