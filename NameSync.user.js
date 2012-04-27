// ==UserScript==
// @namespace     milky
// @name          /b/ Name Sync
// @description   Shares your name with other posters on /b/. Also allows you to assign names to Anonymous posters.
// @author        milky
// @contributor   My Name Here
// @contributor   Macil
// @contributor   ihavenoface
// @contributor   Finer
// @include       http*://boards.4chan.org/b/*
// @updateURL     https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js
// @homepage      http://milkytiptoe.github.com/Name-Sync/
// @version       2.0.39
// ==/UserScript==

function addJQuery(a)
{
	var script = document.createElement("script");
	script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js");
	script.addEventListener('load', function() {
	var script = document.createElement("script");
	script.textContent = "(" + a.toString() + ")();";
	document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

function setUp()
{
	var optionsNames = ["Enable Sync", "Hide IDs", "Show Poster Options", "Cross-thread Links", "Append Errors", "Override Fields"];
	var optionsDescriptions = ["Share and download names online", "Hide IDs next to poster names", "Show poster options next to poster names", "Add >>>/b/ to cross-thread links on Ctrl+V", "Show sync errors inside the quick reply box", "Share these instead of the quick reply fields"];
	var optionsDefaults = ["true", "false", "true", "true", "false", "false"];

	var $Jq = jQuery.noConflict();
	var ver = "2.0.39";
	var website = "http://milkytiptoe.github.com/Name-Sync/";
	
	var names = new Array();
	var ids = new Array();

	var onlineNames = new Array();
	var onlineFiles = new Array();
	var onlineEmails = new Array();
	var onlineSubjects = new Array();
	
	var usedFilenames = [];
	
	var t = document.URL;
	t = t.replace(/^.*\/|\.[^.]*$/g, '');
	t = t.substring(0, 9);
	if (t.length < 9)
		t = "b";
		
	var lastFile = "";
	var canPost = true;
	
	// Options link and status html
	$Jq('form[name="delform"]').prepend("<span id='syncStatus' style='color: gray;'>Loading</span><br /><a id='optionsPopUp' href='#' style='text-decoration: none;' title='Open options'>Options</a><br /><br />");
	$Jq("#optionsPopUp").click(function () { showOptionsScreen(); });
	
	// Styles
	var asheet = document.createElement('style');
	document.body.appendChild(asheet);
	var bsheet = document.createElement('style');
	document.body.appendChild(bsheet);
	var csheet = document.createElement('style');
	csheet.innerHTML = "#optionsScreen ul li { margin-bottom: 2px; } #optionsScreen a#closeBtn { float: right; } #optionsScreen input[type='text'] { padding: 2px; width: 32%; margin-right: 2px; } #optionsScreen a { text-decoration: none; } #optionsOverlay { background-color: black; opacity: 0.5; z-index: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; } #optionsScreen h1 { font-size: 1.2em; } #optionsScreen h2 { font-size: 10pt; margin-top: 12px; margin-bottom: 12px; } #optionsScreen * { margin: 0; padding: 0; } #optionsScreen ul { list-style-type: none; } #optionsScreen { color: black; width: 400px; height: 400px; display: none; z-index: 1; background: url(http://nassign.heliohost.org/s/best_small.png?i="+new Date().getTime()+") no-repeat #f0e0d6; background-color: #f0e0d6; background-position: bottom right; padding: 12px; border: 1px solid rgba(0, 0, 0, 0.25); position: absolute; top: 50%; left: 50%; margin-top:-200px; margin-left:-200px; } .filetitle a, .replytitle a { text-decoration: none; } .filetitle a:hover, .replytitle a:hover { text-decoration: underline; }";
	document.body.appendChild(csheet);
	
	function showOptionsScreen()
	{
		$Jq("body").css("overflow", "hidden");
		var overlayDiv = document.createElement("div");
		overlayDiv.setAttribute("id", "optionsOverlay");
		document.body.appendChild(overlayDiv);

		var optionsDiv = document.createElement("div");
		optionsDiv.setAttribute("id", "optionsScreen");
		optionsDiv.innerHTML = "<h1>/b/ Name Sync<a href='#' id='closeBtn' title='Close options'>X</a></h1>"+ver+"<h2>Options</h2>";
		
		var optionsList = document.createElement("ul");
		
		// Load options 
		for (var i = 0; i < optionsNames.length; i++)
		{
			var checked = getOption(optionsNames[i]) == "true" ? 'checked' : '';
			optionsList.innerHTML += "<li><input type='checkbox' name='"+optionsNames[i]+"' "+checked+" /> <strong>"+optionsNames[i]+"</strong> "+optionsDescriptions[i]+"</li>";
		}
		
		optionsList.innerHTML += "<li><input type='text' id='bName' placeholder='Name' value='"+getOption("Name")+"' /> <input type='text' id='bEmail' placeholder='Email' value='"+getOption("Email")+"' /> <input type='text' id='bSubject' placeholder='Subject' value='"+getOption("Subject")+"' />";
		optionsDiv.appendChild(optionsList);		
		optionsDiv.innerHTML += "<h2>More</h2><ul><li><a href='https://raw.github.com/milkytiptoe/Name-Sync/master/changelog' target='_blank'>View changelog</a></li><li><a href='"+website+"' target='_blank'>View website</a></li><li id='updateLink'><a href='#'>Check for update</a></li></ul><br />";
		
		$Jq('input[type="checkbox"]').live("click", function() { setOption($Jq(this).attr("name"), String($Jq(this).is(":checked"))); });
		
		$Jq("#closeBtn").live("click", function() { hideOptionsScreen(); });
		overlayDiv.onclick = function() { hideOptionsScreen(); };
		document.body.appendChild(optionsDiv);
		
		$Jq("#bName").change(function() { setOption("Name", $Jq(this).val()); });
		$Jq("#bEmail").change(function() { setOption("Email", $Jq(this).val()); });
		$Jq("#bSubject").change(function() { setOption("Subject", $Jq(this).val()); });
		$Jq("#updateLink").click(function() { 
			$Jq(this).html("Checking...");
			$Jq.ajax({
				headers: {"X-Requested-With":"Ajax"},
				url: 'http://nassign.heliohost.org/s/u.php?v='+ver
			}).fail(function() {
				$Jq("#updateLink").html("Error checking for update");
			}).done(function(data) {
				$Jq("#updateLink").html(data);
			});
			
			$Jq(this).attr('onclick','').unbind('click');
		});
		
		$Jq("#optionsScreen").fadeIn("fast");
	}
	
	function hideOptionsScreen()
	{
		$Jq("#optionsScreen").remove();
		$Jq("#optionsOverlay").remove();
		$Jq("body").css("overflow", "visible");
	}
	
	function hideIds()
	{
		if (getOption("Hide IDs") == "true")
		{
			asheet.innerHTML = ".posteruid { display: none; }";
		}
		else
		{
			asheet.innerHTML = ".posteruid { display: inline; }";
		}
	}

	function hideOptions()
	{
		if (getOption("Show Poster Options") == "true")
		{
			bsheet.innerHTML = ".filetitle, .replytitle { display: inline; }";
		}
		else
		{
			bsheet.innerHTML = ".filetitle, .replytitle { display: none; }";
		}
	}
	
	// When document is fully loaded
	$Jq(document).ready(function() {
		if ($Jq("#qr").length)
		{
			addListenQR();
		}
		else
		{
			document.body.addEventListener('DOMNodeInserted', function(e)
			{
				if(e.target.nodeName=='DIV' && e.target.id == "qr")
				{
					addListenQR();
				}
			}, true);
		}

		// Download info from server
		setTimeout(function() { sync(); }, 1000);
	});
	
	$Jq(document).keyup(function(e) {
		// On ctrl+v paste
		if (t != "b" && e.ctrlKey && e.which != 65 && (e.which == 86 || e.which==118) && getOption("Cross-thread Links") == "true")
		{
			// Append >>>/b/ to all
			var commentBox = $Jq('#qr').contents().find('textarea[name="com"]');
			commentBox.val(commentBox.val().replace(/>>(\d\d\d\d\d\d\d\d\d)/g, ">>>/b/$1"));
			
			// Remove >>>/b/ if in thread
			$Jq("form[name='delform'] > table tr > td[id]", document).each(function() {
				var id = $Jq(this).attr("id");
				commentBox.val(commentBox.val().replace(new RegExp(">>>/b/"+id, "g"), ">>"+id));
			});
		}
	});
	
	function addListenQR()
	{
		// Add submit listen to QR box
		var $currentIFrame = $Jq('#qr'); 
		$currentIFrame.contents().find(":submit").click(function()
		{
			var cName;
			var cEmail;
			var cSubject;
			var cFile = $currentIFrame.contents().find('input[type="file"]').val();
			
			if (getOption("Override Fields") == "true")
			{
				cName = getOption("Name");
				cEmail = getOption("Email");
				cSubject = getOption("Subject");
			}
			else
			{
				cName = $currentIFrame.contents().find('input[name="name"]').val();
				cEmail = $currentIFrame.contents().find('input[name="email"]').val();
				cSubject = $currentIFrame.contents().find('input[name="sub"]').val();
			}
			
			if (cFile != lastFile && canPost == true && cName != "" && cFile != "" && getOption("Enable Sync") == "true")
			{	
				canPost = false;
				lastFile = cFile;
				
				if (cFile.indexOf("C:\\fakepath\\") > -1)
					cFile = cFile.split("C:\\fakepath\\")[1];
				
				// Filename length fix
				if (cFile.length-4 > 30)
				{
					var start = cFile.substring(0, 30);
					var end = cFile.substring(cFile.length-4, cFile.length);
					cFile = start + "(...)" + end;
				}
				
				cFile = escape(cFile);
								
				$Jq.ajax({
					headers: {"X-Requested-With":"Ajax"},
					type: "POST",
					url: "http://nassign.heliohost.org/s/s.php",
					data: "f="+cFile+"&n="+cName+"&t="+t+"&s="+cSubject+"&e="+cEmail
				}).fail(function() {
					setSyncStatus(1, "Error sending name");
				});
				
				if (parseInt(document.getElementById("imagecount").innerHTML) <= 250 && $Jq("#count").html() != "404")
				{
					setTimeout(function() { postSet(); }, 30000);
				}
			}
		});
	}
	
	function postSet()
	{
		canPost = true;
	}
	
	var setSyncStatus = function(type, msg)
	{
		var colour = "green";
		
		switch (type)
		{
			case 1: colour = "red"; break;
			case 2: colour = "gray"; break;
		}
		
		$Jq("#syncStatus").html(msg).css("color", colour);
		
		if (type == 1 && getOption("Append Errors") == "true")
		{
			$Jq("div.warning").html("(Sync) "+msg);
			setTimeout(function() { $Jq("div.warning").html(""); }, 5000);
		}
	}
	
	function sync()
	{		
		if (t == "b")
		{
			setSyncStatus(2, "Not available on board index");
			return;
		}
			
		if (getOption("Enable Sync") == "true")
		{		
			$Jq.ajax({
				headers: {"X-Requested-With":"Ajax"},
				url: 'http://nassign.heliohost.org/s/q.php?t='+t,
			}).fail(function() {
				setSyncStatus(1, "Error retrieving names");
			}).done(function(data) {
				var content = data;

				try
				{
					var jsonBlocks = content.split("|");
					
					onlineNames = [];
					onlineFiles = [];
					onlineSubjects = [];
					onlineEmails = [];
					
					for (var i = 0; i < jsonBlocks.length -1; i++)
					{
						var p = jQuery.parseJSON(jsonBlocks[i]);

						for (var key in p)
						{
							if (p.hasOwnProperty(key))
							{
								switch (key)
								{
									case "n": onlineNames.push(unescape(p[key])); break;
									case "f": onlineFiles.push(unescape(p[key])); break;
									case "e": onlineEmails.push(unescape(p[key])); break;
									case "s": onlineSubjects.push(unescape(p[key])); break;
								}
							}
						}
					}

					setSyncStatus(0, "Online");
					updateElements();
				}
				catch (err)
				{
					setSyncStatus(1, "Error retrieving names (Script error)");
				}
			});
		}
		else
		{
			setSyncStatus(2, "Disabled");
		}
		
		if (parseInt(document.getElementById("imagecount").innerHTML) <= 250 && $Jq("#count").html() != "404")
		{
			setTimeout(function() { sync(); }, 30000);
		}
	}
	
	function updateElements()
	{
		if (t == "b")
			return;
		
		// Refresh for new cycle
		usedFilenames = [];
		
		// Process OP
		var optag = $Jq("form[name='delform'] > .op", document)[0];
		var id = $Jq(".posteruid", optag)[0].innerHTML;
		var nametag = $Jq(".postername", optag)[0];
		var filesizespan = $Jq(".filesize", optag)[0];
		var titlespan = $Jq(".filetitle", optag)[0];
		updatePost(id, nametag, filesizespan, titlespan);

		// Process replies separately because they differ
		// slightly in a few class names.
		$Jq("form[name='delform'] > table tr > td[id]", document).each(function() {
			var id = $Jq(".posteruid", this)[0].innerHTML;
			var nametag = $Jq(".commentpostername", this)[0];
			var filesizespan = $Jq(".filesize", this)[0];
			var titlespan = $Jq(".replytitle", this)[0];
			updatePost(id, nametag, filesizespan, titlespan);
		});
		
		storeNames();
	}

	function updatePost(id, nametag, filesizespan, titlespan) {
		if(id == "(ID: Heaven)")
			return;

		var index = ids.indexOf(id);
		var filename = null;
		var name = null;
		var tripcode = null;
		var email = null;
		var subject = null;	
		var info = null;
		
		var assignbutton = $Jq(".assignbutton", titlespan)[0];
		var guessbutton = $Jq(".guessbutton", titlespan)[0];

		if(getOption("Enable Sync") == "true" && filesizespan != null) {
			var filenamespan = $Jq("span[title]", filesizespan)[0];
			if(filenamespan == null) {
				filenamespan = $Jq("a[href]", filesizespan)[0];
			}
			var fullname = $Jq(".fntrunc", filenamespan)[0];
			if(fullname != null) {
				filename = fullname.innerHTML;
			} else {
				filename = filenamespan.innerHTML;
			}
			info = getOnlineInfo(filename);
			if(info[0] != null && info[0] != "" && $Jq(filesizespan).closest("table").attr("class") != "inline" && usedFilenames.indexOf(filename) == -1) {
				if(index > -1) {
					names[index] = info[0];
				} else {
					names[names.length] = info[0];
					ids[ids.length] = id;
					
					index = ids.length-1;
				}
				
				email = info[1];
				subject = info[2];
				usedFilenames[usedFilenames.length] = filename;
			}
		}
		
		if (onlineNames.indexOf(names[index]) == -1)
		{
			var domShell = document.createDocumentFragment();
			
			if(assignbutton == null) {
				assignbutton = document.createElement('a');
				assignbutton.href = "#";
				assignbutton.title = "Assign a name to this poster";
				assignbutton.setAttribute("class", "assignbutton");
				assignbutton.textContent = "+";
				assignbutton.onclick = (function() { var currentId = id; return function() { assignName(currentId); return false; } } )();
				domShell.appendChild(assignbutton);
			}
			if(guessbutton == null) {	
				guessbutton = document.createElement('a');
				guessbutton.href = "#";
				guessbutton.title = "Guess this poster";
				guessbutton.setAttribute("class", "guessbutton");
				guessbutton.textContent = "?";
				guessbutton.onclick = function () { alert("Guessing requires a filename"); return false; };
				domShell.appendChild(guessbutton);
			}
			
			titlespan.appendChild(domShell);
		}
		else
		{
			if(assignbutton != null)
				assignbutton.style.display = "none";
			if(guessbutton != null)
				guessbutton.style.display = "none";
		}
		
		if(index > -1) {
			name = names[index];
			tripcode = "";
			
			name = name.split("#");
			if (typeof name[1] != "undefined")
			{
				tripcode = "!" + name[1];
			}

			name = name[0];
			
			if (subject != null && subject != "")
			{
				titlespan.innerHTML = EncodeEntities(subject);
			}
			
			if (email != null && email != "")
			{
				nametag.innerHTML = "<a class='linkmail' href='mailto:" + EncodeEntities(email) + "'>" + EncodeEntities(name) + "</a>";
				
				if (tripcode != "")
				{
					nametag.innerHTML += "<a class='linkmail' href='mailto:" + EncodeEntities(email) + "' style='font-weight: normal !important; color: green !important;'> " + EncodeEntities(tripcode) + "</a>";
				}
			}
			else
			{
				nametag.innerHTML = EncodeEntities(name) + "<a style='font-weight: normal !important; color: green !important; text-decoration: none;'> " + EncodeEntities(tripcode) + "</a>";
			}
			
		} else {
			if(filename != null && guessbutton != null) {
				guessbutton.onclick = (function() {
					var currentId = id;
					var currentFilename = filename;
					return function() {
						guessPoster(currentId, currentFilename); return false;
					} } )();
			}
		}
		
		if (filename == null && guessbutton != null)
		{
			guessbutton.style.display = "none";
		}
	}
	
	// Return online info
	function getOnlineInfo(filename)
	{
		var index = onlineFiles.indexOf(filename);
		
		if (index > -1)
		{
			return [onlineNames[index], onlineEmails[index], onlineSubjects[index]];
		}
		else
		{
			return "";
		}
	}
	
	// Guess poster
	function guessPoster(id, filename)
	{		
		if (filename == "")
		{
			alert("Can not guess a poster without a filename");
		}
		else
		{
			$Jq.ajax({
				headers: {"X-Requested-With":"Ajax"},
				url: 'http://nassign.heliohost.org/s/g.php?f='+filename
			}).fail(function() {
				alert("Error guessing name");
			}).done(function(data) {
				var guessed = data;
				
				if (guessed == "")
				{
					alert("Could not guess the name of this poster");
				}
				else
				{
					guessed = unescape(guessed);
					
					var promptName = guessed.split("#");
					var promptTripcode = "";
					
					if (typeof promptName[1] != "undefined")
					{
						promptTripcode = " !" + promptName[1];
					}

					promptName = promptName[0];
					
					if (confirm("This poster is guessed as " + promptName + promptTripcode + ", apply name? Your guess will be marked with a *"))
					{
						// Check if the ID already has a name applied
						var index = ids.indexOf(id);
						
						if (index > -1)
						{
							// If it does, rewrite it
							names[index] = guessed + "*";
						}
						else
						{
							// Otherwise write a new entry
							names[names.length] = guessed + "*";
							ids[ids.length] = id;
						}
						
						updateElements();
					}
				}
			});
		}
	}
	
	// Assign personal name
	function assignName(id)
	{
		// Ask for name
		var name = prompt("What would you like this poster to be named?","");
		
		// If name is not blank
		if (name != null && name != "")
		{
			// Check if the ID already has a name applied
			var index = ids.indexOf(id);
			
			if (index > -1)
			{
				// If it does, rewrite it
				names[index] = name;
			}
			else
			{
				// Otherwise write a new entry
				names[names.length] = name;
				ids[ids.length] = id;
			}
			
			updateElements();
		}
	}
	
	function setOption(name, value)
	{
		localStorage.setItem(name, value);
		
		if (name == "Hide IDs")
			hideIds();
		if (name == "Show Poster Options")
			hideOptions();
	}
	
	function getOption(name)
	{
		var value = localStorage.getItem(name);
		
		if (value == null)
		{
			if (optionsDefaults[optionsNames.indexOf(name)] != undefined)
			{
				return optionsDefaults[optionsNames.indexOf(name)];
			}
			else
			{
				return "";
			}
		}
		else
		{
			return value;
		}
	}
	
	function storeNames()
	{
		if (names.length > 40 && ids.length > 40)
		{
			names.splice(0, 1);
			ids.splice(0, 1);
		}
		
		var namesJoin = names.join("|");
		var idsJoin = ids.join("|");
		
		setOption("names", namesJoin);
		setOption("ids", idsJoin);
	}

	function loadNames()
	{	
		var namesSplit = getOption("names");
		var idsSplit = getOption("ids");
		
		if (namesSplit != "" && idsSplit != "")
		{
			names = namesSplit.split("|");
			ids = idsSplit.split("|");
		}
	}
	
	function EncodeEntities(s){
		return $Jq("<div/>").text(s).html();
	}
	function DencodeEntities(s){
		return $Jq("<div/>").html(s).text();
	}
	
	// Set things up
	loadNames();
	hideIds();
	hideOptions();
	updateElements();

	// Add new reply listen
	document.body.addEventListener('DOMNodeInserted', function(e) {
		if(e.target.nodeName=='TABLE' && e.target.className != "inline") {
			updateElements();
		}
	}, true);
}

addJQuery(setUp);