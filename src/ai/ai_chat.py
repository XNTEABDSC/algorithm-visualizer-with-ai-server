


from typing import Any, Optional
from time import sleep
from threading import Thread

# from ai_assistant import start

def SyncAction_FileCreate(fileName:str,select:bool):
    return{
        "type":"FileCreate",
        "fileName":fileName,
        "select":select
    }
def SyncAction_FileAppend(fileName:str,appends:str):
    return{
        "type":"FileAppend",
        "fileName":fileName,
        "appends":appends
    }
def SyncAction_ChatGenEnd():
    return{
        "type":"ChatGenEnd",
    }

def SyncAction_Error(msg):
    return{
        "type":"Error",
        "content":msg
    }

def SyncAction_Log(msg):
    return{
        "type":"Log",
        "content":msg
    }

class SyncList[T]:
    items:list[T]
    syncedIndex:int
    def __init__(self) -> None:
        self.items=[]
        self.syncedIndex=0

    def write(self,value:T) -> None:
        self.items.append(value)

    def sync(self)->list[T]:
        result=[]
        while(self.syncedIndex<len(self.items)):
            result.append(self.items[self.syncedIndex])
            self.syncedIndex=self.syncedIndex+1
        return result

class SyncStreamStr:
    _unsynced:str
    _synced:str
    def __init__(self) -> None:
        self._unsynced=""
        self._synced=""
        pass
    def write(self,input:str) -> None:
        self._unsynced=self._unsynced+input

    def sync(self)->str:
        unsynced=self._unsynced
        self._synced=self._synced+unsynced
        self._unsynced=""
        return unsynced
    
    def get(self)->str:
        return self._synced+self._unsynced
    
class SyncFile:
    content:SyncStreamStr
    fileName:str
    _createSynced:bool
    select:bool
    def __init__(self,fileName:str,select:bool) -> None:
        self.content=SyncStreamStr()
        self.fileName=fileName
        self._createSynced=False
        self.select=select
        pass

    def sync(self,actions:list[dict[str,Any]]) -> None:
        if not self._createSynced:
            self._createSynced=True
            actions.append(SyncAction_FileCreate(self.fileName,self.select))
        sync_content=self.content.sync()
        if len(sync_content)>0:
            actions.append(SyncAction_FileAppend(self.fileName,sync_content))

class AIChat:
    inputs:Any
    chat_output:Optional[SyncFile]
    scripts_output:list[SyncFile]
    log:SyncList[str]
    ended:bool
    _ended_scynced:bool
    excerption:Optional[str]
    _excerption_synced:bool
    def __init__(self,inputs:Any) -> None:
        self.inputs=inputs
        self.chat_output=None
        self.scripts_output=[]
        self.ended=False
        self._ended_scynced=False
        self.log=SyncList()
        self.excerption=None
        self._excerption_synced=False
        pass

    def sync(self,actions:list[dict[str,Any]]) -> None:

        log_res=self.log.sync()
        for i in log_res:
            actions.append(SyncAction_Log(i))

        if self.chat_output!=None:
            self.chat_output.sync(actions)

        for script_file in self.scripts_output:
            script_file.sync(actions)

        if self.excerption and not self._excerption_synced:
            self._excerption_synced=True
            self.ended=True
            actions.append(SyncAction_Error(self.excerption))

        if self.ended and not self._ended_scynced:
            self._ended_scynced=True
            actions.append(SyncAction_ChatGenEnd())
        
    


