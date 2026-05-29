export const LocationService = {
  async getHomeLocation() {
    return { label: 'Home', mode: 'mock' as const };
  },
};
