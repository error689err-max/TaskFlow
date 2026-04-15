import { api } from "../../../shared/lib/axios";

export const inviteApi = {
  sendInvite: async (email: string, projectId: string) => {
    const response = await api.post("/invite/send", { email, projectId });
    return response.data;
  },
};
