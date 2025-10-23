export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  sessionId: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: Date
  lastMessageAt: Date
  messageCount: number
}

export interface SendMessageRequest {
  message: string
  sessionId?: string
}

export interface SendMessageResponse {
  message: ChatMessage
  session: ChatSession
}

export interface ChatState {
  messages: ChatMessage[]
  currentSession: ChatSession | null
  sessions: ChatSession[]
  isLoading: boolean
  error: string | null
}
