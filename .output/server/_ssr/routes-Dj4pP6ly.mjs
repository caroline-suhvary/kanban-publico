import { n as __toESM } from "../_runtime.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { t as supabase } from "./client-C9YjoBKQ.mjs";
import { m as require_react, n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as Input, r as cn, t as Button } from "./input-BZBVMCdW.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as useAccount } from "./AccountContext-DMt19yKH.mjs";
import { _ as ChevronRight, a as Sun, b as ArrowUp, c as Plus, d as MessageCircle, f as LogOut, g as Copy, h as Flag, i as Trash2, l as Pencil, m as Lightbulb, n as Users, o as Rocket, p as Link2, r as User, s as RefreshCw, t as X, u as Moon, v as ChevronLeft, x as ArrowDown, y as Check } from "../_libs/lucide-react.mjs";
import { t as Label$1 } from "../_libs/radix-ui__react-label.mjs";
import { n as ProgressIndicator, t as Progress$1 } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dj4pP6ly.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ETIQUETAS = [
	{
		id: "bug",
		nome: "Bug",
		classe: "bg-label-bug/15 text-label-bug border-label-bug/30"
	},
	{
		id: "feature",
		nome: "Feature",
		classe: "bg-label-feature/15 text-label-feature border-label-feature/30"
	},
	{
		id: "design",
		nome: "Design",
		classe: "bg-label-design/15 text-label-design border-label-design/30"
	},
	{
		id: "urgente",
		nome: "Urgente",
		classe: "bg-label-urgent/15 text-label-urgent border-label-urgent/30"
	}
];
var COLUNAS = [
	{
		id: "afazer",
		titulo: "A fazer",
		dica: "Escolhido na Planning, ainda não começou."
	},
	{
		id: "fazendo",
		titulo: "Fazendo",
		dica: "Alguém do time está trabalhando nisso."
	},
	{
		id: "revisao",
		titulo: "Em revisão",
		dica: "Pronto para outra pessoa conferir."
	},
	{
		id: "feito",
		titulo: "Feito",
		dica: "Atende à Definição de Pronto."
	}
];
var PONTOS = [
	1,
	2,
	3,
	5,
	8,
	13
];
var contador = 0;
var novoId = () => `i${Date.now().toString(36)}${(contador++).toString(36)}`;
function scrumReducer(s, a) {
	switch (a.type) {
		case "ADICIONAR_ITEM": {
			const titulo = a.item.titulo.trim();
			if (!titulo) return s;
			return {
				...s,
				itens: [...s.itens, {
					...a.item,
					titulo,
					id: a.item.id ?? novoId(),
					coluna: null
				}]
			};
		}
		case "EDITAR_ITEM": return {
			...s,
			itens: s.itens.map((i) => i.id === a.id ? {
				...i,
				...a.dados
			} : i)
		};
		case "EXCLUIR_ITEM": return {
			...s,
			itens: s.itens.filter((i) => i.id !== a.id)
		};
		case "PRIORIZAR": {
			const backlog = s.itens.filter((i) => i.coluna === null);
			const idx = backlog.findIndex((i) => i.id === a.id);
			const alvo = backlog[a.direcao === "cima" ? idx - 1 : idx + 1];
			if (idx < 0 || !alvo) return s;
			const itens = [...s.itens];
			const x = itens.findIndex((i) => i.id === a.id);
			const y = itens.findIndex((i) => i.id === alvo.id);
			[itens[x], itens[y]] = [itens[y], itens[x]];
			return {
				...s,
				itens
			};
		}
		case "INICIAR_SPRINT": {
			if (s.sprint || a.ids.length === 0 || !a.meta.trim()) return s;
			const numero = s.historico.length + 1;
			return {
				...s,
				sprint: {
					numero,
					meta: a.meta.trim(),
					dias: a.dias,
					inicio: a.hoje
				},
				itens: s.itens.map((i) => a.ids.includes(i.id) && i.coluna === null ? {
					...i,
					coluna: "afazer"
				} : i),
				daily: []
			};
		}
		case "MOVER":
			if (!s.sprint) return s;
			return {
				...s,
				itens: s.itens.map((i) => i.id === a.id && i.coluna ? {
					...i,
					coluna: a.coluna
				} : i)
			};
		case "ENCERRAR_SPRINT": {
			if (!s.sprint) return s;
			const naSprint = s.itens.filter((i) => i.coluna !== null);
			const feitos = naSprint.filter((i) => i.coluna === "feito");
			const encerrada = {
				numero: s.sprint.numero,
				meta: s.sprint.meta,
				pontosPlanejados: naSprint.reduce((t, i) => t + i.pontos, 0),
				pontosEntregues: feitos.reduce((t, i) => t + i.pontos, 0),
				entregues: feitos.map((i) => i.titulo),
				retro: a.retro
			};
			return {
				...s,
				sprint: null,
				historico: [...s.historico, encerrada],
				itens: [...naSprint.filter((i) => i.coluna !== "feito").map((i) => ({
					...i,
					coluna: null
				})), ...s.itens.filter((i) => i.coluna === null)],
				daily: []
			};
		}
		case "REGISTRAR_DAILY":
			if (!s.sprint) return s;
			return {
				...s,
				daily: [a.registro, ...s.daily]
			};
		case "DEFINIR_TIME": return {
			...s,
			time: a.time.map((t) => t.trim()).filter(Boolean).slice(0, 6)
		};
		case "RESTAURAR": return a.estado;
		default: return s;
	}
}
/** velocidade média (pontos entregues por sprint) — ajuda a planejar a próxima */
function velocidade(h) {
	if (!h.length) return 0;
	return Math.round(h.reduce((t, x) => t + x.pontosEntregues, 0) / h.length);
}
var item = (titulo, etiquetas, pontos, responsavel, descricao = "", links = []) => ({
	id: novoId(),
	titulo,
	etiquetas,
	pontos,
	responsavel,
	descricao,
	links,
	coluna: null
});
function estadoDemo() {
	return {
		produto: "App de receitas da vovó",
		time: [
			"Carol (Product Owner)",
			"Bruno (Scrum Master)",
			"Ana (Dev)",
			"Diego (Dev)"
		],
		itens: [
			item("Como visitante, quero buscar receitas por ingrediente", ["feature"], 5, "Ana", "Campo de busca no topo da página inicial."),
			item("Como visitante, quero ver a foto e o passo a passo", ["feature", "design"], 3, "Diego", "", ["https://drive.google.com/"]),
			item("Corrigir acentos que somem no título", ["bug", "urgente"], 1, "Ana"),
			item("Como cozinheira, quero salvar receitas favoritas", ["feature"], 8, ""),
			item("Definir paleta de cores e logotipo", ["design"], 2, "Diego"),
			item("Como visitante, quero imprimir a receita", ["feature"], 3, "")
		],
		sprint: null,
		historico: [],
		daily: []
	};
}
/**
* ScrumContext — guarda o estado do Scrumbão (Context + useReducer).
* Nesta edição pública os dados ficam no navegador (localStorage):
* cada visitante tem seu próprio quadro de estudo, sem login.
* Na versão com Supabase, troque o "salvar/carregar" por chamadas ao banco.
*/
var CHAVE = "scrumbao:v1";
var Ctx = (0, import_react.createContext)(null);
function ScrumProvider({ children, workspace }) {
	const [s, rawDispatch] = (0, import_react.useReducer)(scrumReducer, workspace?.estado, (estado) => estado ?? estadoDemo());
	const [pronto, setPronto] = (0, import_react.useState)(false);
	const [salvando, setSalvando] = (0, import_react.useState)(false);
	const [erro, setErro] = (0, import_react.useState)("");
	const atual = (0, import_react.useRef)(s);
	const revisao = (0, import_react.useRef)(workspace?.revisao ?? 0);
	const ocupado = (0, import_react.useRef)(false);
	const recarregar = async () => {
		if (!workspace) return;
		const { data, error } = await supabase.from("scrums").select("estado,revisao").eq("id", workspace.id).single();
		if (error) {
			setErro(error.message);
			return;
		}
		const estado = {
			...data.estado,
			time: workspace.estado.time
		};
		atual.current = estado;
		revisao.current = data.revisao;
		rawDispatch({
			type: "RESTAURAR",
			estado
		});
		setErro("");
	};
	const dispatch = async (a) => {
		if (!workspace) {
			rawDispatch(a);
			return;
		}
		if (ocupado.current || erro || a.type === "DEFINIR_TIME" || a.type === "RESTAURAR") return;
		ocupado.current = true;
		setSalvando(true);
		const next = scrumReducer(atual.current, a);
		const { data, error } = await supabase.rpc("scrumbao_salvar", {
			p_id: workspace.id,
			p_estado: next,
			p_revisao: revisao.current
		});
		if (error) setErro(error.message);
		else {
			revisao.current = data;
			atual.current = next;
			rawDispatch({
				type: "RESTAURAR",
				estado: next
			});
		}
		ocupado.current = false;
		setSalvando(false);
	};
	(0, import_react.useEffect)(() => {
		if (workspace) {
			setPronto(true);
			return;
		}
		try {
			const salvo = localStorage.getItem(CHAVE);
			if (salvo) rawDispatch({
				type: "RESTAURAR",
				estado: JSON.parse(salvo)
			});
		} catch {}
		setPronto(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (pronto && !workspace) localStorage.setItem(CHAVE, JSON.stringify(s));
	}, [s, pronto]);
	const reiniciar = () => dispatch({
		type: "RESTAURAR",
		estado: estadoDemo()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value: {
			s,
			dispatch,
			pronto,
			reiniciar,
			privado: !!workspace,
			salvando,
			erro,
			recarregar
		},
		children
	});
}
function useScrum() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useScrum precisa do ScrumProvider");
	return v;
}
var LIMITES = {
	usuarios: 50,
	scrums: 100,
	criados: 2,
	convidados: 2,
	equipe: 6
};
function diasParaExclusao(ultimoAcesso, agora) {
	const dias = Math.floor((agora - Date.parse(ultimoAcesso)) / 864e5);
	return dias >= 25 && dias < 30 ? 30 - dias : null;
}
function podeCriar(quantidade) {
	return quantidade < LIMITES.criados;
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function AccountDialog({ open, onClose }) {
	const [signup, setSignup] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		setMessage("");
		try {
			const result = signup ? await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: window.location.origin,
					data: { full_name: name }
				}
			}) : await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (result.error) throw result.error;
			if (signup && !result.data.session) setMessage("Confira seu e-mail para confirmar a conta.");
			else onClose();
		} catch (e) {
			setMessage(e instanceof Error ? e.message : "Não foi possível entrar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: signup ? "Criar conta" : "Entrar no Scrumbão" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Seus Scrums privados, sua equipe." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						try {
							const { error } = await supabase.auth.signInWithOAuth({
								provider: "google",
								options: { redirectTo: window.location.origin }
							});
							if (error) setMessage(error.message);
						} finally {
							setBusy(false);
						}
					},
					children: "Continuar com Google"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3",
					onSubmit: submit,
					children: [
						signup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Nome", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: name,
							onChange: (e) => setName(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["E-mail", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							required: true,
							autoComplete: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Senha", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							required: true,
							minLength: 8,
							autoComplete: signup ? "new-password" : "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy,
							type: "submit",
							children: busy ? "Aguarde…" : signup ? "Criar conta" : "Entrar"
						})
					]
				}),
				!signup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "link",
					disabled: busy || !email,
					onClick: async () => {
						const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
						setMessage(error?.message ?? "Confira seu e-mail para redefinir a senha.");
					},
					children: "Esqueci minha senha"
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "text-sm",
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => {
						setSignup(!signup);
						setMessage("");
					},
					children: signup ? "Já tenho conta" : "Criar uma conta"
				})
			]
		})
	});
}
function WorkspaceShell({ children }) {
	const { user } = useAccount();
	const cache = useQueryClient();
	const [dark, setDark] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)("demo");
	const [auth, setAuth] = (0, import_react.useState)(false);
	const [team, setTeam] = (0, import_react.useState)(false);
	const [account, setAccount] = (0, import_react.useState)(false);
	const [create, setCreate] = (0, import_react.useState)(false);
	const [nome, setNome] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [avatar, setAvatar] = (0, import_react.useState)("");
	const [profileName, setProfileName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [erro, setErro] = (0, import_react.useState)("");
	const [sim, setSim] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setDark(localStorage.getItem("scrumbao:theme") === "dark");
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("dark", dark);
		localStorage.setItem("scrumbao:theme", dark ? "dark" : "light");
	}, [dark]);
	(0, import_react.useEffect)(() => {
		setSelected("demo");
		setAccount(false);
	}, [user?.id]);
	const query = useQuery({
		queryKey: ["workspaces", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const [s, m, p, c] = await Promise.all([
				supabase.from("scrums").select("*"),
				supabase.from("scrum_membros").select("*"),
				supabase.from("perfis").select("*"),
				supabase.from("convites").select("*")
			]);
			for (const result of [
				s,
				m,
				p,
				c
			]) if (result.error) throw result.error;
			return {
				scrums: s.data,
				membros: m.data,
				perfis: p.data,
				convites: c.data ?? []
			};
		}
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
	async function run(fn) {
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
	async function newScrum(origem) {
		await run(async () => {
			const empty = {
				...estadoDemo(),
				itens: [],
				time: [],
				produto: nome
			};
			const { data, error } = await supabase.rpc("scrumbao_criar", {
				p_nome: origem ? `${current?.nome} (cópia)` : nome,
				p_estado: empty,
				...origem ? { p_origem: origem } : {}
			});
			if (error) throw error;
			setSelected(data);
			setCreate(false);
			setNome("");
		});
	}
	const workspace = current ? {
		id: current.id,
		revisao: current.revisao,
		estado: {
			...current.estado,
			time: members.map((m) => {
				const p = data?.perfis.find((p) => p.id === m.usuario_id);
				return `${p?.nome || p?.email || "Participante"} (${m.papel === "criador" ? "Criador" : "Convidado"})`;
			})
		}
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b-2 border-foreground bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-extrabold",
							children: "Scrumbão"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: current?.nome ?? "App de receitas da vovó"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "text-foreground",
								onClick: () => setDark(!dark),
								children: [dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {}), dark ? "Claro" : "Escuro"]
							}), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "max-w-64 text-foreground",
								onClick: () => {
									setProfileName(profile?.nome ?? "");
									setAvatar(profile?.avatar_url ?? "");
									setAccount(true);
								},
								children: [profile?.avatar_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: profile.avatar_url,
									alt: "",
									className: "h-6 w-6 rounded-full object-cover"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: profile?.nome || user.email
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "icon",
								className: "text-foreground",
								"aria-label": "Sair",
								title: "Sair",
								onClick: () => run(async () => {
									await cache.cancelQueries();
									cache.clear();
									const { error } = await supabase.auth.signOut();
									if (error) throw error;
									setSelected("demo");
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {})
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "text-foreground",
								onClick: () => setAuth(true),
								children: "Entrar / Criar conta"
							})]
						})]
					}), user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "min-w-0 flex-1 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Selecionar Scrum"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									"aria-label": "Selecionar Scrum",
									className: "h-10 w-full max-w-xl rounded-md border border-input bg-background px-3",
									value: selected,
									onChange: (e) => {
										setSelected(e.target.value);
										setSim(null);
										setErro("");
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "demo",
											children: "Demonstração pública · App da vovó"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
											label: `Meus Scrums (${own.length}/2)`,
											children: own.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: s.id,
												children: s.nome
											}, s.id))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
											label: `Scrums onde participo (${invited.length}/2)`,
											children: invited.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: s.id,
												children: s.nome
											}, s.id))
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "text-foreground",
								disabled: !podeCriar(own.length) || busy,
								onClick: () => setCreate(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), "Criar novo Scrum"]
							}),
							current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "text-foreground",
								onClick: () => setTeam(true),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}),
									"Equipe (",
									members.length,
									"/6)"
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4",
				children: [
					erro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-4 text-destructive",
						children: erro
					}),
					query.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						role: "alert",
						className: "mt-4 text-destructive",
						children: ["Não foi possível carregar seus Scrums. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							onClick: () => query.refetch(),
							children: "Tentar novamente"
						})]
					}),
					pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "border-b py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-bold",
							children: "Convites para você"
						}), pending.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Convite para participar de um Scrum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy,
								onClick: () => run(async () => {
									const { data, error } = await supabase.rpc("scrumbao_aceitar", { p_convite: c.id });
									if (error) throw error;
									setSelected(data);
								}),
								children: "Aceitar convite"
							})]
						}, c.id))]
					}),
					(remaining !== null || sim !== null) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "mt-4 flex flex-wrap items-center justify-between gap-3 border-2 border-label-urgent bg-label-urgent/10 p-4",
						role: "alert",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
							sim !== null ? "Simulação · " : "",
							"Faltam ",
							remaining ?? sim,
							" dia(s) para exclusão"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								"O criador está há ",
								30 - (remaining ?? sim ?? 0),
								" dias sem acessar. Preserve o trabalho em uma cópia."
							]
						})] }), current && !creator ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy || !podeCriar(own.length),
							onClick: () => newScrum(current.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Clonar este Scrum na minha conta"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setSim(null),
							children: "Fechar simulação"
						})]
					}),
					selected === "demo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b py-3 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Demonstração pública · dados apenas neste navegador" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2",
							children: ["Inatividade do criador", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": "Simular inatividade",
								className: "rounded border border-input bg-background p-1 text-foreground",
								value: sim ?? "",
								onChange: (e) => setSim(e.target.value ? +e.target.value : null),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sem alerta"
								}), [
									5,
									4,
									3,
									2,
									1
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: n,
									children: [30 - n, " dias ausente"]
								}, n))]
							})]
						})]
					})
				]
			}),
			selected !== "demo" && !current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-7xl px-4 py-8",
				children: query.isFetching ? "Carregando Scrum…" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Este Scrum não está disponível." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setSelected("demo"),
					children: "Voltar à demonstração"
				})] })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrumProvider, {
				workspace,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncStatus, {}), children]
			}, `${user?.id ?? "public"}:${selected}:${current?.revisao ?? 0}`),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountDialog, {
				open: auth,
				onClose: () => setAuth(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: create,
				onOpenChange: setCreate,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Criar novo Scrum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
						"Meus Scrums: ",
						own.length,
						"/2"
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (e) => {
							e.preventDefault();
							newScrum();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Nome do produto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							maxLength: 120,
							value: nome,
							onChange: (e) => setNome(e.target.value),
							placeholder: "Meu novo produto"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy || !podeCriar(own.length),
							children: "Criar Scrum"
						})]
					}),
					erro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "text-destructive",
						children: erro
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: account,
				onOpenChange: setAccount,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Minha conta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: user?.email })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (e) => {
							e.preventDefault();
							run(async () => {
								if (avatar && !/^https:\/\//i.test(avatar)) throw new Error("Use um link HTTPS para a foto.");
								const { error } = await supabase.rpc("scrumbao_conta", {
									p_nome: profileName,
									p_avatar: avatar
								});
								if (error) throw error;
								setAccount(false);
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Nome", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: profileName,
								onChange: (e) => setProfileName(e.target.value)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Link da foto", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "url",
								value: avatar,
								onChange: (e) => setAvatar(e.target.value),
								placeholder: "https://…"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy,
								children: "Salvar perfil"
							})
						]
					}),
					erro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						children: erro
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: team,
				onOpenChange: setTeam,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[85dvh] overflow-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
							"Equipe · ",
							members.length,
							"/6"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: current?.nome })] }),
						members.map((m) => {
							const p = data?.perfis.find((p) => p.id === m.usuario_id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center justify-between gap-2 border-b py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-words font-semibold",
										children: p?.nome || p?.email
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "break-all text-xs text-muted-foreground",
										children: [
											p?.email,
											" · ",
											m.papel
										]
									})]
								}), creator && m.papel === "convidado" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									"aria-label": "Excluir participante",
									title: "Excluir participante",
									variant: "ghost",
									size: "icon",
									disabled: busy,
									onClick: () => {
										if (confirm("Excluir este participante? Ele precisará de outro convite.")) run(async () => {
											const { error } = await supabase.rpc("scrumbao_remover", {
												p_id: selected,
												p_usuario: m.usuario_id
											});
											if (error) throw error;
										});
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})]
							}, m.usuario_id);
						}),
						creator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "grid gap-3",
								onSubmit: (e) => {
									e.preventDefault();
									run(async () => {
										const { error } = await supabase.rpc("scrumbao_convidar", {
											p_id: selected,
											p_email: email
										});
										if (error) throw error;
										setEmail("");
									});
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Convidar por e-mail", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value)
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: busy || members.length + teamInvites.length >= 6,
									children: "Criar convite"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Convites aparecem na conta do destinatário ao entrar com esse e-mail. Envio de e-mail ainda não configurado."
							}),
							teamInvites.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "break-all text-sm",
									children: [c.email, " · pendente"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									"aria-label": "Cancelar convite",
									disabled: busy,
									onClick: () => run(async () => {
										const { error } = await supabase.rpc("scrumbao_remover", {
											p_id: selected,
											p_convite: c.id
										});
										if (error) throw error;
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
								})]
							}, c.id))
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "destructive",
							disabled: busy,
							onClick: () => {
								if (confirm(creator ? "Encerrar e excluir este Scrum permanentemente?" : "Sair do Scrum? Você precisará de um novo convite para retornar.")) run(async () => {
									const { error } = await supabase.rpc("scrumbao_remover", {
										p_id: selected,
										...!creator && user ? { p_usuario: user.id } : {}
									});
									if (error) throw error;
									setTeam(false);
									setSelected("demo");
								});
							},
							children: creator ? "Encerrar Scrum" : "Sair do Scrum"
						}),
						erro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "text-destructive",
							children: erro
						})
					]
				})
			})
		]
	});
}
function SyncStatus() {
	const { privado, salvando, erro, recarregar } = useScrum();
	return privado ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pt-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: salvando ? "Salvando…" : erro ? "Alteração não salva" : "Scrum privado · salvo na sua conta"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				title: "Recarregar quadro",
				"aria-label": "Recarregar quadro",
				disabled: salvando,
				onClick: recarregar,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {})
			}),
			erro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-destructive",
				children: erro
			})
		]
	}) : null;
}
var PASSOS = [
	{
		t: "1. Product Backlog",
		d: "Lista de tudo que o produto precisa, em ordem de prioridade. Quem cuida é o Product Owner."
	},
	{
		t: "2. Sprint Planning",
		d: "O time escolhe itens do topo do backlog que cabem na sprint (1 a 4 semanas) e define uma Meta."
	},
	{
		t: "3. Sprint + Daily",
		d: "O time trabalha nos itens. Todo dia, 15 minutos: o que fiz, o que farei, o que me trava."
	},
	{
		t: "4. Sprint Review",
		d: "No fim, o time mostra o que ficou pronto. O que não ficou volta ao backlog."
	},
	{
		t: "5. Retrospectiva",
		d: "O time conversa sobre como trabalhou e escolhe uma melhoria. E começa a próxima sprint!"
	}
];
var PAPEIS = [
	{
		t: "Product Owner",
		d: "Decide O QUE fazer e em que ordem. Dono do backlog."
	},
	{
		t: "Scrum Master",
		d: "Garante que o Scrum funcione e remove impedimentos do time."
	},
	{
		t: "Desenvolvedores",
		d: "Decidem COMO fazer e entregam o trabalho a cada sprint."
	}
];
function Guia({ comecar }) {
	const { s, dispatch, reiniciar, privado } = useScrum();
	const [time, setTime] = (0, import_react.useState)(null);
	const lista = time ?? s.time;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl font-bold",
				children: "O ciclo do Scrum"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 grid gap-3 md:grid-cols-5",
				children: PASSOS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border-2 border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--color-foreground)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-bold",
						children: p.t
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: p.d
					})]
				}, p.t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: comecar,
				children: "Começar pelo Backlog →"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-6 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold",
				children: "Os 3 papéis"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: PAPEIS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-muted p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [p.t, ":"] }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: p.d
						})
					]
				}, p.t))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-2xl font-bold",
				children: ["Time deste Scrum ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-base text-muted-foreground",
					children: [
						"(até ",
						6,
						")"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: privado ? s.time.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-b py-2 text-sm",
					children: p
				}, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: lista[i] ?? "",
					placeholder: `Pessoa ${i + 1} (papel)`,
					onChange: (e) => {
						const n = [...lista];
						n[i] = e.target.value;
						setTime(n);
					}
				}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !time,
						onClick: () => {
							dispatch({
								type: "DEFINIR_TIME",
								time: lista
							});
							setTime(null);
						},
						children: "Salvar time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							if (confirm("Apagar tudo e voltar ao exemplo?")) {
								reiniciar();
								setTime(null);
							}
						},
						children: "Recomeçar exemplo"
					})]
				})] })
			})] })]
		})]
	});
}
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Label$1.displayName;
var vazio = {
	titulo: "",
	descricao: "",
	etiquetas: [],
	pontos: 3,
	responsavel: "",
	links: ""
};
function ItemDialog({ aberto, onFechar, item }) {
	const { s, dispatch } = useScrum();
	const [f, setF] = (0, import_react.useState)(vazio);
	const [erroLink, setErroLink] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (aberto) setF(item ? {
			...item,
			links: item.links.join("\n")
		} : vazio);
		setErroLink("");
	}, [aberto, item]);
	const salvar = () => {
		const links = f.links.split("\n").map((l) => l.trim()).filter(Boolean);
		if (links.some((l) => !/^https?:\/\//i.test(l))) return setErroLink("Links precisam começar com https://");
		const dados = {
			titulo: f.titulo.trim(),
			descricao: f.descricao,
			etiquetas: f.etiquetas,
			pontos: f.pontos,
			responsavel: f.responsavel,
			links
		};
		if (!dados.titulo) return;
		if (item) dispatch({
			type: "EDITAR_ITEM",
			id: item.id,
			dados
		});
		else dispatch({
			type: "ADICIONAR_ITEM",
			item: dados
		});
		onFechar();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: aberto,
		onOpenChange: (o) => !o && onFechar(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: item ? "Editar item" : "Novo item do backlog"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Dica: escreva como história de usuário — \"Como [quem], quero [o quê] para [por quê]\"." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "item-titulo",
								children: "Título"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "item-titulo",
								value: f.titulo,
								onChange: (e) => setF({
									...f,
									titulo: e.target.value
								}),
								placeholder: "Como visitante, quero..."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição / critérios de aceite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 2,
								value: f.descricao,
								onChange: (e) => setF({
									...f,
									descricao: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Story points (esforço, não horas)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: PONTOS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: f.pontos === p ? "default" : "outline",
									"aria-pressed": f.pontos === p,
									type: "button",
									onClick: () => setF({
										...f,
										pontos: p
									}),
									className: "h-9 w-9 p-0 font-display font-bold",
									children: p
								}, p))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Etiquetas" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1",
								children: ETIQUETAS.map((e) => {
									const on = f.etiquetas.includes(e.id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										"aria-pressed": on,
										type: "button",
										onClick: () => setF({
											...f,
											etiquetas: on ? f.etiquetas.filter((x) => x !== e.id) : [...f.etiquetas, e.id]
										}),
										className: cn("rounded border px-2 py-1 text-xs font-semibold", on ? e.classe : "border-border text-muted-foreground"),
										children: e.nome
									}, e.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Responsável" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: f.responsavel,
								onChange: (e) => setF({
									...f,
									responsavel: e.target.value
								}),
								className: "h-9 rounded-md border border-input bg-background px-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "— ninguém ainda —"
								}), s.time.map((t) => {
									const n = t.split(" (")[0] ?? t;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: n,
										children: t
									}, t);
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Links (Google Drive, OneDrive…) — um por linha" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									rows: 2,
									value: f.links,
									onChange: (e) => setF({
										...f,
										links: e.target.value
									}),
									placeholder: "https://drive.google.com/..."
								}),
								erroLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: erroLink
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onFechar,
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: salvar,
					disabled: !f.titulo.trim(),
					children: "Salvar"
				})] })
			]
		})
	});
}
function ItemCard({ item, prioridade, modo }) {
	const { dispatch } = useScrum();
	const [editando, setEditando] = (0, import_react.useState)(false);
	const idx = COLUNAS.findIndex((c) => c.id === item.coluna);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		draggable: modo === "sprint",
		onDragStart: (e) => e.dataTransfer.setData("text/plain", item.id),
		className: cn("group rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md", modo === "sprint" && "cursor-grab active:cursor-grabbing", item.coluna === "feito" && "opacity-60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					prioridade !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-xs font-bold text-muted-foreground",
						children: ["#", prioridade]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: cn("flex-1 text-sm font-medium leading-snug", item.coluna === "feito" && "line-through"),
						children: item.titulo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						title: "Story points: esforço estimado",
						className: "rounded-full bg-primary px-2 py-0.5 font-display text-xs font-bold text-primary-foreground",
						children: item.pontos
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-1",
				children: [
					item.etiquetas.map((e) => {
						const et = ETIQUETAS.find((x) => x.id === e);
						if (!et) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase", et.classe),
							children: et.nome
						}, e);
					}),
					item.responsavel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3" }), item.responsavel]
					}),
					item.links.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: l,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center gap-1 text-xs text-primary underline",
						title: l,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3 w-3" }), "link"]
					}, i))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center gap-1 opacity-70 group-hover:opacity-100",
				children: [
					modo === "backlog" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Subir prioridade",
						onClick: () => dispatch({
							type: "PRIORIZAR",
							id: item.id,
							direcao: "cima"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Descer prioridade",
						onClick: () => dispatch({
							type: "PRIORIZAR",
							id: item.id,
							direcao: "baixo"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {})
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Voltar coluna",
						disabled: idx <= 0,
						onClick: () => {
							const c = COLUNAS[idx - 1];
							if (c) dispatch({
								type: "MOVER",
								id: item.id,
								coluna: c.id
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Avançar coluna",
						disabled: idx >= COLUNAS.length - 1,
						onClick: () => {
							const c = COLUNAS[idx + 1];
							if (c) dispatch({
								type: "MOVER",
								id: item.id,
								coluna: c.id
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Editar",
						onClick: () => setEditando(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
					}),
					modo === "backlog" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						label: "Excluir",
						onClick: () => dispatch({
							type: "EXCLUIR_ITEM",
							id: item.id
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDialog, {
				aberto: editando,
				onFechar: () => setEditando(false),
				item
			})
		]
	});
}
function Btn({ label, children, ...p }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "ghost",
		size: "icon",
		...p,
		"aria-label": label,
		title: label,
		className: "h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5",
		children
	});
}
function Dica({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex gap-2 rounded-lg border border-accent-foreground/20 bg-accent px-3 py-2 text-sm text-accent-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children })]
	});
}
function Backlog({ irParaSprint }) {
	const { s, dispatch } = useScrum();
	const backlog = s.itens.filter((i) => i.coluna === null);
	const [novo, setNovo] = (0, import_react.useState)(false);
	const [sel, setSel] = (0, import_react.useState)([]);
	const [meta, setMeta] = (0, import_react.useState)("");
	const [dias, setDias] = (0, import_react.useState)(14);
	const [inicio, setInicio] = (0, import_react.useState)("");
	const pontosSel = backlog.filter((i) => sel.includes(i.id)).reduce((t, i) => t + i.pontos, 0);
	const vel = velocidade(s.historico);
	const iniciar = () => {
		dispatch({
			type: "INICIAR_SPRINT",
			meta,
			dias,
			ids: sel,
			hoje: inicio || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		});
		setSel([]);
		setMeta("");
		irParaSprint();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_340px]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-2xl font-bold",
						children: ["Product Backlog ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								"(",
								backlog.length,
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setNovo(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Novo item"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dica, { children: [
					"O ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Product Owner" }),
					" mantém esta lista em ordem de prioridade: o mais valioso fica no topo. Use ▲▼ para priorizar."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3",
					children: [backlog.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground",
						children: "Backlog vazio. Adicione o que o produto precisa."
					}), backlog.map((i, n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [!s.sprint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							className: "mt-4",
							checked: sel.includes(i.id),
							"aria-label": "Escolher para a sprint",
							onCheckedChange: (c) => setSel(c ? [...sel, i.id] : sel.filter((x) => x !== i.id))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
								item: i,
								prioridade: n + 1,
								modo: "backlog"
							})
						})]
					}, i.id))]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "h-fit rounded-xl border-2 border-foreground bg-secondary p-4 shadow-[4px_4px_0_0_var(--color-foreground)] lg:sticky lg:top-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: "Sprint Planning"
				}), s.sprint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm",
					children: [
						"A Sprint ",
						s.sprint.numero,
						" está em andamento. Encerre-a no quadro antes de planejar a próxima.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "link",
							className: "px-1",
							onClick: irParaSprint,
							children: "Ver quadro →"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground",
							children: "1. Marque os itens do backlog que o time consegue entregar. 2. Escreva a Meta. 3. Comece!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-card p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Itens escolhidos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: sel.length })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pontos escolhidos" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pontosSel })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Velocidade média do time" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: vel ? `${vel} pts` : "sem histórico" })]
								}),
								vel > 0 && pontosSel > vel * 1.2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-destructive",
									children: "Cuidado: mais pontos do que o time costuma entregar."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1",
							children: ["Meta da Sprint", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: meta,
								onChange: (e) => setMeta(e.target.value),
								placeholder: "Ex.: visitante consegue encontrar uma receita"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1",
							children: [
								"Duração",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									"aria-label": "Data de início da Sprint",
									value: inicio,
									onChange: (e) => setInicio(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: dias,
									onChange: (e) => setDias(+e.target.value),
									className: "h-9 rounded-md border border-input bg-background px-2",
									children: [
										7,
										14,
										21,
										28
									].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: d,
										children: [
											d / 7,
											" semana",
											d > 7 ? "s" : ""
										]
									}, d))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: iniciar,
							disabled: !sel.length || !meta.trim(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "h-4 w-4" }),
								"Iniciar Sprint ",
								s.historico.length + 1
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDialog, {
				aberto: novo,
				onFechar: () => setNovo(false)
			})
		]
	});
}
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress$1, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressIndicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Progress$1.displayName;
function SprintBoard({ irParaBacklog }) {
	const { s, dispatch } = useScrum();
	const [encerrar, setEncerrar] = (0, import_react.useState)(false);
	const [daily, setDaily] = (0, import_react.useState)(false);
	if (!s.sprint) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg rounded-xl border-2 border-dashed p-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold",
				children: "Nenhuma sprint em andamento"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "Vá ao Backlog, escolha os itens e faça a Sprint Planning."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				onClick: irParaBacklog,
				children: "Ir para o Backlog"
			})
		]
	});
	const naSprint = s.itens.filter((i) => i.coluna);
	const total = naSprint.reduce((t, i) => t + i.pontos, 0);
	const feitos = naSprint.filter((i) => i.coluna === "feito").reduce((t, i) => t + i.pontos, 0);
	const passados = Math.floor((Date.now() - new Date(s.sprint.inicio).getTime()) / 864e5);
	const restam = Math.max(0, s.sprint.dias - passados);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-display text-sm font-bold uppercase tracking-wider text-primary",
				children: [
					"Sprint ",
					s.sprint.numero,
					" · faltam ",
					restam,
					" dias"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-2xl font-bold",
				children: ["🎯 ", s.sprint.meta]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => setDaily(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), "Daily"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setEncerrar(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-4 w-4" }), "Encerrar Sprint"]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: total ? feitos / total * 100 : 0,
				className: "h-3 flex-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-display font-bold",
				children: [
					feitos,
					"/",
					total,
					" pts"
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dica, { children: [
			"O ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "time de desenvolvimento" }),
			" se auto-organiza: arraste os cards (ou use ◀ ▶) conforme o trabalho anda. Novos itens não entram no meio da sprint — vão para o backlog."
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4",
			children: COLUNAS.map((c) => {
				const itens = naSprint.filter((i) => i.coluna === c.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					onDragOver: (e) => e.preventDefault(),
					onDrop: (e) => {
						const id = e.dataTransfer.getData("text/plain");
						if (id) dispatch({
							type: "MOVER",
							id,
							coluna: c.id
						});
					},
					className: "flex min-w-0 flex-col rounded-xl border border-border bg-muted/40 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display font-bold",
							children: [
								c.titulo,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: itens.length
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-xs text-muted-foreground",
							children: c.dica
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-3",
							children: itens.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemCard, {
								item: i,
								modo: "sprint"
							}, i.id))
						})
					]
				}, c.id);
			})
		}),
		s.daily.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg font-bold",
				children: "Registros da Daily"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid gap-2 md:grid-cols-2",
				children: s.daily.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border bg-card p-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								d.pessoa,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: ["· ", d.data]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ontem:" }),
							" ",
							d.ontem
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hoje:" }),
							" ",
							d.hoje
						] }),
						d.impedimento && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-destructive",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Impedimento:" }),
								" ",
								d.impedimento
							]
						})
					]
				}, i))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyDialog, {
			aberto: daily,
			onFechar: () => setDaily(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EncerrarDialog, {
			aberto: encerrar,
			onFechar: () => setEncerrar(false),
			feitos,
			total
		})
	] });
}
function DailyDialog({ aberto, onFechar }) {
	const { s, dispatch } = useScrum();
	const [f, setF] = (0, import_react.useState)({
		pessoa: "",
		ontem: "",
		hoje: "",
		impedimento: ""
	});
	const salvar = () => {
		dispatch({
			type: "REGISTRAR_DAILY",
			registro: {
				...f,
				data: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")
			}
		});
		setF({
			pessoa: "",
			ontem: "",
			hoje: "",
			impedimento: ""
		});
		onFechar();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: aberto,
		onOpenChange: (o) => !o && onFechar(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display",
				children: "Daily Scrum (15 min)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Cada pessoa responde 3 perguntas. O Scrum Master ajuda a remover impedimentos." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: f.pessoa,
						onChange: (e) => setF({
							...f,
							pessoa: e.target.value
						}),
						className: "h-9 rounded-md border border-input bg-background px-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Quem está falando?"
						}), s.time.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t.split(" (")[0] }, t))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "O que fiz ontem?",
						value: f.ontem,
						onChange: (e) => setF({
							...f,
							ontem: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "O que vou fazer hoje?",
						value: f.hoje,
						onChange: (e) => setF({
							...f,
							hoje: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Algo está me travando? (opcional)",
						value: f.impedimento,
						onChange: (e) => setF({
							...f,
							impedimento: e.target.value
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: !f.pessoa || !f.hoje,
				onClick: salvar,
				children: "Registrar"
			}) })
		] })
	});
}
function EncerrarDialog({ aberto, onFechar, feitos, total }) {
	const { dispatch } = useScrum();
	const [r, setR] = (0, import_react.useState)({
		bom: "",
		melhorar: "",
		acao: ""
	});
	const salvar = () => {
		dispatch({
			type: "ENCERRAR_SPRINT",
			retro: r
		});
		setR({
			bom: "",
			melhorar: "",
			acao: ""
		});
		onFechar();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: aberto,
		onOpenChange: (o) => !o && onFechar(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-display",
				children: "Review + Retrospectiva"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Review:" }),
				" o time mostrou o que entregou (",
				feitos,
				" de ",
				total,
				" pontos). O que não está em \"Feito\" volta para o topo do backlog.",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Retrospectiva:" }),
				" como foi o jeito de trabalhar?"
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1",
						children: ["😊 O que funcionou bem?", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: r.bom,
							onChange: (e) => setR({
								...r,
								bom: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1",
						children: ["🤔 O que pode melhorar?", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							value: r.melhorar,
							onChange: (e) => setR({
								...r,
								melhorar: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1",
						children: ["🛠️ Uma ação para a próxima sprint", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: r.acao,
							onChange: (e) => setR({
								...r,
								acao: e.target.value
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onFechar,
				children: "Voltar"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: salvar,
				children: "Encerrar sprint"
			})] })
		] })
	});
}
function Historico() {
	const { s } = useScrum();
	const max = Math.max(1, ...s.historico.map((h) => h.pontosPlanejados));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-2xl font-bold",
				children: [
					"Sprints encerradas · velocidade média ",
					velocidade(s.historico),
					" pts"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dica, { children: [
				"A ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "velocidade" }),
				" é quantos pontos o time entrega por sprint. Ela ajuda a não prometer demais na próxima Planning."
			] }),
			s.historico.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Nenhuma sprint encerrada ainda."
			}),
			[...s.historico].reverse().map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-xl border-2 border-foreground bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-sm font-bold uppercase text-primary",
						children: ["Sprint ", h.numero]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-display text-lg font-bold",
						children: ["🎯 ", h.meta]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-3 flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-3 flex-1 rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-3 rounded-full bg-muted-foreground/30",
								style: { width: `${h.pontosPlanejados / max * 100}%` },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-3 rounded-full bg-primary",
									style: { width: `${h.pontosPlanejados ? h.pontosEntregues / h.pontosPlanejados * 100 : 0}%` }
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							h.pontosEntregues,
							"/",
							h.pontosPlanejados,
							" pts"
						] })]
					}),
					h.entregues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Entregue:" }),
							" ",
							h.entregues.join(" · ")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 grid gap-2 text-sm md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded bg-muted p-2",
								children: ["😊 ", h.retro.bom || "—"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded bg-muted p-2",
								children: ["🤔 ", h.retro.melhorar || "—"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded bg-muted p-2",
								children: ["🛠️ ", h.retro.acao || "—"]
							})
						]
					})
				]
			}, h.numero))
		]
	});
}
function App() {
	const { s, pronto } = useScrum();
	const [aba, setAba] = (0, import_react.useState)("guia");
	const abas = [
		{
			id: "guia",
			nome: "Como funciona"
		},
		{
			id: "backlog",
			nome: "Backlog"
		},
		{
			id: "sprint",
			nome: s.sprint ? `Sprint ${s.sprint.numero}` : "Sprint"
		},
		{
			id: "historico",
			nome: "Histórico"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-4 pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Etapas do Scrum",
				className: "flex flex-wrap gap-1 border-b border-border pb-3",
				children: abas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setAba(a.id),
					"aria-pressed": aba === a.id,
					variant: aba === a.id ? "default" : "ghost",
					children: a.nome
				}, a.id))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: cn("mx-auto max-w-7xl px-4 py-8 transition-opacity", !pronto && "opacity-0"),
			children: [
				aba === "guia" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guia, { comecar: () => setAba("backlog") }),
				aba === "backlog" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Backlog, { irParaSprint: () => setAba("sprint") }),
				aba === "sprint" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SprintBoard, { irParaBacklog: () => setAba("backlog") }),
				aba === "historico" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Historico, {})
			]
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) });
//#endregion
export { SplitComponent as component };
