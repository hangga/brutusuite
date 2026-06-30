let attachedTabs={};

let logs=[];

async function saveLogs(){

    await chrome.storage.local.set({
        logs:logs
    });

}

async function addLog(item){

    logs.unshift(item);

    if(logs.length>1000){

        logs.pop();

    }

    await saveLogs();

}

chrome.runtime.onInstalled.addListener(async()=>{

    await chrome.storage.local.set({
        logs:[]
    });

});

chrome.runtime.onMessage.addListener(async(msg)=>{

    if(msg.action=="attach"){

        const target={

            tabId:msg.tabId

        };

        try{

            await chrome.debugger.attach(

                target,

                "1.3"

            );

        }catch(e){}

        attachedTabs[msg.tabId]=true;

        await chrome.debugger.sendCommand(

            target,

            "Network.enable"

        );

    }

    if(msg.action=="clear"){

        logs=[];

        await saveLogs();

    }

});

chrome.debugger.onEvent.addListener(

async(source,method,params)=>{

if(method!="Network.responseReceived")

return;

if(!attachedTabs[source.tabId])

return;

let page;

try{

page=await chrome.tabs.get(source.tabId);

}catch{

return;

}

const pageHost=

new URL(page.url).hostname;

const url=

params.response.url;

const apiHost=

new URL(url).hostname;

const base=

pageHost.split('.').slice(-2).join('.');

if(!apiHost.endsWith(base))

return;

if(params.type!="XHR" &&

params.type!="Fetch")

return;

let body="";

try{

const response=

await chrome.debugger.sendCommand(

source,

"Network.getResponseBody",

{

requestId:params.requestId

}

);

body=response.body;

}catch{}

await addLog({

time:new Date().toLocaleTimeString(),

url:url,

status:params.response.status,

mime:params.response.mimeType,

method:"",

request:"",

response:body

});

});