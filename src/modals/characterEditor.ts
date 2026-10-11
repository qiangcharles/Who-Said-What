import { App, Modal, TFile } from "obsidian";
import type WhoSaidWhat from "../main";

export class CharacterEditorModal extends Modal {
	constructor(
		app: App,
		private readonly plugin: WhoSaidWhat
	) {
		super(app);
	}

	onOpen() {
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
