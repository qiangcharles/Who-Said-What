export interface Character {
	id: number;
	name: string;
	aliases: string[];
	colour: string;
}

export interface CharacterData {
	version: 1;
	characters: Character[]
}
