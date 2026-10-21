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
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (signup && !result.data.session) setMessage("Confira seu e-mail para confirmar a conta.");
      else onClose();
    } catch (e) {
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
              if (error) setMessage(error.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Continuar com Google
        </Button>

        <form className="grid gap-3" onSubmit={submit}>
          {signup && (
            <label>
              Nome
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          <label>
            E-mail
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Senha
            <Input
              type="password"
              required
              minLength={8}
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button disabled={busy} type="submit">
            {busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}
          </Button>
        </form>
        {!signup && (
          <Button
            variant="link"
            disabled={busy || !email}
            onClick={async () => {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/reset-password",
              });
              setMessage(error?.message ?? "Confira seu e-mail para redefinir a senha.");
            }}
          >
            Esqueci minha senha
          </Button>
        )}
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            setSignup(!signup);
            setMessage("");
          }}
        >
          {signup ? "Já tenho conta" : "Criar uma conta"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
