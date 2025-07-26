import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";
import { bool } from 'aws-sdk/clients/signer';
import { AIChat } from 'ai';
//let aps=new PythonShell("wda")



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
        aichat.start()

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