import express from 'express';
import { Controller } from 'controllers/Controller';
import { NotFound } from 'ts-httpexceptions';
import Server from 'Server';
import fs from "fs"

let script_prompt=
fs.readFileSync("./src/ai/Writing_JavaScript_Code_with_Algorithm_Visualizer.md").toString()

//import {pyrunner} from "node-pyrunner";

import {PythonShell} from "python-shell";
import { bool } from 'aws-sdk/clients/signer';
import { SyncStreamStr,SyncFile,SyncAction_ChatGenEnd,SyncAction_FileAppend,SyncAction_FileCreate,SyncArray,SyncAction_Log,SyncAction_Error } from "ai/utils"
import {OpenAI} from "openai"
import { ChatCompletionMessageParam,ChatCompletionSystemMessageParam,ChatCompletionUserMessageParam,ChatCompletionAssistantMessageParam, ChatCompletionTool, ChatCompletionMessageToolCall, ChatCompletionToolMessageParam } from 'openai/resources/index';
import {  } from 'openai/resources/index';


//import {}

const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    
    baseURL: BASE_URL,
    //fetch:createOpenAIFetch()
});

const system_prompt_instruct:ChatCompletionSystemMessageParam = { role: "system", content: `
你是algorithm-visualizer的辅助ai助手，你负责帮助用户，通过与用户交流和生成在 https://algorithm-visualizer.org/ 运行的代码来帮助用户学习算法和数据结构。
如果进行了函数调用，则严禁自行生成代码
如果进行了函数调用，则严禁自行生成代码
algorithm-visualizer的环境已经配置完成，你不需要告诉用户如何使用algorithm-visualizer。
你将会得到JSON文本输入，content为用户输入的内容。
你不需要模仿输入，只需要正常的输出markdown。
对于你每一次需要演示的方法，你都需要进行一次 "generate_code" 函数调用
`}

const system_prompt_make_chat_name:ChatCompletionSystemMessageParam = {  role: "system", content: `
请为对话起一个名字，你只需要生成名字，不包含其他内容。
`}

const system_prompt_talk:ChatCompletionSystemMessageParam = {  role: "system", content: `
如果进行了函数调用，则严禁自行生成代码
请回应用户的请求。当你想要生成代码时，请调用 "generate_code" 函数。 
`}

const system_prompt_codegen:ChatCompletionSystemMessageParam = {  role: "system", content: `
你是一个算法可视化脚本生成器，你的角色是生成可以由算法可视化执行的javascript代码。你只需要生成代码。
严禁生成除代码以外的内容，生成的代码为JavaScript代码
严禁幻想不存在的变量
尽量将每一步细节展现，多解释原理
将 algorithm-visualizer 加入知识库，了解库的全部含义及用法
了解库中的所有变量的含义，在调用时正确引用
在输出代码的同时自检，保证代码的正确性，符合在 https://algorithm-visualizer.org/ 运行代码的基本格式 Do not include any other things, and do not add \`\`\`
`}

const system_prompt_algo_vis:ChatCompletionSystemMessageParam = {  role: "system", content: script_prompt}


const main_chat_tools_prompt:Array<ChatCompletionTool>=[
    {
        type: "function",
        function: {
            name: "generate_code",
            description: "根据提示，调用 ai 生成 algorithm-visualizer 代码。你应该提供足够多的要求和信息，帮助代码生成ai生成代码。生成的代码会自动的提供给 algorithm-visualizer 以演示",
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
    tasks:Array<Promise<void>>
    constructor(inputs:string){
        this.chat_output=null
        this.files_output=[]
        this.inputs=inputs
        this.ended=false
        this._ended_synced=false
        this.messages=[]
        this.log=new SyncArray()
        this.tasks=[]
    }

    async start(){
        try{
            let task_id_pool=0
            let tasks_count=0
            const end_task = async (task_id:any)=>{
                tasks_count-=1;
                console.log(`task ${task_id} ended. current count: ${tasks_count}`)
                if(tasks_count==0){
                    console.log("all task end")
                    this.ended=true
                }
            }
            const add_task = async (task:Promise<void>,task_id:any=undefined) =>{
                if (task_id==undefined||task_id==null){
                    task_id=task_id_pool
                    task_id_pool=task_id_pool+1
                }
                tasks_count+=1
                console.log(`task ${task_id} started. current count: ${tasks_count}`)
                task.then(()=>{end_task(task_id);},(ex)=>{
                    console.log(ex)
                    this.log.write(ex)
                    end_task(task_id);
                })
            }



            const script_chat = async (script_name:string,script_prompt:string) =>{
                let script_file=new SyncFile(script_name + ".js",false)
                this.files_output.push(script_file)
                let script_chat_msg:Array<ChatCompletionMessageParam>=[]
                script_chat_msg.push(system_prompt_algo_vis)
                script_chat_msg.push(system_prompt_codegen)
                script_chat_msg.push({role:"user",content:script_prompt})
                let chat_gen_code= await openai.chat.completions.create(
                    {
                        model:"qwen-plus",//"qwen3-32b@Alibaba",
                        messages: script_chat_msg,
                        stream:true
                    }
                )
                for await (const chunk of chat_gen_code){
                    const delta=chunk.choices[0].delta
                    const content=delta.content
                    if(content){
                        script_file.content.write(content)
                    }
                }


            }

            const main_chat =async () =>{
                console.log("main_chat start")
                let chat_messages=this.messages
                chat_messages.push(system_prompt_instruct)
                chat_messages.push({role:"user",content:this.inputs})

                chat_messages.push(system_prompt_make_chat_name)
                
                let chat_make_name_result= await openai.chat.completions.create(
                    {
                        model:"qwen-plus",
                        messages: chat_messages,
                        //stream:true
                    }
                )
                //console.log(chat_make_name_result)

                //this.log.write(chat_make_name_result)

                let made_name_msgparam=chat_make_name_result.choices[0].message
                chat_messages.push(made_name_msgparam)
                let made_name=made_name_msgparam.content
                if (made_name==null){
                    console.log("failed to make name")
                    this.log.write("failed to make name")
                    this.ended=true
                    return
                }
                let chat_file=new SyncFile(made_name + '.md',true)
                this.chat_output=chat_file

                chat_messages.push(system_prompt_talk)
                
                while(true){
                    console.log("ai chat gen start")
                    let chat_talk=await openai.chat.completions.create(
                        {
                            model:"qwen-plus",
                            messages: chat_messages,
                            tools:main_chat_tools_prompt,
                            stream: true,
                            parallel_tool_calls:true,
                            tool_choice:"auto",

                        }
                    )

                    
                    let chat_content=""
                    let toolCallsCache:{[number:number]:ChatCompletionMessageToolCall}=[]
                    let toolCallsCacheCurrent=null

                    //let 

                    for await (const chunk of chat_talk){
                        const delta=chunk.choices[0].delta
                        //console.log(delta)
                        this.log.write(delta)

                        const content=delta.content
                        if(content){
                            this.chat_output.content.write(content)
                            chat_content+=content
                        }

                        const toolCalls = delta.tool_calls;
                        if (toolCalls){
                            for(const toolCall of toolCalls){
                                const functionCall=toolCall.function
                                if(!toolCallsCache[toolCall.index]){
                                    /* 
                                    if (toolCallsCacheCurrent){
                                        console.log(" toolCallsCacheCurrent exist while another created")
                                    }*/
                                    console.log(`functionCall ${toolCall.index} started`)
                                    let toolCallsCacheCurrent:ChatCompletionMessageToolCall={
                                        // @ts-ignore
                                        id:<string>toolCall.id,index:toolCall.index,type:<"function">toolCall.type,
                                        function:<Function>toolCall.function||{}
                                    }
                                    toolCallsCache[toolCall.index]=(toolCallsCacheCurrent)
                                    //toolCallsCache[toolCall.index]=//.push(toolCallsCacheCurrent)
                                }
                                else{
                                    const functionCallCache=toolCallsCache[toolCall.index].function
                                    if (functionCall && functionCallCache){
                                        let res=""
                                        if(functionCallCache.arguments){
                                            res+=functionCallCache.arguments
                                        }
                                        if(functionCall.arguments){
                                            res+=functionCall.arguments
                                        }else{
                                            console.log(`functionCall ${toolCall.index} finished: ${res}`)
                                            //this.log.write(`functionCall ${toolCall.index} finished: ${res}`)
                                        }
                                        functionCallCache.arguments=res

                                    }
                                }

                            }
                        }
                    }
                    let toolCallsCacheArray=[]
                    for(let i in toolCallsCache){
                        toolCallsCacheArray.push(toolCallsCache[i])
                    }
                    let content_msg:ChatCompletionAssistantMessageParam={role:"assistant",content:chat_content,tool_calls:toolCallsCacheArray}
                    this.log.write(toolCallsCache)
                    this.log.write(content_msg)
                    chat_messages.push(content_msg)
                    if (toolCallsCacheArray.length==0){
                        console.log("no tool call, chat ended")
                        this.log.write("no tool call, chat ended")
                        break;
                    }else{
                        for(let i of toolCallsCacheArray){
                            console.log(i)
                            this.log.write(i)
                            let fn=i.function
                            let fnname=fn.name
                            let args=JSON.parse(fn.arguments)
                            let script_name=args.script_name
                            let script_prompt=args.script_prompt
                            console.log(`script_chat(${script_name},${script_prompt})`)
                            this.log.write(`script_chat(${script_name},${script_prompt})`)
                            add_task(script_chat(script_name,script_prompt))
                            const tool_arg:ChatCompletionToolMessageParam={role: "tool", content: "the script was created", tool_call_id: i.id}
                            chat_messages.push(tool_arg)
                        }
                    }
                }
                
                console.log(`main chat ended`)
                this.log.write(`main chat ended`)
            }
            
            


            /**
            for chunk in completion:
            # 如果stream_options.include_usage为True，则最后一个chunk的choices字段为空列表，需要跳过（可以通过chunk.usage获取 Token 使用量）
            if chunk.choices:
                full_content += chunk.choices[0].delta.content
                print(chunk.choices[0].delta.content)
            */
            add_task(main_chat())
                //this.tasks.push(main_chat())
        }catch(ex){
            console.log(ex)
            this.log.write(ex)
            this.ended=true
            return
        }
        
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
        res.json(sync_actions)
        res.end()
    }
}
