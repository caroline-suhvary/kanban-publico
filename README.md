# Scrumbão — Scrum na prática

Aplicação pt-BR com demonstração pública do App de receitas da vovó e Scrums privados. Temas Claro e Neon, backlog, planning, daily, review, retrospectiva e histórico.

## Abrir no VS Code

1. Instale Node.js 22+ e Python 3. Abra a pasta extraída no VS Code.
2. Copie `.env.example` para `.env.local` e preencha URL e chave pública do seu serviço de contas.
3. No terminal execute `npm install` e `npm run dev -- --port 8080`.
4. Abra http://localhost:8080.

Execute `database/schema.sql` uma vez em um banco novo. Habilite e-mail/senha com confirmação de e-mail e cadastre os endereços de retorno (origens local e publicada, incluindo `/reset-password`). Nunca coloque chave administrativa em variável `VITE_`.

No Lovable, contas e dados usam Lovable Cloud. Google usa a integração gerenciada. Fora do Lovable, substitua a chamada gerenciada no AccountDialog por `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })` e configure o Google no seu serviço de contas: o broker Lovable não funciona em um domínio externo independente.

## Regras e persistência

- Demonstração: localStorage, sem gravar no banco, mesmo com conta conectada.
- Privados: 50 usuários, 100 Scrums, até 2 criados e 2 como convidado por pessoa, 6 membros por Scrum, incluindo criador.
- Só o criador convida, remove convidados e exclui o Scrum. Convidados podem sair e precisam de novo convite.
- Convites endereçados ao e-mail aparecem na conta correspondente; aceitação exige e-mail confirmado. Convites pendentes reservam vagas.
- Concluir sprint arquiva entregas e devolve pendências ao backlog. Dados completos de cards entregues ficam arquivados em `cards`; histórico resume pontos, entregas e retrospectiva.
- Alterações privadas são transacionais e verificam versão. Conflitos exigem recarregar antes de continuar para evitar sobrescrita.
- Banner aos 25–29 dias sem acesso do criador; demonstração permite simular. Convidados podem clonar o estado na própria conta respeitando o limite de criação.
- Perfil: nome e avatar por URL HTTPS. Links de anexos permanecem links, sem upload de arquivos.

## Ainda não ativado

Envio de convites por e-mail requer domínio remetente verificado. E-mails de inatividade e exclusão automática de contas aos 30 dias não foram agendados: o banner é suporte visual. Registros e usuários antigos não estão incluídos no ZIP recebido; eventual importação depende de exportação CSV/JSON.

## Testes e pacote

`npm test` executa testes. `npm run package:source -- /caminho/fora/do/projeto/scrumbao.zip` gera um arquivo independente, sem credenciais, dependências, Git ou resultados de compilação. Sem argumento, o destino é `/tmp/scrumbao.zip`. O ZIP é entregue fora do site; não há botões ou rotas de download na aplicação.

## Tecnologia e implantação

TanStack Start, TypeScript, React e Tailwind v4. Este não é o React/Vite puro do ZIP original. Use implantação compatível com TanStack Start e atualize os endereços de retorno de autenticação.
