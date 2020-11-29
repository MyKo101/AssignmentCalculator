
function writeout(text){
  document.getElementById("out").innerHTML = text;
}

function insertconst(text,section,from_date,to_date){
  var num_days = Math.round((to_date - from_date)/(1000 * 60 * 60 * 24));
  
  if(num_days == 1){
    num_days = "1 day";
  } else {
    num_days = num_days + " days";
  }
  
  text = text.replace(/\\datefrom/g,from_date.toDateString());
  text = text.replace(/\\dateto/g,to_date.toDateString());
  text = text.replace(/\\numdays/g,num_days);
  text = text.replace(/\\section/g,section.toLowerCase());
  text = text.replace(/\\Section/g,toTitleCase(section));
  text = text.replace(/\\module/g,getModule());
  text = text.replace(/\\p/g,"<br><br>");
  return text;
}

function writeModule(match,p1,p2){
  if(p1 == getModule()){
    return p2;
  } else {
    return "";
  }
}

function shortcutlist(){
  var sc_list = ["\\datefrom", "\\dateto", "\\numdays", "\\section",
                  "\\Section", "\\module"];
  var sc_elements = document.getElementsByClassName("shortcut");
  var i;
  for( i = 0; i < sc_elements.length; i++){
    sc_list.push("\\"+sc_elements[i].id);
  }
  return sc_list;
}

function anyshortcuts(text){
  var sc = shortcutlist();
  var i = 0;
  var c_length = text.length;
  
  while(i < sc.length & text.length == c_length){
    text = text.replace(sc[i],"");
    i++;
  }
  
  if(text.length != c_length){
    return true;
  } else {
    return false;
  }
}

function getModule(){
  var url = window.location.pathname.split('/');
  return url[3];
}

function toTitleCase(text){
  return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
}

function insertshortcuts(text){
  var sc = document.getElementsByClassName("shortcut");
  writeout("loaded shortcuts");
  var i;
  var c_id;
  var c_text;
  var re;
  for (i = 0; i < sc.length; i++) {
    writeout("starting shortcuts, i = "+i);
    c_id = sc[i].id;
    writeout("grabbed sc[i].id, i = "+i);
    c_text = sc[i].innerHTML;
    writeout("grabbed sc[i].innerHTML, i = "+i);
    re = new RegExp("\\\\"+c_id,"g");
    writeout("Created the regex:" + re.toString()+ " i = "+ 1);
    text = text.replace(re,c_text);
    //writeout("finishing shortcuts, i = "+i);
  }
  return text;
}

function markdowny(text){
  text = text.replace(/###\s(.*?)\n/gm,"<h3>$1</h3>");
  text = text.replace(/##\s(.*?)\n/g,"<h2>$1</h2>");
  text = text.replace(/#\s(.*?)\n/g,"<h1>$1</h1>");
  text = text.replace(/\*(.*)\*/g,"<b>$1</b>");
  text = text.replace(/_(.*)_/g,"<i>$1</i>");
  text = text.replace(/\[(.*?)\]\((.*?)\)/g,"<a href=\"$2\">$1</a>");
  text = text.replace(/\~\(([^)]+)\)\{([^}]+)\}/g,writeModule);
  return text;
}

function show_content(which_section){
  var src = document.getElementById(which_section + "content").innerHTML;
  
  document.getElementById("contentframe").innerHTML = src;
  document.getElementById("contentframe").className = which_section;
  
}

function show_today_content(plan_dt,research_dt,organise_dt,draft_dt){
  var today = new Date();
  if(today <= plan_dt){
    show_content('planning');
  } else if(today <= research_dt){
    show_content('research');
  } else if(today <= organise_dt){
    show_content('organise');
  } else if(today <= draft_dt){
    show_content('drafting');
  } else {
    show_content('review');
  }
}

function do_subs(text,sectionname,from_date,to_date){
  text = insertshortcuts(text);
  text = insertconst(text,sectionname,from_date,to_date);
  text = markdowny(text);
  return text;
}

function sub_text(section,sectionname,from_date,to_date){
  var src = document.getElementById(section).innerHTML;
  while(anyshortcuts(src)){
    src = do_subs(src,sectionname,from_date,to_date);
  }
  document.getElementById(section).innerHTML = src;
}

function make_content(){
  let TimeSplit = [ 5, 60, 13, 15, 7]; 
  let CumTime = [0,0,0,0,0];
  
  CumTime[0] = TimeSplit[0]/100;
  
  
  for (i = 1; i < 5; i++){
    CumTime[i] = CumTime[i-1] + TimeSplit[i]/100;
  }
  
  var paramsString = window.location.search;
  var searchParams = new URLSearchParams(paramsString);
  
  if(!(searchParams.has("start") & searchParams.has("end"))){
    document.getElementById("container").innerHTML = "";
  } else {
  
    var start_str = searchParams.get("start").split("-");
    var end_str = searchParams.get("end").split("-");
    
    var start = new Date(start_str[0],start_str[1]-1,start_str[2]);
    var end = new Date(end_str[0],end_str[1]-1,end_str[2]);
    
    var diffTime = Math.abs(end - start);
    
    var plan_deadline = new Date(start.getTime() + CumTime[0]*diffTime);
    var research_deadline = new Date(start.getTime() + CumTime[1]*diffTime);
    var organise_deadline = new Date(start.getTime() + CumTime[2]*diffTime);
    var draft_deadline = new Date(start.getTime() + CumTime[3]*diffTime);
    var review_deadline = new Date(start.getTime() + CumTime[4]*diffTime);
    
    
    sub_text('planningmenu',"Planning",start,plan_deadline);
    sub_text('planningcontent',"Planning",start,plan_deadline); 
    sub_text('researchmenu',"Research",plan_deadline,research_deadline);
    sub_text('researchcontent',"Research",plan_deadline,research_deadline);
    sub_text('organisemenu',"Organise",research_deadline,organise_deadline);
    sub_text('organisecontent',"Organise",research_deadline,organise_deadline);
    sub_text('draftingmenu',"Drafting",organise_deadline,draft_deadline);
    sub_text('draftingcontent',"Drafting",organise_deadline,draft_deadline);
    sub_text('reviewmenu',"Reviewing",draft_deadline,review_deadline);
    sub_text('reviewcontent',"Reviewing",draft_deadline,review_deadline);
    
    document.getElementById("formstart").valueAsDate = start;
    document.getElementById("formend").valueAsDate = end;
    
    show_today_content(plan_deadline,research_deadline,organise_deadline,draft_deadline);
  }
  
  
}

