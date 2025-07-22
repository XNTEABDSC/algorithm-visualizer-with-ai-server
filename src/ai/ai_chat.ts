import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";
import { pythonPath } from 'config/environments';
import { bool } from 'aws-sdk/clients/signer';
import { SyncStreamStr,SyncFile,SyncAction_ChatGenEnd,SyncAction_FileAppend,SyncAction_FileCreate,SyncArray,SyncAction_Log,SyncAction_Error } from "ai/utils"
import {OpenAI} from "openai"
import { ChatCompletionMessageParam,ChatCompletionSystemMessageParam,ChatCompletionUserMessageParam,ChatCompletionAssistantMessageParam, ChatCompletionTool } from 'openai/resources/index';
import {  } from 'openai/resources/index';
import fetch from "cross-fetch"
//import {}

const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    
    baseURL: BASE_URL,
    fetch:fetch
});

const system_msgparam_instruct:ChatCompletionSystemMessageParam = { role: "system", content: `
你是algorithm-visualizer的辅助ai助手，你负责帮助用户，通过与用户交流和生成在 https://algorithm-visualizer.org/ 运行的代码来帮助用户学习算法和数据结构。
你将会得到JSON文本输入，content为用户输入的内容。
你不需要模仿输入，只需要正常的输出markdown。
`}

const system_msgparam_make_chat_name:ChatCompletionSystemMessageParam = {  role: "system", content: `
请为对话起一个名字，你只需要生成名字，不包含其他内容。
`}

const system_msgparam_talk:ChatCompletionSystemMessageParam = {  role: "system", content: `
请回应用户的请求。当你想要生成代码时，请调用 "generate_code" 函数。
`}


const main_chat_tools_prompt:Array<ChatCompletionTool>=[
    {
        type: "function",
        function: {
            name: "generate_code",
            description: "根据提示，调用 ai 生成 algorithm-visualizer 代码",
            parameters: {
                type: "object",
                properties: {
                    script_name: {
                        type: "string",
                        description: "该代码的名称",
                    },
                    script_prompt:{
                        type: "string",
                        description: "该代码的内容，用于提示 ai 生成代码",
                    }
                },
                required: ["script_name","script_prompt"]
            }
        }
    }
]

export class AIChat{
    chat_output:SyncFile|null
    files_output:Array<SyncFile>
    inputs:string
    ended:bool
    _ended_synced:bool
    messages:Array<ChatCompletionMessageParam>
    log:SyncArray<any>
    constructor(inputs:string){
        this.chat_output=null
        this.files_output=[]
        this.inputs=inputs
        this.ended=false
        this._ended_synced=false
        this.messages=[]
        this.log=new SyncArray()
    }

    async start(){
        let messages=this.messages
        messages.push(system_msgparam_instruct)
        messages.push({role:"user",content:this.inputs})

        messages.push(system_msgparam_make_chat_name)
        let chat_make_name_result= await openai.chat.completions.create(
            {
                model:"qwen-plus",
                messages,
                //stream:true
            }
        )

        this.log.write(chat_make_name_result)

        let made_name_msgparam=chat_make_name_result.choices[0].message
        messages.push(made_name_msgparam)
        let made_name=made_name_msgparam.content
        if (made_name==null){

            this.ended=true
            return
        }
        let chat_file=new SyncFile(made_name,true)
        this.chat_output=chat_file

        messages.push(system_msgparam_talk)

        let chat_talk=await openai.chat.completions.create(
            {
                model:"qwen-plus",
                messages,
                tools:main_chat_tools_prompt,
                stream: true,
                parallel_tool_calls:true
            }
        )

        for await (const chunk of chat_talk){
            this.log.write(chunk)
        }


        /**
        for chunk in completion:
        # 如果stream_options.include_usage为True，则最后一个chunk的choices字段为空列表，需要跳过（可以通过chunk.usage获取 Token 使用量）
        if chunk.choices:
            full_content += chunk.choices[0].delta.content
            print(chunk.choices[0].delta.content)
         */
        this.ended=true
    }

    sync(res: express.Response){
        let sync_actions=[]
        for (let i of this.log.sync()){
            sync_actions.push(SyncAction_Log(i))
        }
        if (this.chat_output)
            this.chat_output.sync(sync_actions)
        for(let files of this.files_output){
            files.sync(sync_actions)
        }
        if (this.ended && !this._ended_synced){
            sync_actions.push(SyncAction_ChatGenEnd())
        }
    }
}
