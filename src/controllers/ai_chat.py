


from typing import Any, Optional
from time import sleep
from threading import Thread

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
        "excerption":msg
    }

class SyncStream:
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
    content:SyncStream
    fileName:str
    _createSynced:bool
    select:bool
    def __init__(self,fileName:str,select:bool) -> None:
        self.content=SyncStream()
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
    ended:bool
    _ended_scynced:bool
    def __init__(self,inputs:Any) -> None:
        self.inputs=inputs
        self.chat_output=None
        self.scripts_output=[]
        self.ended=False
        self._ended_scynced=False
        pass

    def sync(self,actions:list[dict[str,Any]]) -> None:
        if self.chat_output!=None:
            self.chat_output.sync(actions)
        for script_file in self.scripts_output:
            script_file.sync(actions)
        if self.ended and not self._ended_scynced:
            self._ended_scynced=True
            actions.append(SyncAction_ChatGenEnd())

    def start(self) -> None:

        def dummy():
            sleep(0.1)
            self.chat_output=SyncFile("chat.md",True)
            sleep(0.2)
            self.chat_output.content.write("I read 1 \n")
            sleep(0.2)
            self.chat_output.content.write("I read 2 \n")
            self.chat_output.content.write("I spam code \n")
            sleep(0.1)
            self.scripts_output.append(SyncFile("a_script.md",False))
            sleep(0.2)
            self.scripts_output[0].content.write("I write some code\n")
            sleep(0.2)
            self.chat_output.content.write("I spaming code \n")
            self.scripts_output[0].content.write("And I write some code\n")
            sleep(0.2)
            self.chat_output.content.write("done \n")
            self.ended=True

        t=Thread(target=dummy)
        t.start()


