
export const SyncAction_FileCreate=(fileName:string,select:boolean)=>({
                    type:"FileCreate",
                    fileName,select
                })

export const SyncAction_FileAppend=(fileName:string,appends:string)=>
    ({
        type:"FileAppend",
        fileName,
        appends
    })

export const SyncAction_ChatGenEnd=()=>({
    type:"ChatGenEnd",
})

export const SyncAction_Log=(msg:any)=>({
    type:"Log",
    msg
})
export const SyncAction_Error=(msg:any)=>({
    type:"Error",
    msg
})

export class SyncStreamStr{
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
export class SyncArray<T>{
    public list:Array<T>
    public _synced_index:number
    constructor(){
        this.list=[]
        this._synced_index=0
    }
    write(v:T){
        this.list.push(v)
    }
    sync():Iterable<T>{
        return {
            [Symbol.iterator]:()=>{
                const list=this.list
                const toIndex=this.list.length
                let curIndex=this._synced_index
                this._synced_index=toIndex
                return{
                    next(){
                        if(curIndex==toIndex){
                            return {value:list[0],done:true}
                        }
                        const res=list[curIndex]
                        curIndex=curIndex+1
                        return {value:res,done:curIndex==toIndex}
                    }
                }
            }
        }
    }
}

export class SyncFile{
    public readonly fileName:string
    public content:SyncStreamStr
    public syncCreated:boolean
    public readonly select:boolean
    /**
     *
     */
    constructor(fileName:string,select:boolean=false) {
        this.fileName=fileName
        this.content=new SyncStreamStr()
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