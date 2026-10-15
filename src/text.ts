export function normalizeName(name: string): string {
	return name.trim().toLocaleLowerCase();
}

export type DefaultWrapperTypes =
	| "straight-quote"
	| "thought"
	| "bold"
	| "underscore";

export type WrapperType = DefaultWrapperTypes | (string & {});

export interface DialogueWrapper {
	type: WrapperType;
	open: string;
	close: string;
	priority?: number;
}

const wrappers: readonly DialogueWrapper[] = [
	{ type: "straight-quote", open: "\"", close: "\"" },
	{ type: "thought", open: "(", close: ")" },
	{ type: "bold", open: "**", close: "**" },
	{ type: "underscore", open: "__", close: "__" },
];

export interface WrapperMatch {
	wrapperType: WrapperType;
	openLength: number;
	closeLength: number;
}

export function matchWrapper(
	text: string,
	allowed?: readonly WrapperType[],
	wrapperList: readonly DialogueWrapper[] = wrappers): WrapperMatch | null {
	const ordered = [...wrapperList].sort(
		(a, b) =>
			(a.priority ?? Number.MAX_SAFE_INTEGER)
			- (b.priority ?? Number.MAX_SAFE_INTEGER)
	);

	for (const wrapper of ordered) {
		if (allowed && !allowed.includes(wrapper.type)) { continue }
		const { open, close } = wrapper;
		if (text.length < open.length + close.length) { continue }

		if (!text.startsWith(open) || !text.endsWith(close)) { continue }

		return {
			wrapperType: wrapper.type,
			openLength: open.length,
			closeLength: close.length,
		};
	}

	return null;
}
