import { Message } from "@/store/ai-store";
import { Task } from "@/types/task";

export const sendMessageToAI = async (messages: Message[]): Promise<string> => {
  try {
    // Format messages for the API
    const formattedMessages = messages.map(({ role, content }) => ({
      role,
      content,
    }));
    
    const response = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: formattedMessages }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.completion;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    throw error;
  }
};

export const getSystemPrompt = (): string => {
  return `You are FocusPlan AI, a helpful study assistant. You can help with:
1. Creating effective study plans
2. Breaking down complex topics
3. Suggesting study techniques
4. Optimizing task schedules
5. Answering questions about study material
6. Creating tasks for the user's task list

Be concise, practical, and encouraging. Provide actionable advice that helps the user improve their study habits and academic performance.

When formatting your responses:
- Use **bold** for important points
- Use *italics* for emphasis
- Use bullet points for lists
- Keep paragraphs short and focused

When asked to create a task, respond in this exact format:
TASK_TITLE: [title] | TASK_DESCRIPTION: [description] | TASK_PRIORITY: [low/medium/high] | TASK_DATE: [YYYY-MM-DD]

You can include multiple tasks in a single response by repeating this format.`;
};

export const getTaskOptimizationPrompt = (tasks: string[]): string => {
  return `I have the following tasks in my study plan:
${tasks.join("\n")}

Can you help me optimize this schedule? Consider:
1. Task priority and difficulty
2. Best order for learning
3. Appropriate time allocation
4. Breaks and rest periods
5. Any suggestions for improvement`;
};

export const getStudyTechniquePrompt = (subject: string): string => {
  return `I'm studying ${subject}. What are the most effective study techniques for this subject? Please provide specific strategies that would help me learn and retain information better.`;
};

export const createTaskFromDescription = (description: string): Partial<Task> | null => {
  try {
    // Try to extract task details from AI response
    const titleMatch = description.match(/TASK_TITLE:\s*(.+?)\s*\|/);
    const descriptionMatch = description.match(/TASK_DESCRIPTION:\s*(.+?)\s*\|/);
    const priorityMatch = description.match(/TASK_PRIORITY:\s*(.+?)\s*\|/);
    const dateMatch = description.match(/TASK_DATE:\s*(.+?)(\s|$)/);
    
    if (!titleMatch) return null;
    
    return {
      title: titleMatch[1],
      description: descriptionMatch ? descriptionMatch[1] : "",
      priority: priorityMatch ? 
        (priorityMatch[1].toLowerCase() as "low" | "medium" | "high") : "medium",
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
      completed: false,
      subtasks: [],
    };
  } catch (error) {
    console.error("Error parsing task from AI:", error);
    return null;
  }
};