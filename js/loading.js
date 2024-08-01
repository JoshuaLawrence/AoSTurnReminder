
async function dbSetup(){
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("AoSTR_DATA");
        request.onerror = (event) => {
            console.error("Why didn't you allow my web app to use IndexedDB?!",event);
            reject();
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
        request.onupgradeneeded = (event) => {
            db = event.target.result;
        
            const objectStore = db.createObjectStore("data", {autoIncrement: true});
            
            
            objectStore.createIndex("name", "name", { unique: true });
            
        }
    });
}

function dbSet(storeName, key, value) {
    return new Promise((resolve, reject) => {
        let result;
        const tx = db.transaction(storeName, 'readwrite');
        tx.oncomplete = _ => resolve(result);
        tx.onerror = event => reject(event.target.error);
        const store = tx.objectStore(storeName);
        const request = store.put({data: key, value: value});
        request.onsuccess = _ => result = request.result;
    });
}

function storeResourceInDB(resource_name,data){

    let resource = {"name":resource_name,"DT":new Date().getTime(),"data":data};
    // Store values in the newly created objectStore.
    const transaction = db.transaction(["data"], "readwrite");
    const dataObjectStore = transaction.objectStore("data");
   // console.log("Storing in DB",resource);
    dataObjectStore.add(resource);
}


function dbGet(storeName, key, value) {
    return new Promise((resolve, reject) => {
        let result;
        const tx = db.transaction([storeName], 'readwrite');
        tx.oncomplete = _ => resolve(result);
        tx.onerror = event => reject(event.target.error);
        const store = tx.objectStore(storeName);
        const index = store.index(key);
        const request = index.get(value);
        request.onsuccess = _ => result = request.result;
    });
}




async function loadResource(res_url,returnRaw){
    console.log("Fetching resource: " + res_url);
    let response = await fetch('https://raw.githubusercontent.com/BSData/age-of-sigmar-4th/main/'+res_url+'.cat');
    if(!response)return console.error("Failed to load " + decodeURI(res_url));
    let xmlRaw = await response.text();
    if(returnRaw)
        return xmlRaw;
    let parsedData = parseXml(xmlRaw);
    return parsedData;
}


async function loadXMLDataFromStorage(dataName){
    //console.log("attempting to load " + dataName)
    let _data = await dbGet("data","name",dataName);
    //console.log("loaded",_data)
    try{
        
        let now = new Date().getTime();
        //check if the data needs updating
        if(now-_data.DT > CACHE_UPDATE_TIME){
            console.log(dataName + " Data in Browser Storage is too old.");
            _data = null;
        }else{
            console.log("Loading "+dataName+" data from browser storage.");
            _data = parseXml(_data.data);
        }
    }catch(e){
        //console.log(e);
        _data = null;
    }
    //console.log("loaded",_data)
    
    return _data;
    
}

async function loadCore(force=false){
   
    let core = await loadXMLDataFromStorage("core");
   
    if(!core||force)
    {
        let response = await fetch("https://raw.githubusercontent.com/BSData/age-of-sigmar-4th/main/Age%20of%20Sigmar%204.0.gst");
        if(!response)return console.error("Failed to load Core Rules");
        let xmlRaw = await response.text();
        //console.log(blob);
        data.core = parseXml(xmlRaw);
        let jsonData = xmlRaw;
        localStorage.setItem("core",JSON.stringify({"DT":new Date().getTime(),"data":jsonData}));
        storeResourceInDB("core",jsonData);
        console.log("Fetched new Core data");
    }else{
        data.core = core;
    }
    console.log(data.core)
    let publications = data.core.querySelector("publications").children;
    parsedData["Factions"] = [];
    for(let i = 0; i < publications.length;i++){
        let pub = publications[i];
        let name = pub.attributes.name.value; 
        if(name.includes("Faction Pack")){
            let factionName = name.slice(14);
            parsedData["Factions"].push(factionName);
        }
    }
    //profile characteristics
    let profiles = data.core.querySelector("profileTypes").children;
    for(let i = 0; i < profiles.length;i++){
        let profile = profiles[i];
        let name = profile.attributes.name.value; 
        let id = profile.attributes.id.value;
        PROFILE[id] = {
            //id,
            name,
            "characteristics":{}
        };
        let characteristicTypes = profile.children[0].children;
        for(let j=0; j< characteristicTypes.length; j++){
            let charType = characteristicTypes[j];
            PROFILE[id]["characteristics"][charType.id] = charType.attributes.name.value;
        }
        //PROFILE[name] = PROFILE[id];

    }
    //get keywords
    //get general commands/abilities - link relevant keywords

}


async function loadRegimentsOfRenown(){
    let RoR = await loadXMLDataFromStorage("Regiments of Renown");
    if(RoR){
        data.RoR = RoR;
        loadRoRLibs();
        return;
    }
    let RoR_raw = await loadResource(encodeURI("Regiments of Renown"),true);
    RoR = parseXml(RoR_raw)
    //localStorage.setItem("Regiments of Renown",JSON.stringify({"DT":new Date().getTime(),"data":RoR_raw}));
    storeResourceInDB("Regiments of Renown",RoR_raw);
    data.RoR = RoR;
    loadRoRLibs();
    
}

function loadRoRLibs(){
    if(!data.RoR)return console.error("RoR data not loaded");
//let library data for each ror
    let libSources = data.RoR.querySelectorAll('[type="catalogue"]');
    libSources.forEach(async catLink=>{
        
        let resName = catLink.attributes.name.value;
        let faction = resName.split('-')[0].trim();
        let lib = await loadXMLDataFromStorage(faction+"_units");
        if(lib){
            if(!data[faction])data[faction] = {};

            data[faction].units = lib;
            return;
        }

        let res = await loadResource(encodeURI(resName),true);
        
        if(!data[faction])data[faction] = {};
        data[faction].units = parseXml(res);
        console.log(faction,res.length);
        storeResourceInDB(faction+"_units",res);
        //localStorage.setItem(faction+"_units",JSON.stringify({"DT":new Date().getTime(),"data":res}));
    })
}


async function loadFaction(faction = null, force=false){
    if(faction === null){
        faction = document.getElementById('FactionPicker').value;
    }
    let factionName = decodeURI(faction);
    if(data[factionName]?.rules)return console.log("Already have " + factionName + " in Cache.");

    let rules = await loadXMLDataFromStorage(factionName+"_rules");

    let units = await loadXMLDataFromStorage(factionName+"_units");
    if(!data[factionName])data[factionName] = {};
    if(rules){
        //console.log("rules",rules)
        data[factionName]["rules"] = rules;
    }
    if(units){
        //console.log("units",units)
        data[factionName]["units"] = units;
    }
    if(rules && units){
        return;
    }

    console.log("Retrieving BSData for " + factionName);

  

    if(!rules)rules = await loadResource(faction,true);
    if(!units)units = await loadResource(faction + '%20-%20Library',true);

    //console.log(blob);
    data[factionName] = {};
    data[factionName]["rules"] = parseXml(rules);
    data[factionName]["units"] = parseXml(units);
    await storeResourceInDB(factionName+"_rules",rules);
    await storeResourceInDB(factionName+"_units",units);
   
}



function parseXml(string){
    const parser = new DOMParser();
    const doc = parser.parseFromString(string,"application/xml");
    return doc;
}