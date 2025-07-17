import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

const SyncAction_FileCreate=(fileName:string)=>({
                    type:"FileCreate",
                    fileName
                })

const SyncAction_FileAppend=(fileName:string,appends:string)=>
    ({
        type:"FileAppend",
        fileName,
        appends
    })

const SyncAction_ChatGenEnd=(chatId:number)=>({
    type:"ChatGenEnd",
    chatId
})

class SyncStreamPipe{
    public unsynced:string=""
    public value:string=""
    ended=false
    constructor(){}
    input=(v:string)=>{
        this.unsynced=this.unsynced+v
    }
    input_end=()=>{this.ended=true}
    sync=()=>{
        const unsynced=this.unsynced
        this.unsynced=''
        this.value=this.value+unsynced
        return unsynced
    }
    //items
}

class SyncFile{
    public readonly fileName:string
    public content:SyncStreamPipe
    public syncCreated:boolean
    /**
     *
     */
    constructor(fileName:string,) {
        this.fileName=fileName
        this.content=new SyncStreamPipe()
        this.syncCreated=false
    }

    sync=(syncActions:Array<object>)=>{
        if (!this.syncCreated){
            syncActions.push(SyncAction_FileCreate(this.fileName))
            this.syncCreated=true
        }
        let content_sync=this.content.sync()
        if (content_sync.length>0){
            syncActions.push(SyncAction_FileAppend(this.fileName,content_sync))
        }
    }
}

class AIChat{
    public readonly id:number;
    public history:any;
    constructor(id:number,inputs:string){
        this.id=id
        this.history={[0]:inputs}
        this.context={
            chat_output:null,
            scripts:[],
            genEnded:false,
            genEndedSynced:false
        }
    }
    context:{
        chat_output:SyncFile|null,
        scripts: Array<SyncFile>,
        genEnded:boolean
        genEndedSynced:boolean
    }

    public start=()=>{
        let self=this
        return async function() {
            self.context.chat_output=new SyncFile("chat.md")
            setTimeout(()=>{
                if (self.context.chat_output)
                self.context.chat_output.content.input("ok i read")
            },100)
            setTimeout(()=>{
                if (self.context.chat_output)
                self.context.chat_output.content.input("and i spam code")
            },200)
            setTimeout(()=>{
                self.context.scripts.push(
                    new SyncFile("a_script.md")
                )
            },300)
            setTimeout(()=>{
                self.context.scripts[0].content.input("ye")
            },400)
            setTimeout(()=>{
                self.context.scripts[0].content.input("he")
            },500)
            setTimeout(()=>{
                if (self.context.chat_output)
                self.context.chat_output.content.input("done")
                self.context.genEnded=true
            },600)
        }
    }

    public sync=(syncActions:Array<any>)=>{
        if (this.context.chat_output)
            this.context.chat_output.sync(syncActions)
        for(let script of this.context.scripts){
            script.sync(syncActions)
        }
        if (!this.context.genEndedSynced&&this.context.genEnded){
            this.context.genEndedSynced=true
            syncActions.push(SyncAction_ChatGenEnd(this.id))
        }
        return syncActions
    }
}

export class AIController extends Controller {

    protected chats:Array<AIChat>=[];

    constructor(server: Server) {
        super(server);
        this.router
            .post('/chatnew', this.chatNew)
            .post('/chatsync', this.chatSync)
        
    }
    route = (router: express.Router): void => {
        router.use('/ai', this.router);
    };

    chatNew=(req: express.Request, res: express.Response) => {
        console.log(req.body)

        const id=this.chats.length
        const aichat=new AIChat(id,req.body)
        this.chats[id]=aichat
        res.json({chatId:id})//.send(id)
        res.end()
        aichat.start()()

        //setTimeout(()=>{res.write("I read 4");res.end()},1000)
    }
    chatSync=(req: express.Request, res: express.Response) => {
        console.log(req.body)

        const {chatId}=req.body
        let result_actions:Array<any>=[]
        let chat=this.chats[chatId]
        chat.sync(result_actions)
        res.json(result_actions)
        res.end()
    }
}