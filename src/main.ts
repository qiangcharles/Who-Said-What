import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, PluginSettings } from "./settings";
import type { GlobalSettings } from "./settings";
import { createDialogueExtension } from "./decoration";
import { CharacterEditorModal } from "./modals/characterEditor";

export default class WhoSaidWhat extends Plugin {
	settings!: GlobalSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new PluginSettings(this.app, this));
		this.registerEditorExtension(
			createDialogueExtension(() => this.settings.characterData)
		);

		this.addCommand({
			id: "open-character-editor",
			name: "Edit characters",
			callback: () => new CharacterEditorModal(this.app, this).open(),
		});

		this.addRibbonIcon("message-square-heart", "Who said what?", (_evt: MouseEvent) => {
			new CharacterEditorModal(this.app, this).open();
		});
	}

	async loadSettings() {
		const savedSettings = (await this.loadData()) as Partial<GlobalSettings> | null;
		this.settings = {
			...DEFAULT_SETTINGS,
			...(savedSettings ?? {}),
		};
	}
}
