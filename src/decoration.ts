import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, ViewPlugin, WidgetType } from "@codemirror/view";
import type { DecorationSet, EditorView, ViewUpdate } from "@codemirror/view";
import { parseDialogue } from "./dialogue";
import { matchWrapper, type WrapperType } from "./text";
import type { CharacterData } from "./types";

const RENDERED_WRAPPERS: WrapperType[] = ["straight-quote", "thought"];

class CharacterLabelWidget extends WidgetType {
	constructor(private readonly name: string) { super() }

	eq(other: CharacterLabelWidget): boolean { return this.name === other.name }

	toDOM(): HTMLElement {
		const label = document.createElement("span");
		label.className = "character-label";
		label.textContent = this.name;
		return label;
	}

	ignoreEvent(): boolean { return false }
}

export function createDialogueExtension(getCharacterData: () => CharacterData) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, getCharacterData());
			}

			update(update: ViewUpdate): void {
				if ( update.docChanged || update.viewportChanged || update.selectionSet || update.geometryChanged )
				{ this.decorations = buildDecorations(update.view, getCharacterData()) }
			}
		},

		{
			decorations: (instance) => instance.decorations,
			eventHandlers: { dblclick(event: MouseEvent, view: EditorView): boolean {
					if (!(event.target instanceof Element)) { return false }
					const dialogueLine = event.target.closest(".dialogue-line");
					if (!(dialogueLine instanceof HTMLElement)) { return false }

					const line = view.state.doc.lineAt(view.posAtDOM(dialogueLine));
					view.dispatch({ selection: {
							anchor: line.from,
							head: line.to < view.state.doc.length ? line.to + 1 : line.to,
						},
						scrollIntoView: true,
					});

					event.preventDefault();
					return true;
				},
			},
		}
	);
}

function buildDecorations(
	view: EditorView,
	characterData: CharacterData
): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	for (const visibleRange of view.visibleRanges) {
		let position = visibleRange.from;
		while (position <= visibleRange.to) {
			const line = view.state.doc.lineAt(position);
			const parsed = parseDialogue(line.text, characterData);
			if (parsed) {
				const dialogue = parsed.dialogue.trim();
				const wrapper = matchWrapper(dialogue, RENDERED_WRAPPERS);
				const isThought = wrapper?.wrapperType === "thought";
				const dialogueFrom = line.from + parsed.dialogueFrom;
				const dialogueTo = dialogueFrom + dialogue.length;

				builder.add(
					line.from,
					line.from,
					Decoration.line({
						class: isThought ? "dialogue-line thought-line" : "dialogue-line",
						attributes: {
							style: `--character-colour: ${parsed.character.colour};`,
							"data-dialogue-type": isThought ? "thought" : "spoken",
						},
					})
				);
				builder.add(
					line.from,
					line.from + parsed.nameTo,
					Decoration.replace({
						widget: new CharacterLabelWidget(parsed.character.name),
					})
				);

				if (wrapper) {
					const openingTo = dialogueFrom + wrapper.openLength;
					const closingFrom = dialogueTo - wrapper.closeLength;
					const decoration = isThought
						? Decoration.replace({})
						: Decoration.mark({ class: "dialogue-quote" });

					builder.add(dialogueFrom, openingTo, decoration);
					builder.add(closingFrom, dialogueTo, decoration);
				}
			}

			if (line.to >= visibleRange.to) {
				break;
			}

			position = line.to + 1;
		}
	}

	return builder.finish();
}
