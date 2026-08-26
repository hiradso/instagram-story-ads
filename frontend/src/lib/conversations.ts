import { api } from './api'
import type { Conversation, Message, PaginatedResponse } from '../types'

export function fetchConversations() {
  return api.get<PaginatedResponse<Conversation>>('/conversations').then((res) => res.data)
}

export function fetchMessages(conversationId: number, afterId?: number) {
  return api
    .get<Message[]>(`/conversations/${conversationId}/messages`, { params: { after_id: afterId } })
    .then((res) => res.data)
}

export function sendMessage(conversationId: number, body: string) {
  return api.post<Message>(`/conversations/${conversationId}/messages`, { body }).then((res) => res.data)
}

export interface StartConversationData {
  campaign_id: number
  ambassador_profile_id: number
  message: string
  brief_file: File | null
}

export function startConversation(data: StartConversationData) {
  const formData = new FormData()
  formData.append('campaign_id', String(data.campaign_id))
  formData.append('ambassador_profile_id', String(data.ambassador_profile_id))
  formData.append('message', data.message)
  if (data.brief_file) formData.append('brief_file', data.brief_file)

  return api
    .post<Conversation>('/advertiser/conversations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data)
}

export function agreeConversation(conversationId: number) {
  return api.post(`/advertiser/conversations/${conversationId}/agree`)
}

export function declineConversation(conversationId: number) {
  return api.post<Conversation>(`/conversations/${conversationId}/decline`).then((res) => res.data)
}
