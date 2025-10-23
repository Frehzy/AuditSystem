import { apiClient } from '@/core/services/api/api-client.service';

class ChatApiService {
  private readonly basePath = '/Chat';

  // Добавьте типизацию response
  async sendMessage(message: string): Promise<any> {
    const endpoint = `${this.basePath}/send`;

    try {
      const response = await apiClient.post(endpoint, { message });
      return (response as any).data;
    } catch (error) {
      throw error;
    }
  }

  async getHistory(): Promise<any[]> {
    const endpoint = `${this.basePath}/history`;

    try {
      const response = await apiClient.get(endpoint);
      const data = (response as any).data;
      return data?.data || data || [];
    } catch (error) {
      throw error;
    }
  }
}

export const chatApiService = new ChatApiService();
