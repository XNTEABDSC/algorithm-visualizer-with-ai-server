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