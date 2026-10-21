import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-C9YjoBKQ.mjs";
import { m as require_react, p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AccountContext-DMt19yKH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Context = (0, import_react.createContext)({
	user: null,
	loading: true
});
function AccountProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const cache = useQueryClient();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		let active = true;
		const sync = async () => {
			const { data } = await supabase.auth.getUser();
			if (!active) return;
			setUser(data.user);
			setLoading(false);
			if (data.user) await supabase.rpc("scrumbao_conta", {});
		};
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			if (![
				"SIGNED_IN",
				"SIGNED_OUT",
				"USER_UPDATED"
			].includes(event)) return;
			if (event === "SIGNED_OUT") {
				setUser(null);
				cache.clear();
			} else {
				sync();
				cache.invalidateQueries();
			}
			router.invalidate();
		});
		sync();
		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, [cache, router]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Context.Provider, {
		value: {
			user,
			loading
		},
		children
	});
}
var useAccount = () => (0, import_react.useContext)(Context);
//#endregion
export { useAccount as n, AccountProvider as t };
