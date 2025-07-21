import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";
import { pythonPath } from 'config/environments';
import { bool } from 'aws-sdk/clients/signer';

//let aps=new PythonShell("wda")

class SyncStreamStr{
    public unsynced:string=""
    public value:string=""
    constructor(){}
    write=(v:string)=>{
        this.unsynced=this.unsynced+v
    }
    sync=()=>{
        const unsynced=this.unsynced
        this.unsynced=''
        this.value=this.value+unsynced
        return unsynced
    }
    //items
}

const SyncAction_ChatGenEnd=()=>({
    type:"ChatGenEnd",
})
const SyncAction_Error=(msg:string)=>({
    type:"Error",
    content:msg
})

const SyncAction_Log=(msg:string)=>({
    type:"Log",
    content:msg
})
const Path=".\\src\\ai\\"

class AIChat{
    aichat:PythonShell
    log:SyncStreamStr
    ended:bool
    inputs:string
    _ended_synced:bool
    _timeout_time:number
    constructor(inputs:string){
        this.inputs=inputs
        this.ended=false
        this._ended_synced=false

        let log=new SyncStreamStr()
        this.log=log

        let aichat=new PythonShell("ai_chat_cmd_sync.py",{pythonPath:pythonPath,scriptPath:Path})
        this.aichat=aichat
        this._timeout_time=1000
        this.sync_action_cache=[]

        aichat.on("message",(msg)=>{
            //console.log(`message ${msg}`)
        })
        aichat.on("close",(msg:any)=>{
            console.log(`close ${msg}`)
            this.ended=true
        })
        aichat.on("error",(msg:any)=>{
            console.log(`error ${msg}`)
            log.write(`error ${msg}`)
        })
        aichat.on("stderr",(msg)=>{
            console.log(`stderr ${msg}`)
            log.write(`stderr ${msg}`)
        })
        aichat.on("pythonError",(msg)=>{
            console.log(`pythonError ${msg}`)
            log.write(`pythonError ${msg}`)
        })

        aichat.send(inputs)
    }
    sync_action_cache:Array<Object>

    sync(res: express.Response){
        let timer=new Date()
        let sync_finished=false
        let self=this
        function do_sync(){
            if (!sync_finished){
                sync_finished=true
                res.json(self.sync_action_cache)
                self.sync_action_cache=[]
                res.end()
                aichat.send("do_sync")
            }
        }

        const syncmsg=this.log.sync()
        if (syncmsg.length>0){
            this.sync_action_cache.push(SyncAction_Log(syncmsg))
        }
        if (this.ended){
            this.sync_action_cache.push(SyncAction_ChatGenEnd())
        }

        setTimeout(()=>{
            do_sync()
        },this._timeout_time)

        let aichat=this.aichat
        aichat.once("message",(msg)=>{
            let py_response_time=new Date()
            let time_delta = (py_response_time.getTime()-timer.getTime())
            console.log(`response time delta: ${time_delta}`)

            if (this._timeout_time<time_delta){
                this._timeout_time=time_delta*2
            }

            console.log("sync result")
            console.log(msg)
            const res_:Array<Object>=JSON.parse(msg)
            for(let i of res_){
                this.sync_action_cache.push(i)
            }
            do_sync()
        })

        aichat.send("sync")
    }
}

export class AIController extends Controller {

    protected chats:Array<AIChat>=[];

    constructor(server: Server) {
        super(server);
        this.router
            .post('/chatnew', this.chatNew)
            .post('/chatsync', this.chatSync)
            //.post('/test', this.test)
        
    }
    route = (router: express.Router): void => {
        router.use('/ai', this.router);
    };


    chatNew=(req: express.Request, res: express.Response) => {
        

        
        
        const id=this.chats.length
        
        //const aichat=new AIChat(id,req.body)
        
        console.log(`create chat id: ${id}`)
        console.log(req.body)
        let aichat=new AIChat(JSON.stringify(req.body))
        
        this.chats[id]=aichat
        res.json({chatId:id})//.send(id)
        res.end()

        //setTimeout(()=>{res.write("I read 4");res.end()},1000)
    }
    chatSync=(req: express.Request, res: express.Response) => {

        const {chatId}=req.body
        
        let chat=this.chats[chatId]
        chat.sync(res)

        


        //chat.sync(result_actions)
        
        console.log("try sync")


    }
}