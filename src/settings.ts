import { PluginSettingTab } from "obsidian";
import type { App } from "obsidian";
import type WhoSaidWhat from "./main";
import type { CharacterData } from "./types";

export type StorageMode = "global" | "perDocument" | "perFolder"

export interface GlobalSettings {
	storageMode: StorageMode;
	characterData: CharacterData;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
	storageMode: "global",
	characterData: { version: 1, characters: [] }
};

export class PluginSettings extends PluginSettingTab {
	constructor(app: App, plugin: WhoSaidWhat) { super(app, plugin); }
	getSettingDefinitions() {
		return [
			{
				name: "Storage mode",
				desc: "How character information is stored.",
				control: {
					type: "dropdown" as const,
					key: "storageMode",
					defaultValue: "global",
					options: {
						global: "Global", // stored in plugin's data.json
						// perDocument: "Per document", // stored in a section of a .md file
						// perFolder: "Per folder" // stored in a hidden .json in the folder of a .md
					}
				}
			}
		]
	}
}
