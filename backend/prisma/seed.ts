import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Boston area coordinates with precise locations
const bostonLocations = [
  { name: "Boston Common", lat: 42.3555, lng: -71.0640, city: "Boston, MA" },
  { name: "Cambridge Common", lat: 42.3751, lng: -71.1193, city: "Cambridge, MA" },
  { name: "Harvard Square", lat: 42.3736, lng: -71.1190, city: "Cambridge, MA" },
  { name: "MIT Campus", lat: 42.3590, lng: -71.0935, city: "Cambridge, MA" },
  { name: "Charles River Esplanade", lat: 42.3562, lng: -71.0805, city: "Boston, MA" },
  { name: "Fenway Park Area", lat: 42.3467, lng: -71.0972, city: "Boston, MA" },
  { name: "North End", lat: 42.3647, lng: -71.0542, city: "Boston, MA" },
  { name: "Back Bay", lat: 42.3505, lng: -71.0763, city: "Boston, MA" },
  { name: "South End", lat: 42.3396, lng: -71.0675, city: "Boston, MA" },
  { name: "Beacon Hill", lat: 42.3588, lng: -71.0707, city: "Boston, MA" },
  { name: "Jamaica Plain", lat: 42.3098, lng: -71.1203, city: "Jamaica Plain, MA" },
  { name: "Somerville Center", lat: 42.3875, lng: -71.0994, city: "Somerville, MA" },
  { name: "Davis Square", lat: 42.3967, lng: -71.1226, city: "Somerville, MA" },
  { name: "Porter Square", lat: 42.3884, lng: -71.1191, city: "Cambridge, MA" },
  { name: "Allston", lat: 42.3528, lng: -71.1369, city: "Allston, MA" },
  { name: "Brighton", lat: 42.3479, lng: -71.1508, city: "Brighton, MA" },
  { name: "Brookline Village", lat: 42.3324, lng: -71.1205, city: "Brookline, MA" },
  { name: "Newton Centre", lat: 42.3251, lng: -71.1920, city: "Newton, MA" },
  { name: "Watertown Square", lat: 42.3648, lng: -71.1825, city: "Watertown, MA" },
  { name: "Fresh Pond", lat: 42.3888, lng: -71.1475, city: "Cambridge, MA" },
  { name: "Charlestown", lat: 42.3782, lng: -71.0602, city: "Charlestown, MA" },
  { name: "East Boston", lat: 42.3696, lng: -71.0395, city: "East Boston, MA" },
  { name: "Dorchester", lat: 42.3118, lng: -71.0661, city: "Dorchester, MA" },
  { name: "Roxbury", lat: 42.3190, lng: -71.0896, city: "Roxbury, MA" },
  { name: "Medford Square", lat: 42.4184, lng: -71.1061, city: "Medford, MA" },
  { name: "Arlington Center", lat: 42.4153, lng: -71.1564, city: "Arlington, MA" },
  { name: "Belmont Center", lat: 42.3959, lng: -71.1786, city: "Belmont, MA" },
  { name: "Lexington Center", lat: 42.4430, lng: -71.2308, city: "Lexington, MA" },
  { name: "Waltham Common", lat: 42.3765, lng: -71.2356, city: "Waltham, MA" },
  { name: "Quincy Center", lat: 42.2529, lng: -71.0023, city: "Quincy, MA" }
];

const users = [
  {
    email: 'emma.chen@email.com',
    firstName: 'Emma',
    lastName: 'Chen',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[0],
    preferences: {
      name: 'Emma Chen',
      goal: 'FIVE_K',
      instagram: '@emma_runs_boston',
      strava: 'emma.chen.runs',
      paceMin: 8.5,
      paceMax: 10.0,
      radius: 3,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'marcus.thompson@email.com',
    firstName: 'Marcus',
    lastName: 'Thompson',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[1],
    preferences: {
      name: 'Marcus Thompson',
      goal: 'TEN_K',
      instagram: '@marcus_runner',
      strava: 'marcus.thompson',
      paceMin: 7.0,
      paceMax: 8.5,
      radius: 5,
      schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'sarah.martinez@email.com',
    firstName: 'Sarah',
    lastName: 'Martinez',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[2],
    preferences: {
      name: 'Sarah Martinez',
      goal: 'HALF_MARATHON',
      instagram: '@sarah_half_marathon',
      strava: 'sarah.martinez.runner',
      paceMin: 8.0,
      paceMax: 9.5,
      radius: 8,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'david.kim@email.com',
    firstName: 'David',
    lastName: 'Kim',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[3],
    preferences: {
      name: 'David Kim',
      goal: 'MARATHON',
      instagram: '@david_marathon',
      strava: 'david.kim.marathon',
      paceMin: 7.5,
      paceMax: 8.8,
      radius: 10,
      schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'lisa.johnson@email.com',
    firstName: 'Lisa',
    lastName: 'Johnson',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[4],
    preferences: {
      name: 'Lisa Johnson',
      goal: 'GENERAL_FITNESS',
      instagram: '@lisa_fitness',
      strava: 'lisa.johnson.runs',
      paceMin: 9.0,
      paceMax: 11.0,
      radius: 4,
      schedule: { "monday": ["AM"], "friday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'alex.rodriguez@email.com',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[5],
    preferences: {
      name: 'Alex Rodriguez',
      goal: 'TEN_K',
      instagram: '@alex_10k',
      strava: 'alex.rodriguez.runner',
      paceMin: 6.8,
      paceMax: 8.2,
      radius: 6,
      schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'jennifer.wilson@email.com',
    firstName: 'Jennifer',
    lastName: 'Wilson',
    profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[6],
    preferences: {
      name: 'Jennifer Wilson',
      goal: 'FIVE_K',
      instagram: '@jen_5k_runner',
      strava: 'jennifer.wilson',
      paceMin: 8.8,
      paceMax: 10.5,
      radius: 3,
      schedule: { "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'michael.brown@email.com',
    firstName: 'Michael',
    lastName: 'Brown',
    profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[7],
    preferences: {
      name: 'Michael Brown',
      goal: 'TRAIL',
      instagram: '@mike_trail_runner',
      strava: 'michael.brown.trail',
      paceMin: 8.5,
      paceMax: 10.0,
      radius: 12,
      schedule: { "saturday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'amanda.davis@email.com',
    firstName: 'Amanda',
    lastName: 'Davis',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[8],
    preferences: {
      name: 'Amanda Davis',
      goal: 'SOCIAL',
      instagram: '@amanda_social_runs',
      strava: 'amanda.davis.social',
      paceMin: 9.5,
      paceMax: 11.5,
      radius: 5,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] },
      isComplete: true
    }
  },
  {
    email: 'james.miller@email.com',
    firstName: 'James',
    lastName: 'Miller',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[9],
    preferences: {
      name: 'James Miller',
      goal: 'HALF_MARATHON',
      instagram: '@james_half',
      strava: 'james.miller.half',
      paceMin: 7.8,
      paceMax: 9.0,
      radius: 7,
      schedule: { "tuesday": ["AM"], "thursday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'rachel.garcia@email.com',
    firstName: 'Rachel',
    lastName: 'Garcia',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[10],
    preferences: {
      name: 'Rachel Garcia',
      goal: 'MARATHON',
      instagram: '@rachel_marathon',
      strava: 'rachel.garcia.marathon',
      paceMin: 8.2,
      paceMax: 9.5,
      radius: 15,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'kevin.lee@email.com',
    firstName: 'Kevin',
    lastName: 'Lee',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[11],
    preferences: {
      name: 'Kevin Lee',
      goal: 'TEN_K',
      instagram: '@kevin_10k',
      strava: 'kevin.lee.10k',
      paceMin: 7.2,
      paceMax: 8.5,
      radius: 6,
      schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'nicole.taylor@email.com',
    firstName: 'Nicole',
    lastName: 'Taylor',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[12],
    preferences: {
      name: 'Nicole Taylor',
      goal: 'FIVE_K',
      instagram: '@nicole_5k',
      strava: 'nicole.taylor.5k',
      paceMin: 9.0,
      paceMax: 10.8,
      radius: 4,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'ryan.anderson@email.com',
    firstName: 'Ryan',
    lastName: 'Anderson',
    profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[13],
    preferences: {
      name: 'Ryan Anderson',
      goal: 'TRAIL',
      instagram: '@ryan_trails',
      strava: 'ryan.anderson.trail',
      paceMin: 8.0,
      paceMax: 9.8,
      radius: 10,
      schedule: { "saturday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'stephanie.white@email.com',
    firstName: 'Stephanie',
    lastName: 'White',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[14],
    preferences: {
      name: 'Stephanie White',
      goal: 'GENERAL_FITNESS',
      instagram: '@steph_fitness',
      strava: 'stephanie.white.fitness',
      paceMin: 9.2,
      paceMax: 11.0,
      radius: 5,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] },
      isComplete: true
    }
  },
  {
    email: 'carlos.lopez@email.com',
    firstName: 'Carlos',
    lastName: 'Lopez',
    profileImageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[15],
    preferences: {
      name: 'Carlos Lopez',
      goal: 'HALF_MARATHON',
      instagram: '@carlos_half',
      strava: 'carlos.lopez.half',
      paceMin: 7.5,
      paceMax: 8.8,
      radius: 8,
      schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'maria.gonzalez@email.com',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[16],
    preferences: {
      name: 'Maria Gonzalez',
      goal: 'MARATHON',
      instagram: '@maria_marathon',
      strava: 'maria.gonzalez.marathon',
      paceMin: 8.5,
      paceMax: 9.8,
      radius: 12,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'brian.clark@email.com',
    firstName: 'Brian',
    lastName: 'Clark',
    profileImageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[17],
    preferences: {
      name: 'Brian Clark',
      goal: 'TEN_K',
      instagram: '@brian_10k',
      strava: 'brian.clark.10k',
      paceMin: 6.8,
      paceMax: 8.0,
      radius: 6,
      schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'jessica.hall@email.com',
    firstName: 'Jessica',
    lastName: 'Hall',
    profileImageUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[18],
    preferences: {
      name: 'Jessica Hall',
      goal: 'SOCIAL',
      instagram: '@jess_social_runs',
      strava: 'jessica.hall.social',
      paceMin: 9.8,
      paceMax: 11.5,
      radius: 4,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] },
      isComplete: true
    }
  },
  {
    email: 'daniel.young@email.com',
    firstName: 'Daniel',
    lastName: 'Young',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[19],
    preferences: {
      name: 'Daniel Young',
      goal: 'FIVE_K',
      instagram: '@daniel_5k',
      strava: 'daniel.young.5k',
      paceMin: 8.5,
      paceMax: 10.2,
      radius: 3,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'lauren.king@email.com',
    firstName: 'Lauren',
    lastName: 'King',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[20],
    preferences: {
      name: 'Lauren King',
      goal: 'HALF_MARATHON',
      instagram: '@lauren_half',
      strava: 'lauren.king.half',
      paceMin: 8.0,
      paceMax: 9.2,
      radius: 7,
      schedule: { "tuesday": ["AM"], "thursday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'anthony.wright@email.com',
    firstName: 'Anthony',
    lastName: 'Wright',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[21],
    preferences: {
      name: 'Anthony Wright',
      goal: 'TRAIL',
      instagram: '@anthony_trails',
      strava: 'anthony.wright.trail',
      paceMin: 8.2,
      paceMax: 10.0,
      radius: 15,
      schedule: { "saturday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'megan.scott@email.com',
    firstName: 'Megan',
    lastName: 'Scott',
    profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[22],
    preferences: {
      name: 'Megan Scott',
      goal: 'GENERAL_FITNESS',
      instagram: '@megan_fitness',
      strava: 'megan.scott.fitness',
      paceMin: 9.5,
      paceMax: 11.8,
      radius: 5,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] },
      isComplete: true
    }
  },
  {
    email: 'christopher.green@email.com',
    firstName: 'Christopher',
    lastName: 'Green',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[23],
    preferences: {
      name: 'Christopher Green',
      goal: 'MARATHON',
      instagram: '@chris_marathon',
      strava: 'christopher.green.marathon',
      paceMin: 7.8,
      paceMax: 9.0,
      radius: 10,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'ashley.adams@email.com',
    firstName: 'Ashley',
    lastName: 'Adams',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[24],
    preferences: {
      name: 'Ashley Adams',
      goal: 'TEN_K',
      instagram: '@ashley_10k',
      strava: 'ashley.adams.10k',
      paceMin: 7.5,
      paceMax: 8.8,
      radius: 6,
      schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'matthew.baker@email.com',
    firstName: 'Matthew',
    lastName: 'Baker',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[25],
    preferences: {
      name: 'Matthew Baker',
      goal: 'FIVE_K',
      instagram: '@matt_5k',
      strava: 'matthew.baker.5k',
      paceMin: 8.8,
      paceMax: 10.5,
      radius: 4,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'samantha.nelson@email.com',
    firstName: 'Samantha',
    lastName: 'Nelson',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[26],
    preferences: {
      name: 'Samantha Nelson',
      goal: 'SOCIAL',
      instagram: '@sam_social_runs',
      strava: 'samantha.nelson.social',
      paceMin: 10.0,
      paceMax: 12.0,
      radius: 3,
      schedule: { "monday": ["PM"], "wednesday": ["PM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'joshua.carter@email.com',
    firstName: 'Joshua',
    lastName: 'Carter',
    profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[27],
    preferences: {
      name: 'Joshua Carter',
      goal: 'HALF_MARATHON',
      instagram: '@josh_half',
      strava: 'joshua.carter.half',
      paceMin: 7.2,
      paceMax: 8.5,
      radius: 8,
      schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'elizabeth.mitchell@email.com',
    firstName: 'Elizabeth',
    lastName: 'Mitchell',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[28],
    preferences: {
      name: 'Elizabeth Mitchell',
      goal: 'TRAIL',
      instagram: '@liz_trails',
      strava: 'elizabeth.mitchell.trail',
      paceMin: 8.5,
      paceMax: 10.2,
      radius: 12,
      schedule: { "saturday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  },
  {
    email: 'andrew.perez@email.com',
    firstName: 'Andrew',
    lastName: 'Perez',
    profileImageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    location: bostonLocations[29],
    preferences: {
      name: 'Andrew Perez',
      goal: 'MARATHON',
      instagram: '@andrew_marathon',
      strava: 'andrew.perez.marathon',
      paceMin: 8.0,
      paceMax: 9.3,
      radius: 10,
      schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] },
      isComplete: true
    }
  }
];

// 10 runs across Boston with precise locations
const runs = [
  {
    title: "Boston Common Morning Loop",
    location: bostonLocations[0],
    hostEmail: 'emma.chen@email.com',
    startDate: '2025-08-25',
    startTime: '07:00',
    paceTarget: 9.0,
    maxPeople: 8
  },
  {
    title: "Charles River Esplanade Run",
    location: bostonLocations[4],
    hostEmail: 'marcus.thompson@email.com',
    startDate: '2025-08-25',
    startTime: '18:30',
    paceTarget: 7.5,
    maxPeople: 12
  },
  {
    title: "Harvard Square to MIT Bridge",
    location: bostonLocations[2],
    hostEmail: 'sarah.martinez@email.com',
    startDate: '2025-08-26',
    startTime: '06:30',
    paceTarget: 8.5,
    maxPeople: 6
  },
  {
    title: "Back Bay Architecture Run",
    location: bostonLocations[7],
    hostEmail: 'david.kim@email.com',
    startDate: '2025-08-26',
    startTime: '19:00',
    paceTarget: 8.0,
    maxPeople: 10
  },
  {
    title: "Jamaica Plain Hill Training",
    location: bostonLocations[10],
    hostEmail: 'alex.rodriguez@email.com',
    startDate: '2025-08-27',
    startTime: '07:30',
    paceTarget: 7.8,
    maxPeople: 8
  },
  {
    title: "Somerville Community Run",
    location: bostonLocations[11],
    hostEmail: 'jennifer.wilson@email.com',
    startDate: '2025-08-27',
    startTime: '18:00',
    paceTarget: 9.5,
    maxPeople: 15
  },
  {
    title: "Fresh Pond Loop Easy Run",
    location: bostonLocations[19],
    hostEmail: 'michael.brown@email.com',
    startDate: '2025-08-28',
    startTime: '08:00',
    paceTarget: 9.8,
    maxPeople: 12
  },
  {
    title: "Brookline Village Speed Work",
    location: bostonLocations[16],
    hostEmail: 'carlos.lopez@email.com',
    startDate: '2025-08-28',
    startTime: '17:30',
    paceTarget: 7.2,
    maxPeople: 6
  },
  {
    title: "Beacon Hill Historic Run",
    location: bostonLocations[9],
    hostEmail: 'rachel.garcia@email.com',
    startDate: '2025-08-29',
    startTime: '06:45',
    paceTarget: 8.8,
    maxPeople: 10
  },
  {
    title: "Watertown Square Long Run",
    location: bostonLocations[18],
    hostEmail: 'james.miller@email.com',
    startDate: '2025-08-29',
    startTime: '08:30',
    paceTarget: 9.2,
    maxPeople: 8
  }
];

async function main() {
  console.log('🌱 Starting Boston area seeding...');
  
  // Hash password for all demo users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create users
  console.log('👥 Creating 30 users across Boston area...');
  const createdUsers = [];
  
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashedPassword,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        preferences: {
          create: {
            ...u.preferences,
            location: u.location.city
          }
        }
      },
      include: {
        preferences: true
      }
    });
    
    createdUsers.push({ ...user, locationData: u.location });
    console.log(`   ✓ ${u.firstName} ${u.lastName} in ${u.location.city}`);
  }
  
  // Create runs with precise GPS coordinates
  console.log('🏃 Creating 10 runs across Boston locations...');
  
  for (const run of runs) {
    const hostUser = createdUsers.find(u => u.email === run.hostEmail);
    if (!hostUser) {
      console.log(`   ❌ Host ${run.hostEmail} not found for run: ${run.title}`);
      continue;
    }
    
    const runDateTime = new Date(`${run.startDate}T${run.startTime}`);
    
    const createdRun = await prisma.run.create({
      data: {
        hostId: hostUser.id,
        startAt: runDateTime,
        lat: run.location.lat,
        lng: run.location.lng,
        paceTarget: run.paceTarget,
        maxPeople: run.maxPeople
      }
    });
    
    console.log(`   ✓ ${run.title} at ${run.location.name} (${run.location.lat}, ${run.location.lng})`);
  }
  
  console.log('🎉 Seeding completed successfully!');
  console.log(`
📊 Summary:
   • 30 users created across Greater Boston area
   • 10 runs scheduled at precise Boston locations
   • All users have password: password123
   • Locations span from Boston to Cambridge, Somerville, Brookline, and surrounding areas
   • GPS coordinates are accurate for each location
   
🗺️  Run Locations:
   ${runs.map(r => `• ${r.title} at ${r.location.name}`).join('\n   ')}
  `);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());