export const COLORS = {
  surface: '#05151d',
  onSurface: '#d4e5f0',
  primary: '#9edba8',
  onPrimary: '#003919',
  primaryContainer: '#83bf8e',
  onPrimaryContainer: '#114e28',
  secondary: '#9cd2bc',
  tertiary: '#bcd4ae',
  error: '#ffb4ab',
  background: '#05151d',
  // Custom Game Boy Green Shades
  gbBackground: '#081820',
  gbMoss: '#346856',
  gbJungle: '#114e28',
  gbPaleLime: '#e0f8d0',
  gbLCD: '#88c070',
  gbLCDDark: '#0e2007',
};

export const MOCK_HISTORY = [
  { id: 842, date: '24 OCT 1998', score: 84200, lines: 142, level: 22, duration: '14:22', rank: 'S' },
  { id: 841, date: '23 OCT 1998', score: 76500, lines: 118, level: 19, duration: '12:05', rank: 'A' },
  { id: 840, date: '22 OCT 1998', score: 52100, lines: 94, level: 15, duration: '09:44', rank: 'B' },
];

export const MOCK_LEADERBOARD = {
  friends: [
    { rank: 1, name: 'PXL_LVR', score: 9450, icon: 'face' },
    { rank: 2, name: 'BLOCKZ', score: 8120, icon: 'mood' },
    { rank: 3, name: 'TET_BOY', score: 7500, icon: 'sentiment_neutral' },
  ],
  global: [
    { rank: 1, name: 'T_MASTER', score: 99999 },
    { rank: 2, name: 'LINES_4_DAYS', score: 98500 },
    { rank: 3, name: 'DROP_IT', score: 97200 },
    { rank: 4, name: 'SPIN_DOC', score: 95000 },
  ],
  user: { rank: 42, name: 'RETRO_USER_01', score: 999999 }
};
