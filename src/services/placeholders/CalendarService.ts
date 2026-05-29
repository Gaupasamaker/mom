import { calendarEvents } from '../../data/mockData';

export const CalendarService = {
  async listEvents() {
    return calendarEvents;
  },
};
