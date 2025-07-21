
const SyncAction_FileCreate=(fileName:string,select:boolean)=>({
                    type:"FileCreate",
                    fileName,select
                })

const SyncAction_FileAppend=(fileName:string,appends:string)=>
    ({
        type:"FileAppend",
        fileName,
        appends
    })

const SyncAction_ChatGenEnd=()=>({
    type:"ChatGenEnd",
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
    public readonly select:boolean
    /**
     *
     */
    constructor(fileName:string,select:boolean=false) {
        this.fileName=fileName
        this.content=new SyncStreamPipe()
        this.syncCreated=false
        this.select=select
    }

    sync=(syncActions:Array<object>)=>{
        if (!this.syncCreated){
            syncActions.push(SyncAction_FileCreate(this.fileName,this.select))
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

    public async start(){
        this.context.chat_output=new SyncFile("chat.md",true)
        setTimeout(()=>{
            if (this.context.chat_output)
            this.context.chat_output.content.input("ok i read")
        },100)
        setTimeout(()=>{
            if (this.context.chat_output)
            this.context.chat_output.content.input("and i spam code")
        },200)
        setTimeout(()=>{
            this.context.scripts.push(
                new SyncFile("a_script.md")
            )
        },300)
        setTimeout(()=>{
            this.context.scripts[0].content.input("ye")
        },400)
        setTimeout(()=>{
            this.context.scripts[0].content.input("he")
        },500)
        setTimeout(()=>{
            if (this.context.chat_output)
            this.context.chat_output.content.input("done")
            this.context.genEnded=true
        },600)
    }

    public sync=(syncActions:Array<any>)=>{
        if (this.context.chat_output)
            this.context.chat_output.sync(syncActions)
        for(let script of this.context.scripts){
            script.sync(syncActions)
        }
        if (!this.context.genEndedSynced&&this.context.genEnded){
            this.context.genEndedSynced=true
            syncActions.push(SyncAction_ChatGenEnd())
        }
        return syncActions
    }
}