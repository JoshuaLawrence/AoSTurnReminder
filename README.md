Single page Army List Parser and Ability/Command per phase reminder for Age of Sigmar 4th Edition

Import Army lists generated with the official app (new recruit lists untested) and list all the available abilities/commands available to Units per phase.

Currently working:
- Pulling and caching bsData for AoS 4th edition
- Importing and parsing Army Lists - parsing works for Faction Battle Traits, Battle Formations, Units, Faction specific enhancements and upgrades, Regiments of Renown Abilities and Units, Manifestation/Prayer/Spell Lores
- Sorting parsed abilities per Phase and displaying as cards with Units able to use said ability beneath.
- Core abilities and commands

ToDo (no specific order):
- Army Parsing - track unit keywords
- Core Rules Commands/Abilities - add unit keyword abilities to tracked abilities
- Move Passives to relevant Phases
- Manual setting of Timing for abilities missing them - store separately from list in case of re-importing

- Improved UI for desktop and Mobile/iPad
-- collapsable Phase containers
-- separate collapsable Ability/Command/Spell/Prayer/Manifestation/WeaponProfile containers
-- Tabs per ability type on each phase header (maybe all or maybe just passives and/or reactions)

