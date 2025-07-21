import json
import ai_chat
from ai_assistant import start
from threading import Thread
ai_inputs=input()

a_chat=ai_chat.AIChat(ai_inputs)
t=Thread(target=start,args=[a_chat])
t.start()

while True:
    wait=input()
    # print("sync")
    sync_actions=[]
    a_chat.sync(sync_actions)
    
    print(json.dumps(sync_actions))
    ended=False
    for act in sync_actions:
        if  type in act and act["type"]=="ChatGenEnd":
            ended=True
            break
    if ended:
        break
