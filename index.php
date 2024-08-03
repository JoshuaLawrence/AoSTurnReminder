<?php 


?>

<head>
    <link rel='stylesheet' href='/AoSTurnReminder/css/style.css'></link>
    <script src='/AoSTurnReminder/js/loading.js?version=1'></script>
    <script src='/AoSTurnReminder/js/parsing.js?version=1'></script>
    <script src='/AoSTurnReminder/js/ui.js?version=1'></script>
    
</head>
<body>
    <h1>AoS4 Turn Reminder</h1>
    <div style="display:flex; gap:10px;">
        <div id="importDiv">
            <textarea id="ListImport" cols="30" rows="30">
            </textarea>
            <br>
            <input type="button" value="Import" onclick="importArmyList();"/>
        </div>
        <div id="listContainer">
            <select id="listSel" style="width:150px;" onchange="loadList(this.value);">
            </select>
            <input type="button" value="X" onclick="removeSelectedList();" title="Delete selected list"/>
            <input type="button" value="<" onclick="loadImportText();" title="Load Import Text"/>
            <span>Show Weapon Profiles</span>
            <input id="showWeaponChk" type="checkbox" onchange="loadList()"/>
            <input id="debugBtn" type="button" value="Copy Errors to Clipboard" onclick="copyErrorsToClipboard()" style="display:none;">
            <br>
            <div id="listView">
            </div>
            <div id="phaseView">
            </div>
        </div>
    </div>
</body>
