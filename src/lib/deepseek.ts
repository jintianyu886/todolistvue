const API_KEY = "sk-908edf87100e489bac5965ef8b883cfb";
const BASE_URL = "https://api.deepseek.com";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  thinking?: { type: "enabled" | "disabled" };
  reasoning_effort?: "low" | "medium" | "high";
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    thinking?: boolean;
    reasoning_effort?: "low" | "medium" | "high";
    stream?: boolean;
  } = {}
): Promise<ChatCompletionResponse> {
  const hasReasoningEffort = options.reasoning_effort !== undefined;
  const request: ChatCompletionRequest = {
    model: options.model || "deepseek-v4-flash",
    messages,
    thinking: hasReasoningEffort || options.thinking ? { type: "enabled" } : { type: "disabled" },
    reasoning_effort: hasReasoningEffort ? options.reasoning_effort : undefined,
    stream: options.stream || false,
    max_tokens: 2048,
    temperature: 0.7,
  };

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<ChatCompletionResponse>;
}

export async function generateTodoSuggestions(prompt: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `你是一个智能待办清单助手。请根据用户的输入，生成具体的待办事项建议。
规则：
1. 回复格式：每项任务占一行，以"- "开头
2. 任务要具体、可执行
3. 最多生成5项任务
4. 语言保持简洁清晰`,
    },
    { role: "user", content: prompt },
  ];

  const response = await chatCompletion(messages, {
    model: "deepseek-v4-flash",
    thinking: false,
    reasoning_effort: "medium",
  });

  return response.choices[0]?.message?.content || "";
}

export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `你是一个友好的智能助手，擅长帮助用户管理待办清单和回答各种问题。
    
你拥有以下工具可以使用：
1. weather(city): 查询指定城市的天气，city为城市名称，支持：北京、上海、广州、深圳、杭州、成都、武汉、南京、西安、重庆

使用工具的格式：<function name="工具名">参数</function>

例如：
- 用户问："北京今天天气怎么样？"
- 你应该调用：<function name="weather">北京</function>

请根据用户的问题判断是否需要调用工具。如果不需要调用工具，请直接用自然语言回答。`,
  };

  const response = await chatCompletion([systemMessage, ...messages], {
    model: "deepseek-v4-flash",
    thinking: false,
  });

  const content = response.choices[0]?.message?.content || "";
  
  const toolMatch = content.match(/<function name="(\w+)">([^<]+)<\/function>/);
  if (toolMatch) {
    const toolName = toolMatch[1];
    const toolParam = toolMatch[2].trim();
    
    if (toolName === "weather") {
      return await handleWeatherTool(toolParam);
    }
  }
  
  return content;
}

async function handleWeatherTool(city: string): Promise<string> {
  try {
    const { getWeatherByCityName } = await import("./weather");
    const result = await getWeatherByCityName(city);
    
    if (result.status === "1" && result.lives && result.lives.length > 0) {
      const weather = result.lives[0];
      return `📍 ${weather.city} 天气：
🌡️ 温度：${weather.temperature}°C
☁️ 天气：${weather.weather}
💧 湿度：${weather.humidity}%
🌬️ 风向：${weather.winddirection} ${weather.windpower}级
⏱️ 更新时间：${weather.reporttime}`;
    } else {
      return `抱歉，无法获取${city}的天气信息。支持的城市：北京、上海、广州、深圳、杭州、成都、武汉、南京、西安、重庆`;
    }
  } catch (error) {
    console.error("天气查询失败:", error);
    return "天气查询失败，请稍后重试";
  }
}