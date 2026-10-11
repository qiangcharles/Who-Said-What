import { App, PluginSettingTab } from 'obsidian';
import WhoSaidWhat from './main';

export type StorageMode = "globalSettings" | "plaintextHeader" | "hiddenJson"

export interface GlobalSettings {
	storageMode: StorageMode;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
	storageMode: 'globalSettings',
};

export class PluginSettings extends PluginSettingTab {
	constructor(app: App, private readonly plugin: WhoSaidWhat) {
		super(app, plugin);
	}
	display(): void {} // Older Obsidian typings require this
	getSettingDefinitions() {
		return [
			{
				name: "Storage mode",
				desc: "How character information is stored.",
				control: {
					type: "dropdown",
					key: "storageMode",
					defaultValue: "globalSettings",
					options: {
						globalSettings: "Global", // stored in plugin's data.json
						plaintextHeader: "Plaintext .md", // stored in a section of a .md file
						hiddenJson: "Hidden .json" // stored in a hidden .json in the folder of a .md
					}
				}
			}
		]
	}
}
