export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export type CopilotChatResponse =
  | { configured: true; reply: string }
  | { configured: false };
