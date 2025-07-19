import json
import ai_chat as ai_chat

ai_inputs=input()

ai_chat=ai_chat.AIChat(ai_inputs)

ai_chat.start()

while True:
    wait=input()
    # print("sync")
    sync_actions=[]
    ai_chat.sync(sync_actions)
    
    print(json.dumps(sync_actions))
    ended=False
    for act in sync_actions:
        if  type in act and act["type"]=="ChatGenEnd":
            ended=True
            break
    if ended:
        break
