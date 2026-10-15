# Who Said What
Version 1.0.0; first release
## A lightweight Obsidian plugin for writing manuscripts and screenplays.

This is a barebones, informal way to write your story drafts down. Basically, its adding decorations and making things colourful, so you have an idea of what's going on from afar.

# Current Functionality
- Character editor command and ribbon button open the global character editor
- Add, edit, delete, and reorder characters with aliases and colours; changes saved in plugin settings
- Matching `Character: dialogue` lines receive CodeMirror decorations for character labels, quoted speech, and parenthesized thoughts when character data is present
- Character data is stored in plugin settings; the default list is empty

# Planned Functionality
- Add configurable dialogue wrappers and decoration styles
- Add different levels of setting storage so you can have per folder and per document character lists
- More speech bubble/dialogue types
- Option to highlight any cases of a character's name (incl. outside of dialogue)
- Automatic wrapping when you type the start of a line of dialogue, depending if its regular dialogue or thought
