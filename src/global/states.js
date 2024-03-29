import {create} from 'zustand';
export const useAuthStore = create(set => ({
  user_id: null,
}));
