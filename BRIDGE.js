// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, April 2021

function soundex(name)
	{
    let s = [];
    let si = 1;
    let c;

    //              ABCDEFGHIJKLMNOPQRSTUVWXYZ
    let mappings = "01230120022455012623010202";

    s[0] = name[0].toUpperCase();

    for(let i = 1, l = name.length; i < l; i++)
		{
        c = (name[i].toUpperCase()).charCodeAt(0) - 65;

        if(c >= 0 && c <= 25)
			{
            if(mappings[c] != '0')
				{
                if(mappings[c] != s[si-1])
					{
                    s[si] = mappings[c];
                    si++;
					}

/*                if(si > 3)
					{
                    break;
					}*/
				}
			}
		}

    if(si <= 3)
		{
        while(si <= 3)
			{
            s[si] = '0';
            si++;
			}
		}

    return s.join("");
	}

String.prototype.hashCode = function()
	{
    var hash = 0;
    for (var i = 0; i < this.length; i++) 
		{
        var character = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
		}
    return hash;
	}	

function encodeName(name, salt, digits)
	{
	name = name.replace(",","");
	var parts = name.split(" ");
	parts.sort();
	var x;
	var code = "";
	for (x of parts)
		{
		code += soundex(x);
		}
	code += salt;
	var hash = "0000000"+code.hashCode();
	var id = hash.substring(hash.length-digits);
	return id;	
	}
		
function encode() 
	{
	// reset background colours of UI elements 		
	document.getElementById("listid").style.backgroundColor = '';		
	document.forms["encodeform"]["name"].style.backgroundColor = '';
	document.forms["encodeform"]["digits"].style.backgroundColor = '';
	
	var jsn = document.getElementById("listid").value;
	var IDs = new Map();
	
	if (!!jsn)	
		{			
		try 
			{
			IDs = new Map(JSON.parse(jsn));	
			} 
		catch (e) 
			{
			document.getElementById("participantid").innerHTML = "<p style=\"color:rgb(255,0,0);\">"+e.name+" in ID-list: "+e.message+".</p>";	
			document.getElementById("listid").style.backgroundColor = 'pink';
			return false;	
			}			
		}
	var name = document.forms["encodeform"]["name"].value;
	if (name === "")
		{
		document.getElementById("participantid").innerHTML = "<p style=\"color:rgb(255,0,0);\">Please input the participants name.</p>";
		document.forms["encodeform"]["name"].style.backgroundColor = 'pink';		
		return false;
		}
	var digits = document.forms["encodeform"]["digits"].value;
	var anonymityEstimate = "<p><b>WARNING</b>: The population these participants are recruited from should comprise more than <b>"+(5*Math.pow(10,digits)).toLocaleString()+"</b> individuals to ensure a mimum level of anonymity (k-anonymity = 5). Population could here refer to a country, region, particular institution, or similar, where there are publicly available list of names such as phone directories. Note that this is a probabilistic estimate only.<p>";

	
	// check if ID-list length matches new coding
	if (!!jsn)
		{
		var anId = IDs.keys().next().value;
		if (anId.length != digits)
			{
			document.getElementById("participantid").innerHTML = "<p style=\"color:rgb(255,0,0);\">Number of ID digits do not match.("+anId.length+" vs "+digits+" digits)</p>";	
			document.forms["encodeform"]["digits"].style.backgroundColor = 'pink';
			return false;
			}
		}
	
	var id = encodeName(name, "", digits);

	if (IDs.has(id))
		{
		// assess the existing salts
		var oldSalts = IDs.get(id);
		var output = "";
		for (salt of oldSalts)
			{
			// add the salt to the ID
		    var tmpID = encodeName(name, salt, digits);
			if (IDs.has(tmpID))
				{
				// add to output
				output +=  "<p style=\"color:rgb(0,128,0);\">If existing particpant id: "+tmpID+" with challenge <b>"+salt+"</b></p>";					
				}			
			}
			
		// search for salt that results in free slot.
		var saltedID = "Not found";
		var saltArea = document.getElementById("slistid").value;
		var salts = saltArea.split("\n");
		var salt = "undefined";
		// search for new free salt
		for (salt of salts)
			{
			// add the salt to the ID
		    saltedID = encodeName(name, salt, digits);
			if (!IDs.has(saltedID))
				{
				// found valid new salt
				break;
				}
			}
	
		// add the new id
		var saltList = IDs.get(id);
		saltList.push(salt);
		// add the list of salts to original id
		IDs.set(id,saltList); 
		// add a new blank indirect id for for the new salt
		IDs.set(saltedID,[]);	
		// output the extra alternative
		document.getElementById("participantid").innerHTML = "<p style=\"color:rgb(0,128,0);\">If existing particpant id: "+id+" with no challenge</p>" +output+ "<p style=\"color:rgb(0,0,255);\">If new particpant id: "+saltedID+" with challenge <b>"+salt+"</b>. Memorize this challenge. Remember to copy and store the updated list.</p>"+anonymityEstimate;			
		// set json background colour to indicate change
		document.getElementById("listid").style.backgroundColor='lightblue';
		}
	else
		{
		IDs.set(id,[]);				
		document.getElementById("participantid").innerHTML = "<p style=\"color:rgb(0,0,255);\">New particpant id: "+id+". Remember to copy and store the updated list.</p>"+anonymityEstimate;		
		// set json background colour to indicate change		
		document.getElementById("listid").style.backgroundColor='lightblue';
		}
	
	let str = JSON.stringify(Array.from(IDs.entries()), null, 2);
	document.getElementById("listid").value = str;
	return false;
	}
	
