const CACHE_UPDATE_TIME = 1*24*60*60*1000;
var selectedList = null;
var data = {};
var loadedData = null;
var parsedData = {
    "Factions": [],
    "Lists": [],
};
var PROFILE = {};
//IndexedDB link
var db;

const DEBUG = {
    errors:[],

};
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
            Timing:"",
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
            Keywords:"",
        },
        name: "Covering Fire",
        typeName: "Ability (Command)"
    },
    {
        chars:{
            Timing:"",
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
            Effect:": Inflict **D3 mortal damage** on the target. Then, the unit using this ability can move a distance up to its **Move** characteristic. It can pass through and end that move within the combat ranges of enemy units that were in combat with it at the start of the move, but not those of other enemy units. It does not have to end the move in combat",
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
            Declare:": Pick a friendly unit that has not used a **^^Run^^** or **^^Retreat^^** ability this turn to use this ability. Then, pick one or more enemy units as the target(s) of that unit’s attacks (see 16.0).",
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

document.addEventListener("DOMContentLoaded", init);

async function init(){
    await dbSetup();


    await loadCore();
    await loadRegimentsOfRenown();
    
    //load stored lists from cache
    loadExistingLists();

    const error = console.error.bind(console)
    console.error = (...args) => {
        //error logging
        if(args.length == 1){
            DEBUG.errors.push(args[0]);
        } else {
            DEBUG.errors.push(args);
        }
        document.getElementById("debugBtn").style.display = "";
        error(...args)
    }

}

function downloadDebugJson(){

    let link = document.createElement('a');
    link.setAttribute('download', 'AoSReminders_debug.json');
    link.href = makeTextFile(JSON.stringify({"ConsoleErrors":DEBUG.errors,"Lists":parsedData.Lists}));
    document.body.appendChild(link);

    window.requestAnimationFrame(function () {
        var event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
        alert("Please send the AoSReminders_debug.json in a message to the dev if you know him.");
    });
    
    
}

var textFile = null;
function makeTextFile (text) {
    var data = new Blob([text], {type: 'application/json'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
  };


function loadExistingLists(){
    //load existing lists from localStorage
    if(localStorage.getItem("Lists")){
        parsedData['Lists'] = JSON.parse(localStorage.getItem("Lists"));
        //get faction data for lists
        parsedData['Lists'].forEach(async (list)=>{
            await loadFaction(list.faction);
            linkListData(list);
            sortAbilitiesByPhase(list);
        });
        //fill the list selector
        fillListSelector();
        
    }
    
}


async function importArmyList(){
    //parse list in import textarea
    let newImportList = parseImportText();
    //load faction data
    console.log("newImportList",newImportList)
    await loadFaction(newImportList.faction);
    //repopulate the List selector
    selectedList = newImportList;
    fillListSelector();
    linkListData(newImportList);
    sortAbilitiesByPhase(newImportList);
    loadList();
}

function parseImportText(){
    let importListRaw = document.getElementById("ListImport").value.split('\n');
    //clear the import input
    document.getElementById("ListImport").value = "";
    //console.log("importListRaw",importListRaw);
    let importList = null;
    if(importListRaw[0].split("-").length > 1){
        console.log(importListRaw)
        importList = nrParse(importListRaw);
    }else{
        importList = gwParse(importListRaw);
        
    }
    return importList;
    
}

//for Army Lists generated by the New Recruit App
function nrParse(importListRaw){
    let importList = {
        "armyName":null,
        "faction":null,
        "battleFormation":null,
        "units":[],
        "regimentsOfRenown": [],
        "spellLore":null,
        "prayerLore":null,
        "manifestationLore":null,
        "parseErrors":[],
        "rawInput": importListRaw
    };
    for(let i = 0; i < importListRaw.length; i++){
        let row = importListRaw[i];
        
        //get Faction and Army Name
        if(!importList["faction"] && row.trim() != ""){
            let parts = row.split("-");
            importList["faction"] = parts[0].trim();
            importList["armyName"] = parts[1].trim();
            row = importListRaw[++i];
        }
        else if(row.includes("Battle Formation")){
            importList["battleFormation"] = row.split(":")[1].trim();
        }
        else if(row.includes("Manifestation Lore")){
            importList["manifestationLore"] = row.split(":")[1].trim();
        }
        else if(row.includes("Prayer Lore")){
            importList["prayerLore"] = row.split(":")[1].trim();
        }
        else if(row.includes("Spell Lore")){
            importList["spellLore"] = row.split(":")[1].trim();
        }
        else if(row.includes("FACTION TERRAIN")){
            row = importListRaw[++i];
            while(!row.includes('#')){
                if(row.trim() != ""){
                    importList["units"].push({unitName:row.trim(),abilities:[]});
                }
                row = importListRaw[++i];
            }
        }
        //add units
        else if(row.includes("]:")){
            let unitName = row.split("[")[0].trim();
            if(!isNaN(unitName[0])){
                let unitCount = parseInt(unitName[0]);
                unitName = unitName.slice(2).trim();
                for(let j = 1;j<unitCount;j++){
                    importList["units"].push({unitName,abilities:[]});
                }
            }
            importList["units"].push({unitName,abilities:[]});
        }
        else if(row.includes("Regiments of Renown")){
            //get RoR name
            importList["regimentsOfRenown"].push({"name":row.split("++")[1].trim(),"units":[]});
            //loop through till end of input here
            for(++i; i < importListRaw.length; i++){
                row = importListRaw[i];
                //add RoR units to last added RoR
                if(row.includes("]:")){
                    let unitName = row.split("[")[0].trim();
                    if(!isNaN(unitName[0])){
                        unitName = unitName.slice(2).trim();
                    }
                    importList["regimentsOfRenown"][importList["regimentsOfRenown"].length-1]["units"].push({unitName,abilities:[]});
                }
                else if(row.includes("HERO")){
                    row = importListRaw[++i];
                    while(!row.includes('#')){
                        if(row.trim() != ""){
                            importList["regimentsOfRenown"][importList["regimentsOfRenown"].length-1]["units"].push({unitName:row.split(":")[0].trim(),abilities:[]});
                        }
                        row = importListRaw[++i];
                    }
                }
                else if(row.includes(":") && !row.includes("•")){
                    let unitName = row.split(":")[0].trim();
                    importList["regimentsOfRenown"][importList["regimentsOfRenown"].length-1]["units"].push({unitName,abilities:[]});
                }
            }
        }

    }
    updateListStorage(importList);
    return importList;
}

//for Army Lists generated by the Age of Sigmar Stormforge App
function gwParse(importListRaw){
    //init imported list
    let importList = {
        "armyName":null,
        "faction":null,
        "battleFormation":null,
        "units":[],
        "regimentsOfRenown": [],
        "spellLore":null,
        "prayerLore":null,
        "manifestationLore":null,
        "parseErrors":[],
        "rawInput": importListRaw
    };
    let RoRFinished = false;

    let maxParseLength = importListRaw.length - 4
    for(let i = 0; i < maxParseLength; i++){
        let row = importListRaw[i];
        if(row.includes("<mark>")){
            row = row.replace("<mark>","");
            row = row.replace("</mark>","");
        }
        //Get Army Name
        if(!importList["armyName"] && row.trim() != ""){
            importList["armyName"] = row.split('(')[0].trim();
            continue;
        }
        //Get Faction
        if(parsedData["Factions"].includes(row.trim().replace("Realm-lord","Realmlord"))){
            importList["faction"] = row;
            //Get Battle Formation
            row = importListRaw[++i];
            importList["battleFormation"] = row;

        }
        //Get Spell Lore name
        if(row.includes("Spell Lore")){
            let spellLore = row.split("-")[1].trim();
            importList["spellLore"] = {name:spellLore,abilities:[]};
        }
        //Get Prayer Lore name
        if(row.includes("Prayer Lore")){
            let prayerLore = row.split("-")[1].trim();
            importList["prayerLore"] = {name:prayerLore,abilities:[]};
        }
        //Get Manifestation Lore name
        if(row.includes("Manifestation Lore")){
            let manifestationLore = row.split("-")[1].trim();
            importList["manifestationLore"] = {name:manifestationLore,abilities:[]};
        }
        //Get Unit name
        if(row.includes("(")){
            let unitName = row.split("(")[0].trim();
            importList["units"].push({unitName,abilities:[]});
        }
        //Get Unit Enhancements
        if(row.includes('•')){
            //add to last added unit
            if(!importList["units"][importList["units"].length-1]["enhancements"])importList["units"][importList["units"].length-1]["enhancements"] = {};
            importList["units"][importList["units"].length-1]["enhancements"][row.split('•')[1].trim()] = {};
        }
        //Get Regiment of Renown - at end of list - loop through remaining rows - [RoR name]=[...RoR units]
        if(row.includes('Regiments of Renown') && !RoRFinished){
            i++;
            RoRFound = true;
            //add to unit - do later
            let regex = /[0-9]+/
            for(i;i<maxParseLength;i++){
                row = importListRaw[i];
                if(row.includes("Faction Terrain")){
                    RoRFinished = true;
                    break;
                }
                //get RoR name
                if(regex.test(row) === true){
                    importList["regimentsOfRenown"].push({"name":row.replace(regex,"").trim(),"units":[]});
                }else if(row.trim() != ""){
                    //add RoR units to last added RoR
                    importList["regimentsOfRenown"][importList["regimentsOfRenown"].length-1]["units"].push({"unitName":row,abilities:[]});
                }
                
                
            }
        }
        
        if(row.includes('Faction Terrain')){
            i++;
            //faction terrain
            for(i;i<maxParseLength;i++){
                row = importListRaw[i];
                if(row.trim() == "") continue;
                importList["units"].push({unitName:row,abilities:[]});
            }
        }
    }
   
    //store the list(s) in local storage
    updateListStorage(importList);
    //console.log("importList",importList);

    return importList;
}



function loadImportText(){
    if(!selectedList)return;
    
    document.getElementById("ListImport").value = selectedList.rawInput.join('\n');
    
}

function fillListSelector(){
    console.log("filling list selector")
    let listSelector = document.getElementById("listSel");
    
    listSelector.innerHTML = "";
    listSelector.appendChild(document.createElement("OPTION"));
    parsedData["Lists"].forEach((list,idx)=>{
        let opt = document.createElement("OPTION");
        opt.value = idx;
        opt.innerHTML = list.armyName;
        listSelector.appendChild(opt);
        if(selectedList && selectedList.armyName == list.armyName){
            listSelector.value = idx;
        }
    })
}

function loadList(listIdx = null){
    if(listIdx){
        let list = parsedData["Lists"][listIdx];
        selectedList = list;
    }//otherwise refresh list
    document.getElementById("ListImport").value = "";
    displayParseErrors(selectedList);

    displayAbilities(selectedList);
   
}

function displayParseErrors(list){
    let listView = document.getElementById("listView");
    listView.innerHTML = "";

    if(!list || !list?.parseErrors || list.parseErrors.length == 0)return;
    let h1 = document.createElement("h2");
    h1.innerHTML = "Parse Errors (check spelling)";
    listView.appendChild(h1);
    list.parseErrors.forEach(e=>{
        let p = document.createElement("p");
        p.innerHTML = e.msg;
        listView.appendChild(p);
    })
}

function displayAbilities(list){
    let phaseView = document.getElementById("phaseView");
    phaseView.innerHTML = "";
    if(!list)return;
    let factionTitle = document.createElement("h3");
    factionTitle.innerHTML = "Faction: " + list.faction;
    phaseView.appendChild(factionTitle);
    console.log("Displaying List: " + list.armyName);
    //should be all sorted and ready to display the Turn reminder
    Object.entries(list.phases).forEach(([phase,abilities])=>{
        let div = createPhaseDiv(phase,abilities);
        phaseView.appendChild(div);
    })
}

function createPhaseDiv(phase,abilities){
    //console.log(phase,abilities)
    let phaseDiv = document.createElement("div");
    let header = document.createElement("div");
    let body = document.createElement("div");
    phaseDiv.appendChild(header);
    phaseDiv.appendChild(body);


    let title = document.createElement("h1");
    
    

    if(phase == "your" || phase == "enemy"){
        Object.entries(abilities).forEach(([_phase,profiles])=>{
            let _abilities = profiles.Abilities;
            let _weapons = profiles.Weapons;
            if(_phase=="other"){
                if(_abilities.length>0)
                    console.log(phase + "_" + _phase,_abilities);
                if(_weapons?.length>0)
                    console.log(phase + "_" + _phase,_weapons);
                return;
            }
            if(_abilities.length > 0 || _weapons?.length > 0)
                phaseDiv.appendChild(createPhaseDiv(phase.slice(0,1).toUpperCase() + phase.slice(1) +" " +_phase,profiles));
        });
        
    }else if(phase != "other"){

        header.appendChild(title); 
        let _abilities = abilities;
        if(abilities?.Abilities != undefined){
            _abilities = abilities.Abilities;
        }
        _abilities.forEach(ability=>{
            let abilityDiv = createAbilityDiv(ability);
            if(abilityDiv)
                body.appendChild(abilityDiv);
        })
        let _weapons = abilities.Weapons;
        if(_weapons != undefined){
            _weapons.forEach(weapon=>{
                let weaponDiv = createAbilityDiv(weapon);
                if(weaponDiv)
                    body.appendChild(weaponDiv);
            })
        }

    }else{  
        
        Object.entries(abilities).forEach(([_phase,_abilities])=>{
            if(_abilities.length)console.log(phase+"_"+_phase,_abilities);
        })
        //console.log(phase,abilities);
    }
    while(phase.includes("_")){
        let i = phase.indexOf("_");
        phase = phase.slice(0,i) + " " + phase.slice(i+1,i+2).toUpperCase() + phase.slice(i+2);
    }

    title.innerHTML = phase.slice(0,1).toUpperCase() + phase.slice(1);


    
    return phaseDiv;
}

function createAbilityDiv(ability){
    let abilityDiv = document.createElement("div");
    let abTitle = document.createElement("span");
    abTitle.innerHTML = ability.name + " - " + ability.typeName;
    abilityDiv.appendChild(abTitle);

    let showWeapon = document.getElementById("showWeaponChk").checked;
    if(['Melee Weapon','Ranged Weapon'].includes(ability.typeName)){
        if(!showWeapon)return;
        abilityDiv.classList.add("weaponProfileDiv");
    }else{
        abilityDiv.classList.add("abilityDiv");
    }

    Object.entries(ability.chars).forEach(([key,value])=>{
        let div = createAbilityCharDiv(key,value);
        abilityDiv.appendChild(div);
    });
    let unitsDiv = document.createElement("div");
    let unTitle = document.createElement("label");
    unTitle.innerHTML = "Units";
    unitsDiv.appendChild(unTitle);
    ability.units?.forEach(unitIdx=>{
        let unit = null;
        if(typeof(unitIdx) == "string" && unitIdx?.slice(0,1) == 'r'){
            let ror_idx = unitIdx.slice(1).split('_')[0];
            unit = selectedList.regimentsOfRenown[ror_idx].units[unitIdx.split('_')[1]];
        }else{
            unit = selectedList.units[unitIdx];
        }
       
        let span = document.createElement("span");
        span.innerHTML = unit.unitName;
        unitsDiv.appendChild(span);
    })
    abilityDiv.appendChild(unitsDiv);
    return abilityDiv;
}

function createAbilityCharDiv(char,val){
    console.log(char,val)
    let div = document.createElement("div")
    let span = document.createElement("span");
    let label = document.createElement("label");
    label.innerHTML = char;
    //do any keyword "bolding"
    while(val.includes("**^^")){
        val = val.replace("**^^","<b>");
        val = val.replace("^^**","</b>");
    }
    //do listing
    while(val.includes("**")){
        val = val.replace("**","<b>");
        val = val.replace("**","</b>");
    }
    //do italicising
    while(val.includes("*")){
        val = val.replace("*","<i>");
        val = val.replace("*","</i>");
    }
    span.innerHTML=val;
    div.appendChild(label);
    div.appendChild(span);
    return div;
}


function removeSelectedList(listIdx = null){
    if(!listIdx){
        listIdx = document.getElementById("listSel").value;
    }
    let list = parsedData['Lists'][listIdx];
    if(confirm("Are you sure you want to delete ["+list.armyName+"]?")){
        //remove list from storage
        parsedData['Lists'].splice(listIdx,1);
        selectedList = null;
        //re-fill the list selector
        fillListSelector();
        //update storage
        updateListStorage();
        loadList();
    }
   
}

function updateListStorage(listUpdate = null){
    if(listUpdate){
        //check if this is a list update or a new list
        let existingListIndex = parsedData["Lists"].findIndex((list) => list.armyName == listUpdate.armyName);
        if(existingListIndex < 0){
            console.log("Adding List ["+listUpdate.armyName+"]");
            parsedData["Lists"].push(listUpdate);
        }else{
            console.log("Updating List["+listUpdate.armyName+"]");
            parsedData["Lists"][existingListIndex] = listUpdate;
        }
    }
    localStorage.setItem("Lists",JSON.stringify(parsedData['Lists']));
}

