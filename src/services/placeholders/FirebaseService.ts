export const FirebaseService = {
  async initialize() {
    return { connected: false, mode: 'mock' as const };
  },
};
