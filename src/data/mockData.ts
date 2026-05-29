import type {
  Birthday,
  CalendarEvent,
  FamilyMember,
  Reminder,
  ShoppingList,
  UserProfile,
  WeatherAlert,
} from '../types';

export const today = '2026-05-13';

export const userProfile: UserProfile = {
  id: 'sofia',
  name: 'Sofia',
  personality: 'sweet',
  reminderInterests: ['weather', 'birthdays', 'calendar', 'shopping', 'family', 'routines'],
};

export const weatherAlerts: WeatherAlert[] = [
  {
    id: 'rain-today',
    type: 'rain',
    date: today,
    severity: 'medium',
    title: 'Rainy afternoon',
    message: 'A rainy patch is expected after lunch.',
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'workout',
    title: 'Morning workout',
    startsAt: '2026-05-13T07:30:00',
    category: 'personal',
  },
  {
    id: 'project-meeting',
    title: 'Project meeting',
    startsAt: '2026-05-13T09:00:00',
    category: 'work',
    isImportant: true,
  },
  {
    id: 'lunch-emma',
    title: 'Lunch with Emma',
    startsAt: '2026-05-13T12:30:00',
    category: 'family',
  },
  {
    id: 'dry-cleaning',
    title: 'Pick up dry cleaning',
    startsAt: '2026-05-13T15:00:00',
    category: 'personal',
  },
  {
    id: 'family-dinner',
    title: 'Dinner with family',
    startsAt: '2026-05-13T18:30:00',
    category: 'family',
  },
  {
    id: 'doctor',
    title: 'Doctor appointment',
    startsAt: '2026-05-14T10:00:00',
    category: 'medical',
    preparationNote: 'Prepare your health card tonight.',
    isImportant: true,
  },
];

export const birthdays: Birthday[] = [
  {
    id: 'noah-birthday',
    name: 'Noah',
    date: '2026-05-16',
    relationship: 'nephew',
    note: 'He loves chocolate cake.',
    favoriteCakeOrTreat: 'chocolate cake',
    giftIdea: 'Dinosaur sticker book',
  },
  {
    id: 'emma-birthday',
    name: 'Emma',
    date: '2026-05-24',
    relationship: 'friend',
    note: 'She likes wildflowers and handwritten notes.',
    giftIdea: 'Wildflowers and a handwritten note',
  },
];

export const shoppingList: ShoppingList = {
  id: 'weekly-groceries',
  title: 'Shopping List',
  items: [
    { id: 'milk', label: 'Milk', checked: true, essential: true, isEssential: true },
    { id: 'eggs', label: 'Eggs', checked: true, essential: true, isEssential: true },
    { id: 'bread', label: 'Bread', checked: false, essential: true, isEssential: true },
    { id: 'chicken', label: 'Chicken', checked: false, essential: true, isEssential: true },
    { id: 'baby-wipes', label: 'Baby wipes', checked: false },
    { id: 'laundry', label: 'Laundry detergent', checked: false, essential: true, isEssential: true },
  ],
};

export const reminders: Reminder[] = [
  {
    id: 'plants',
    title: 'Water the plants',
    message: 'The little leafy roommates need a drink.',
    category: 'routines',
    priority: 'normal',
    repeat: 'daily',
  },
  {
    id: 'call-mom',
    title: 'Call Mom',
    message: 'A tiny call counts as a big hug.',
    category: 'family',
    priority: 'normal',
    repeat: 'weekly',
  },
  {
    id: 'read',
    title: 'Read 10 pages before bed',
    message: 'Future you will feel very literary.',
    category: 'routines',
    priority: 'low',
    repeat: 'daily',
  },
];

export const familyMembers: FamilyMember[] = [
  {
    id: 'noah',
    name: 'Noah',
    relationship: 'Nephew',
    birthday: '2026-05-16',
    favoriteThings: ['Chocolate cake', 'Dinosaurs', 'Blue balloons'],
    careNote: 'Turns 8 this week.',
    notes: 'Favorite treat: chocolate cake.',
  },
  {
    id: 'emma',
    name: 'Emma',
    relationship: 'Friend',
    birthday: '2026-05-24',
    favoriteThings: ['Wildflowers', 'Coffee walks'],
    careNote: 'Lunch today at 12:30.',
  },
  {
    id: 'mama',
    name: 'Mom',
    relationship: 'Mother',
    favoriteThings: ['Voice notes', 'Garden photos'],
    careNote: 'Call her tonight.',
  },
];

export const momCheckInput = {
  today,
  userProfile,
  reminders,
  calendarEvents,
  birthdays,
  familyMembers,
  shoppingList,
  weatherAlerts,
};
