import { normalizeName } from "./text";
import type { Character, CharacterData } from "./types";

export interface DialogueCandidate {
	enteredName: string;
	dialogue: string;
	nameTo: number;
	dialogueFrom: number;
}

export interface ParsedDialogue extends DialogueCandidate { character: Character }

export function parseLine(line: string): DialogueCandidate | null {
	const firstColon = line.indexOf(":");
	const enteredName = line.slice(0, firstColon).trim();

	if (!/^\S[^:]*?:/.test(line)) { return null }

	const dialogueFrom = firstColon + 1;
	const afterColon = line.slice(dialogueFrom);
	const dialogue = afterColon.trimStart();
	const leadingWhitespace = afterColon.length - dialogue.length;

	return {
		enteredName,
		dialogue,
		nameTo: firstColon + 1,
		dialogueFrom: dialogueFrom + leadingWhitespace,
	};
}

export function parseDialogue(line: string, characterData: CharacterData): ParsedDialogue | null {
	const candidate = parseLine(line);
	if (!candidate) { return null }
	const normalizedEnteredName = normalizeName(candidate.enteredName);
	const character =
		characterData.characters.find((character) =>
			normalizeName(character.name) === normalizedEnteredName
			|| character.aliases.some(
				(alias) => normalizeName(alias) === normalizedEnteredName
			)
		) ?? null;

	if (!character) { return null }
	return { ...candidate, character };
}
