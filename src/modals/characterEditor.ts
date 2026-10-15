import { Modal, Notice, Setting } from "obsidian";
import type { App } from "obsidian";
import type WhoSaidWhat from "../main";
import { normalizeName } from "../text";
import type { Character, CharacterData } from "../types";

const DEFAULT_COLOUR = "#676767";

export class CharacterEditorModal extends Modal {
	private characterData: CharacterData = {
		version: 1,
		characters: [],
	};
	private isSaving = false;

	constructor(
		app: App,
		private readonly plugin: WhoSaidWhat
	) {
		super(app);
	}

	onOpen(): void {
		this.setTitle("Characters");
		this.modalEl.addClass("character-editor-modal");
		this.characterData = {
			version: 1,
			characters: this.plugin.settings.characterData.characters.map(
				(character) => ({
					...character,
					aliases: [...character.aliases],
				})
			),
		};
		this.render();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private render(): void {
		this.contentEl.empty();
		this.contentEl.createDiv({
			cls: "character-editor-path",
			text: "Stored globally in plugin settings.",
		});

		const list = this.contentEl.createDiv({
			cls: "character-editor-list",
		});

		if (this.characterData.characters.length === 0) {
			list.createEl("p", {
				text: "No characters.",
				cls: "character-editor-empty",
			});
		}

		this.characterData.characters.forEach((character, index) => {
			this.renderCharacter(list, character, index);
		});

		this.renderActions();
	}

	private renderCharacter(
		container: HTMLElement,
		character: Character,
		index: number
	): void {
		const card = container.createDiv({
			cls: "character-editor-card",
		});
		this.setCardColour(card, character.colour);

		const heading = card.createEl("h3", {
			text: character.name.trim() || `Character ${index + 1}`,
			cls: "character-editor-heading",
		});
		const body = card.createDiv({
			cls: "character-editor-body",
		});
		const fields = body.createDiv({
			cls: "character-editor-fields",
		});

		new Setting(fields)
			.setName("Name")
			.addText((text) => {
				text
					.setPlaceholder("Character name")
					.setValue(character.name)
					.setDisabled(this.isSaving)
					.onChange((value) => {
						character.name = value;
						heading.setText(value.trim() || `Character ${index + 1}`);
					});
			});

		new Setting(fields)
			.setName("Aliases")
			.addText((text) => {
				text
					.setPlaceholder("Alias 1, Alias 2")
					.setValue(character.aliases.join(", "))
					.setDisabled(this.isSaving)
					.onChange((value) => {
						character.aliases = value
							.split(",")
							.map((alias) => alias.trim())
							.filter(Boolean);
					});
			});

		const colourSetting = new Setting(fields).setName("Colour");
		let colourTextInput: HTMLInputElement | null = null;

		colourSetting.addColorPicker((picker) => {
			picker
				.setValue(this.toPickerColour(character.colour))
				.setDisabled(this.isSaving)
				.onChange((value) => {
					character.colour = value;
					if (colourTextInput) {
						colourTextInput.value = value;
					}
					this.setCardColour(card, value);
				});
		});
		colourSetting.addText((text) => {
			colourTextInput = text.inputEl;
			text
				.setPlaceholder(DEFAULT_COLOUR)
				.setValue(character.colour)
				.setDisabled(this.isSaving)
				.onChange((value) => {
					character.colour = value.trim();
					this.setCardColour(card, character.colour);
				});
		});

		const controls = body.createDiv({
			cls: "character-editor-controls",
		});
		new Setting(controls)
			.addButton((button) => {
				button
					.setIcon("arrow-up")
					.setTooltip("Move up")
					.setDisabled(this.isSaving || index === 0)
					.onClick(() => this.moveCharacter(index, -1));
			})
			.addButton((button) => {
				button
					.setIcon("arrow-down")
					.setTooltip("Move down")
					.setDisabled(
						this.isSaving ||
						index === this.characterData.characters.length - 1
					)
					.onClick(() => this.moveCharacter(index, 1));
			})
			.addButton((button) => {
				button
					.setIcon("trash")
					.setTooltip("Delete")
					.setWarning()
					.setDisabled(this.isSaving)
					.onClick(() => this.deleteCharacter(index));
			});
	}

	private renderActions(): void {
		const actions = new Setting(this.contentEl);
		actions.settingEl.addClass("character-editor-actions");

		actions.addButton((button) => {
			button
				.setButtonText("Add")
				.setIcon("plus")
				.setDisabled(this.isSaving)
				.onClick(() => this.addCharacter());
		});
		actions.addButton((button) => {
			button
				.setButtonText("Cancel")
				.setDisabled(this.isSaving)
				.onClick(() => this.close());
		});
		actions.addButton((button) => {
			button
				.setButtonText(this.isSaving ? "Saving..." : "Save")
				.setCta()
				.setDisabled(this.isSaving)
				.onClick(() => void this.saveCharacters());
		});
	}

	private addCharacter(): void {
		this.characterData.characters.push({
			id: Math.max(0, ...this.characterData.characters.map(({ id }) => id)) + 1,
			name: this.createAvailableName(),
			aliases: [],
			colour: DEFAULT_COLOUR,
		});
		this.render();
	}

	private deleteCharacter(index: number): void {
		this.characterData.characters.splice(index, 1);
		this.render();
	}

	private moveCharacter(index: number, direction: -1 | 1): void {
		const destination = index + direction;
		if (destination < 0 || destination >= this.characterData.characters.length) {
			return;
		}

		const [character] = this.characterData.characters.splice(index, 1);
		if (character) {
			this.characterData.characters.splice(destination, 0, character);
			this.render();
		}
	}

	private async saveCharacters(): Promise<void> {
		if (this.isSaving) {
			return;
		}

		const validationError = this.validateCharacters();
		if (validationError) {
			new Notice(validationError);
			return;
		}

		this.isSaving = true;
		this.render();

		const characterData: CharacterData = {
			version: 1,
			characters: this.characterData.characters.map((character) => ({
				...character,
				aliases: [...character.aliases],
			})),
		};

		try {
			await this.plugin.saveData({
				...this.plugin.settings,
				characterData,
			});
			this.plugin.settings.characterData = characterData;
			this.app.workspace.updateOptions();
			new Notice("Characters saved.");
			this.close();
		} catch (error) {
			this.isSaving = false;
			this.render();
			this.showError(error);
		}
	}

	private validateCharacters(): string | null {
		const usedNames = new Map<string, string>();

		for (const character of this.characterData.characters) {
			character.name = character.name.trim();
			character.colour = character.colour.trim();
			character.aliases = [...new Set(
				character.aliases.map((alias) => alias.trim()).filter(Boolean)
			)];

			if (!character.name) {
				return "Every character needs a name.";
			}
			if (!this.isValidColour(character.colour)) {
				return `Invalid colour for "${character.name}".`;
			}

			for (const name of [character.name, ...character.aliases]) {
				const normalizedName = normalizeName(name);
				const existingName = usedNames.get(normalizedName);
				if (existingName) {
					return `"${name}" is already used by "${existingName}".`;
				}
				usedNames.set(normalizedName, character.name);
			}
		}

		return null;
	}

	private createAvailableName(): string {
		const usedNames = new Set(
			this.characterData.characters.map(({ name }) => normalizeName(name))
		);
		let number = 1;

		while (usedNames.has(normalizeName(`Character ${number}`))) {
			number += 1;
		}

		return `Character ${number}`;
	}

	private toPickerColour(colour: string): string {
		return /^#[0-9a-f]{6}$/i.test(colour) ? colour : DEFAULT_COLOUR;
	}

	private isValidColour(colour: string): boolean {
		return colour.trim() !== "" && CSS.supports("color", colour);
	}

	private setCardColour(card: HTMLElement, colour: string): void {
		if (this.isValidColour(colour)) {
			card.style.setProperty("--character-colour", colour);
		}
	}

	private showError(error: unknown): void {
		const message = error instanceof Error
			? error.message
			: "Unable to save characters.";
		new Notice(message);
		console.error("[Who Said What]", message, error);
	}
}
