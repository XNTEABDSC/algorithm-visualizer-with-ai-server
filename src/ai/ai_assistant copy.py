from ai_chat import AIChat, SyncFile

from openai import OpenAI
import os

from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam

import logging

logger=logging.getLogger(__name__)

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)


system_prompt_0:ChatCompletionMessageParam={"role": "system", "content": """
你是algorithm-visualizer的辅助ai助手，你负责帮助用户，通过生成在 https://algorithm-visualizer.org/ 运行的代码来帮助用户学习算法和数据结构。
algorithm-visualizer的环境已为你配置，当你需要生成代码时，直接生成可以填入 https://algorithm-visualizer.org/ 并运行的javascript代码即可。
你将会得到JSON文本输入，content为用户输入的内容。你只需要正常的输出markdown。
"""}
system_prompt_1:ChatCompletionMessageParam={"role": "system", "content": "请为对话起一个名字，你只需要生成名字，不包含其他内容"}

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
    
    chat_output=SyncFile(result + ".md",True)
    context.chat_output=chat_output

    logger.info( "ai choose name " + str(result) )

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
        logger.info( "ai chat: " + str(result) )
        chat_output.content.write(result)
        
    
    context.log.write("Chat Ended")
    context.ended=True



