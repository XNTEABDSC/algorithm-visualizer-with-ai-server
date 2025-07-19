import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";

//let aps=new PythonShell("wda")


const Path=".\\src\\controllers\\"

export class AIController extends Controller {

    protected chats:Array<PythonShell>=[];

    constructor(server: Server) {
        super(server);
        this.router
            .post('/chatnew', this.chatNew)
            .post('/chatsync', this.chatSync)
            .post('/test', this.test)
        
    }
    route = (router: express.Router): void => {
        router.use('/ai', this.router);
    };

    test=(req: express.Request, res: express.Response)=>{
        console.log("test start")

        PythonShell.runString("x=1+1;print('x: ' + str(x))",{pythonPath:"D:\\ProgramFiles\\pyenv\\pyenv-win\\shims\\python.bat"}).then((res)=>{
            console.log(`test result ${res}`)
        }).catch(err=>{
            console.log(`test err ${err}`)
        })
        console.log("test end")

        
        console.log("test start")

        const testchat=new PythonShell(Path+"test.py",{pythonPath:"D:\\ProgramFiles\\pyenv\\pyenv-win\\shims\\python.bat",pythonOptions: ['-u']})

        testchat.on("message",(msg)=>{
            console.log(`message ${msg}`)
        })
        testchat.on("close",(msg:any)=>{
            console.log(`close ${msg}`)
        })
        testchat.on("error",(msg:any)=>{
            console.log(`error ${msg}`)
        })
        testchat.on("stderr",(msg)=>{
            console.log(`stderr ${msg}`)
        })
        testchat.on("pythonError",(msg)=>{
            console.log(`pythonError ${msg}`)
        })
        testchat.send("dwawdawd")


        console.log("test end")

        res.end()
    }

    chatNew=(req: express.Request, res: express.Response) => {
        

        
        
        const id=this.chats.length
        
        //const aichat=new AIChat(id,req.body)
        
        console.log(`create chat id: ${id}`)
        console.log(req.body)
        const aichat=new PythonShell("ai_chat_cmd.py",{pythonPath:"D:\\ProgramFiles\\pyenv\\pyenv-win\\shims\\python.bat",scriptPath:Path})

        aichat.on("message",(msg)=>{
            console.log(`message ${msg}`)
        })
        aichat.on("close",(msg:any)=>{
            console.log(`close ${msg}`)
        })
        aichat.on("error",(msg:any)=>{
            console.log(`error ${msg}`)
        })
        aichat.on("stderr",(msg)=>{
            console.log(`stderr ${msg}`)
        })
        aichat.on("pythonError",(msg)=>{
            console.log(`pythonError ${msg}`)
        })

        aichat.send(JSON.stringify(id,req.body))
        
        this.chats[id]=aichat
        res.json({chatId:id})//.send(id)
        res.end()

        //setTimeout(()=>{res.write("I read 4");res.end()},1000)
    }
    chatSync=(req: express.Request, res: express.Response) => {

        const {chatId}=req.body
        
        let chat=this.chats[chatId]

        //chat.sync(result_actions)
        chat.once("message",(msg)=>{
            console.log("sync result")
            console.log(msg)
            const res_=JSON.parse(msg)
            res.json(res_)
            res.end()
        })
        chat.send("sync")
        console.log("try sync")


    }
}