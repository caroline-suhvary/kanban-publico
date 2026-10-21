import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-C9YjoBKQ.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as Input, t as Button } from "./input-BZBVMCdW.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-CaolLgOm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Reset() {
	const [recovery, setRecovery] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery");
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-md px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-bold",
				children: "Nova senha"
			}),
			recovery ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 grid gap-4",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					const { error } = await supabase.auth.updateUser({ password });
					setMessage(error?.message ?? "Senha atualizada.");
					setBusy(false);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Nova senha", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "password",
					minLength: 8,
					required: true,
					value: password,
					onChange: (e) => setPassword(e.target.value)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy,
					children: "Salvar senha"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4",
				children: "Abra o link de recuperação enviado ao seu e-mail."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "link",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Voltar ao Scrumbão"
				})
			})
		]
	});
}
//#endregion
export { Reset as component };
