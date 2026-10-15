import { normalizeName } from "./text";
import type { Character, CharacterData } from "./types";

export interface DialogueCandidate {
	enteredName: string;
	dialogue: string;
	nameFrom: number;
	nameTo: number;
	dialogueFrom: number;
	dialogueTo: number;
}

export interface ParsedDialogue extends DialogueCandidate { character: Character }

export function parseLine(line: string): DialogueCandidate | null {
	const firstColon = line.indexOf(":");
	const rawName = line.slice(0, firstColon);
	const enteredName = rawName.trim();

	if (!/^\S[^:]*?:/.test(line)) { return null }

	const dialogueFrom = firstColon + 1;
	const afterColon = line.slice(dialogueFrom);
	const dialogue = afterColon.trimStart();
	const leadingWhitespace = afterColon.length - dialogue.length;

	return {
		enteredName,
		dialogue,
		nameFrom: 0,
		nameTo: firstColon + 1,
		dialogueFrom: dialogueFrom + leadingWhitespace,
		dialogueTo: line.length,
	};
}

export function parseDialogue(line: string, characterData: CharacterData): ParsedDialogue | null {
	const candidate = parseLine(line);
	if (!candidate) { return null }
	const normalizedEnteredName = normalizeName(candidate.enteredName);
	const character =
		characterData.characters.find((definition) => {
			if (normalizeName(definition.name) === normalizedEnteredName) { return true }
			return definition.aliases.some(
				(alias) => normalizeName(alias) === normalizedEnteredName
			);
		}) ?? null;

	if (!character) { return null }
	return { ...candidate, character };
}
