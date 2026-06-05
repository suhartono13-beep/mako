import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 1. 将原先的 openai 地址换成 deepseek 的地址
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 这里会自动读取你在 .env.local 里配置的 API Key
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // 2. 将模型名称改为 deepseek-chat
        model: 'deepseek-chat', 
        messages: [
          {
            role: 'system',
            content: `你是一个专业的个人知识库整理助手。你的任务是优化用户输入的笔记。
            要求：
            1. 修正错别字和语法错误。
            2. 使用 Markdown 格式进行排版（适当使用加粗、列表）。
            3. 保持原意，语言风格简练、有逻辑。
            4. 不要输出任何寒暄废话，直接返回润色后的正文。`
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3, // 较低的温度能让 AI 的输出更稳定、严谨
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    const polishedText = data.choices[0].message.content;

    return NextResponse.json({ result: polishedText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}