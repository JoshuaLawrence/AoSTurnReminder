let coreAbilities = [
    {
        chars:{
            Timing:"Any Hero Phase",
            Declare:"Pick a friendly unit that is not in combat to use this ability.",
            Cost:"1",
            Effect:"Make 6 rally rolls of D6. For each 4+, you receive 1 rally point. Rally points can be spent in the following ways: For each rally point spent, **Heal (1)** that unit. You can spend a number of rally points equal to the Health characteristic of that unit to return a slain model to that unit. You can spend the rally points in any combination of the above. Unspent rally points are then lost.",
            Keywords:"",
        },
        name: "Rally",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Enemy Hero Phase",
            Declare:"Pick a friendly Wizard or Priest to use this ability.",
            Cost:"1",
            Effect:"That friendly unit can use a **Spell** or **Prayer ability** (as appropriate) as if it were your hero phase. If you do so, subtract 1 from **casting rolls** or **chanting rolls** made as part of that ability.",
            Keywords:"",
        },
        name: "Magical Intervention",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Enemy Movement Phase",
            Declare:"Pick a friendly unit that is not in combat to use this ability",
            Cost:"1",
            Effect:"Each model in that unit can move up to D6\" at move **cannot** pass through or end within the combat range of an enemy unit.",
            Keywords:"**^^Move^^**, **^^Run^^**",
        },
        name: "Redeploy",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Reaction: You declared a **^^Run^^**",
            UsedBy:"The unit using that **^^Run^^** ability",
            Cost:"1",
            Effect:"Do not make a **run roll** as part of that Run ability. Instead, add 6\" to that unit's **^^Move^^** characteristic to determine the distance each model in that unit can move as part of that **^^Run^^** ability.",
            Keywords:"",
        },
        name: "At the Double",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Enemy Shooting Phase",
            Declare:"Pick a friendly unit that is **not in combat** to use this ability.",
            Cost:"1",
            Effect:"Resolve **shooting attacks** for that unit, but all of the attacks must target the **nearest visible enemy** unit and you must subtract 1 from the **hit rolls** for those attacks.",
            Keywords:"**^^Shoot^^**, **^^Attack^^**",
        },
        name: "Covering Fire",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Enemy Charge Phase",
            Declare:"Pick a friendly unit that is **not in combat** to use this ability.",
            Cost:"2",
            Effect:"That unit can use a **^^Charge^^** ability as if it were your charge phase.",
            Keywords:"",
        },
        name: "Counter-Charge",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Reaction: You declared a **^^Charge^^** ability.",
            UsedBy:"The unit using that **^^Charge^^** ability.",
            Cost:"1",
            Effect:"You can re-roll the **charge roll**.",
            Keywords:"",
        },
        name: "Forward to Victory",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Reaction: You declared an **^^Attack^^** ability.",
            UsedBy:"The unit using that **^^Attack^^** ability",
            Cost:"1",
            Effect:"Add 1 to **hit rolls** for attacks made as part of that **^^Attack^^**  ability. This also affects weapons that have the **Companion** weapon ability.",
            Keywords:"",
        },
        name: "All-out Attack",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Reaction: Opponent declared an **^^Attack^^** ability.",
            UsedBy:"A unit targeted by that **^^Attack^^** ability",
            Cost:"1",
            Effect:"Add 1 to **save rolls** for that unit in this phase.",
            Keywords:"",
        },
        name: "All-out Defence",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"End of Any Turn",
            Declare:"Pick a friendly unit that charged this turn to use this ability, then you must pick an enemy unit in combat with it to be the target. The target must have a lower **Health** characteristic than the unit using this ability.",
            Cost:"1",
            Effect:"Inflict **D3 mortal damage** on the target. Then, the unit using this ability can move a distance up to its **Move** characteristic. It can pass through and end that move within the combat ranges of enemy units that were in combat with it at the start of the move, but not those of other enemy units. It does not have to end the move in combat",
            Keywords:"**^^Move^^**",
        },
        name: "Power Through",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"Your Movement Phase",
            Declare:"Pick a friendly unit that is **not in combat** to use this ability.",
            Effect:"That unit can move a distance up to its **Move** characteristic. That unit **cannot** move into combat during any part of that move.",
            Keywords:"**^^Core^^**, **^^Move^^**",
        },
        name: "Normal Move",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Your Movement Phase",
            Declare:"Pick a friendly unit that is **not in combat** to use this ability.",
            Effect:"Make a **run roll** of D6. That unit can move a distance up to its **Move** characteristic added to the **run roll**. That unit cannot move into combat during any part of that move.",
            Keywords:"**^^Core^^**, **^^Move^^**, **^^Run^^**",
        },
        name: "Run",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Your Movement Phase",
            Declare:"Pick a friendly unit that is **in combat** to use this ability.",
            Effect:"Inflict **D3 mortal damage** on that unit. That unit can move a distance up to its **Move** characteristic. That unit **can** move through the combat ranges of any enemy units but cannot end that move within an enemy unit’s combat range.",
            Keywords:"**^^Core^^**, **^^Move^^**, **^^Retreat^^**",
        },
        name: "Retreat",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Your Shooting Phase",
            Declare:"Pick a friendly unit that has not used a **^^Run^^** or **^^Retreat^^** ability this turn to use this ability. Then, pick one or more enemy units as the target(s) of that unit’s attacks (see 16.0).",
            Effect:"Resolve **shooting attacks** against the target unit(s).",
            Keywords:"**^^Core^^**, **^^Attack^^**, **^^Shoot^^**",
        },
        name: "Shoot",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Your Charge Phase",
            Declare:"Pick a friendly unit that is not in combat and has not used a **^^Run^^** or **^^Retreat^^** ability this turn to use this ability. Then, make a **charge roll** of 2D6.",
            Effect:"That unit can move a distance up to the value of the **charge roll**. That unit **can** move through the combat ranges of any enemy units and must end that move within ½\" of a visible enemy unit. If it does so, the unit using this ability has **charged**.",
            Keywords:"**^^Core^^**, **^^Move^^**, **^^Charge^^**",
        },
        name: "Charge",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Your Combat Phase",
            Declare:"Pick a friendly unit that is **in combat** or that **charged** this turn to use this ability. That unit can make a **pile-in move** (see 15.4). Then, if that unit is **in combat**, you must pick one or more enemy units as the target(s) of that unit’s attacks (see 16.0).",
            Effect:"Resolve **combat attacks** against the target unit(s).",
            Keywords:"**^^Core^^**, **^^Attack^^**, **^^Fight^^**",
        },
        name: "Fight",
        typeName: "Ability (Core)"
    },
    {
        chars:{
            Timing:"Deployment Phase",
            Declare:"Pick a **unit** from your army roster that has not been **deployed** to be the target.",
            Effect:"Set up the target unit wholly within friendly territory and more than 9\" from enemy territory. After you have done so, it has been **deployed**.",
            Keywords:"**^^Deploy^^**",
        },
        name: "Deploy Unit",
        typeName: "Ability (Activated)"
    },
    {
        chars:{
            Timing:"Deployment Phase",
            Declare:"Pick a friendly **faction terrain feature** that has not been **deployed** to be the target.",
            Effect:"Set up the target faction terrain feature wholly within friendly territory, more than 3\" from all objectives and other terrain features. After you have done so, it has been **deployed**.",
            Keywords:"**^^Deploy Terrain^^**",
        },
        name: "Deploy Faction Terrain",
        typeName: "Ability (Activated)"
    },
    {
        chars:{
            Timing:"Deployment Phase",
            Declare:"Pick a **regiment** from your army roster to be the target. No units in that regiment can have already been **deployed**.",
            Effect:"Keep using **^^Deploy^^** abilities without alternating until all units in that regiment have been **deployed**. You cannot pick units that are not in that regiment as the target of any of those **^^Deploy^^** abilities.",
            Keywords:"**^^Deploy^^**",
        },
        name: "Deploy Regiment",
        typeName: "Ability (Activated)"
    },
];