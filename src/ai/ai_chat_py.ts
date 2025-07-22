import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";
import { pythonPath } from 'config/environments';
import { bool } from 'aws-sdk/clients/signer';
import { SyncStreamStr,SyncAction_ChatGenEnd,SyncAction_FileAppend,SyncAction_FileCreate,SyncAction_Log } from "ai/utils";


const Path=".\\src\\ai\\"

class AIChatFromPython{
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
