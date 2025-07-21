from ai_chat import AIChat, SyncFile

from openai import OpenAI
import os

from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam

import logging

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
def get_qwen_stream_response(user_prompt,system_prompt):
    response = client.chat.completions.create(
        model="qwen-plus-0919",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        stream=True
    )
    for chunk in response:
        yield chunk.choices[0].delta.content

response = get_qwen_stream_response(user_prompt="我们公司项目管理应该用什么工具",system_prompt="你负责教育内容开发公司的答疑，你的名字叫公司小蜜，你要回答同事们的问题。")
for chunk in response:
    print(chunk, end="")


system_prompt_0:ChatCompletionMessageParam={"role": "system", "content": """
你是algorithm-visualizer的辅助ai助手，你负责帮助用户，通过生成在 https://algorithm-visualizer.org/ 运行的代码来帮助用户学习算法和数据结构
"""}
system_prompt_1:ChatCompletionMessageParam={"role": "system", "content": "请为对话起一个名字"}

system_prompt_2:ChatCompletionMessageParam={"role": "system", "content": "请回应用户的请求"}

def start(context:AIChat):
    messages:list[ChatCompletionMessageParam]=[
            system_prompt_0,
        ]
    messages.append(
        {"role": "user", "content": context.inputs}
    )
    messages.append(
        system_prompt_1
    )
    response = client.chat.completions.create(
        model="qwen-plus-0919",
        messages=messages,
        # stream=True
    )
    result=response.choices[0].message.content
    if result==None:
        context.log.write("Error: no response")
        context.ended=True
        return
    
    chat_output=SyncFile(result,True)
    context.chat_output=chat_output

    logging.info( "ai choose name " + str(result) )

    messages.append({"role":"assistant","content": result})
    messages.append(system_prompt_2)
    response_stream = client.chat.completions.create(
        model="qwen-plus-0919",
        messages=messages,
        stream=True
    )

    for chunk in response_stream:
        result=chunk.choices[0].delta.content
        if result==None:
            context.log.write("Error: unexpected None")
            context.ended=True
            return
        logging.info( "ai chat: " + str(result) )
        chat_output.content.write(result)
        
    
    context.log.write("Chat Ended")
    context.ended=True



