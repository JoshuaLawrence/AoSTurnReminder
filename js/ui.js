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
            let manifestationLore = row.split(":")[1].trim();
            importList["manifestationLore"] = {name:manifestationLore,abilities:[]};
        }
        else if(row.includes("Prayer Lore")){
            let prayerLore = row.split(":")[1].trim();
            importList["prayerLore"] = {name:prayerLore,abilities:[]};
        }
        else if(row.includes("Spell Lore")){
            let spellLore = row.split(":")[1].trim();
            importList["spellLore"] = {name:spellLore,abilities:[]};
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
        
    }else {//if(phase != "other"){ display abilities with missing timings in own div at end

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

    }/*else{  
        console.log(phase,abilities);
    }*/
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
    let containerDiv = document.createElement("div");
    abilityDiv.appendChild(containerDiv);

    let showWeapon = document.getElementById("showWeaponChk").checked;
    if(['Melee Weapon','Ranged Weapon'].includes(ability.typeName)){
        if(!showWeapon)return;
        abilityDiv.classList.add("weaponProfileDiv");
    }else{
        abilityDiv.classList.add("abilityDiv");
    }

    Object.entries(ability.chars).forEach(([key,value])=>{
        let div = createAbilityCharDiv(key,value);
        containerDiv.appendChild(div);
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
    containerDiv.appendChild(unitsDiv);
    return abilityDiv;
}

function createAbilityCharDiv(char,val){
    let div = document.createElement("div")
    let span = document.createElement("span");
    let label = document.createElement("label");
    label.innerHTML = char;
    //do any keyword "bolding"
    while(val.includes("**^^")){
        val = val.slice(0,val.indexOf("**^^")) + val.slice(val.indexOf("**^^"),val.indexOf("^^**")).toUpperCase() + val.slice(val.indexOf("^^**"))
        val = val.replace("**^^","<b>");
        val = val.replace("^^**","</b>");
    }
    while(val.includes("^^")){
        val = val.replace("^^","<b>");
        val = val.replace("^^","</b>");
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
    //do line breakes
    while(val.includes("\n")){//
        val = val.replace("\n","<br>");
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

