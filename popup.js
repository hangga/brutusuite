async function refresh(){

const result=

await chrome.storage.local.get("logs");

const logs=result.logs||[];

const div=

document.getElementById("logs");

div.innerHTML="";

const keyword=

document

.getElementById("search")

.value

.toLowerCase();

logs.forEach(log=>{

if(

keyword &&

!log.url

.toLowerCase()

.includes(keyword)

){

return;

}

const row=

document

.createElement("div");

row.style.borderBottom=

"1px solid #444";

row.style.padding="10px";

row.innerHTML=`

<div>

<b>${log.status}</b>

${log.url}

</div>

<pre>

${log.response}

</pre>

`;

div.appendChild(row);

});

}

document

.getElementById("search")

.onkeyup=refresh;

document

.getElementById("clear")

.onclick=async()=>{

await chrome.runtime.sendMessage({

action:"clear"

});

refresh();

};

document

.getElementById("attach")

.onclick=async()=>{

const tabs=

await chrome.tabs.query({

active:true,

currentWindow:true

});

await chrome.runtime.sendMessage({

action:"attach",

tabId:tabs[0].id

});

};

setInterval(

refresh,

1000

);

refresh();