import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Boston area locations with precise addresses
const bostonLocations = [
  { name: "Boston Common", address: "139 Tremont St, Boston, MA 02111", lat: 42.3555, lng: -71.0640, city: "Boston, MA" },
  { name: "Cambridge Common", address: "1 Garden St, Cambridge, MA 02138", lat: 42.3751, lng: -71.1193, city: "Cambridge, MA" },
  { name: "Harvard Square", address: "Harvard Square, Cambridge, MA 02138", lat: 42.3736, lng: -71.1190, city: "Cambridge, MA" },
  { name: "MIT Campus", address: "77 Massachusetts Ave, Cambridge, MA 02139", lat: 42.3590, lng: -71.0935, city: "Cambridge, MA" },
  { name: "Charles River Esplanade", address: "Storrow Dr, Boston, MA 02116", lat: 42.3562, lng: -71.0805, city: "Boston, MA" },
  { name: "Fenway Park Area", address: "4 Yawkey Way, Boston, MA 02215", lat: 42.3467, lng: -71.0972, city: "Boston, MA" },
  { name: "North End", address: "193 Salem St, Boston, MA 02113", lat: 42.3647, lng: -71.0542, city: "Boston, MA" },
  { name: "Back Bay", address: "200 Boylston St, Boston, MA 02116", lat: 42.3505, lng: -71.0763, city: "Boston, MA" },
  { name: "South End", address: "600 Harrison Ave, Boston, MA 02118", lat: 42.3396, lng: -71.0675, city: "Boston, MA" },
  { name: "Beacon Hill", address: "25 Beacon St, Boston, MA 02108", lat: 42.3588, lng: -71.0707, city: "Boston, MA" },
  { name: "Jamaica Plain", address: "3348 Washington St, Jamaica Plain, MA 02130", lat: 42.3098, lng: -71.1203, city: "Jamaica Plain, MA" },
  { name: "Somerville Center", address: "85 Highland Ave, Somerville, MA 02143", lat: 42.3875, lng: -71.0994, city: "Somerville, MA" },
  { name: "Davis Square", address: "Davis Square, Somerville, MA 02144", lat: 42.3967, lng: -71.1226, city: "Somerville, MA" },
  { name: "Porter Square", address: "Porter Square, Cambridge, MA 02140", lat: 42.3884, lng: -71.1191, city: "Cambridge, MA" },
  { name: "Allston", address: "1430 Commonwealth Ave, Allston, MA 02134", lat: 42.3528, lng: -71.1369, city: "Allston, MA" },
  { name: "Brighton", address: "360 Washington St, Brighton, MA 02135", lat: 42.3479, lng: -71.1508, city: "Brighton, MA" },
  { name: "Brookline Village", address: "25 Harvard St, Brookline, MA 02445", lat: 42.3324, lng: -71.1205, city: "Brookline, MA" },
  { name: "Newton Centre", address: "1180 Beacon St, Newton, MA 02459", lat: 42.3251, lng: -71.1920, city: "Newton, MA" },
  { name: "Watertown Square", address: "123 Main St, Watertown, MA 02472", lat: 42.3648, lng: -71.1825, city: "Watertown, MA" },
  { name: "Fresh Pond", address: "Fresh Pond Pkwy, Cambridge, MA 02138", lat: 42.3888, lng: -71.1475, city: "Cambridge, MA" },
  { name: "Charlestown", address: "1 Main St, Charlestown, MA 02129", lat: 42.3782, lng: -71.0602, city: "Charlestown, MA" },
  { name: "East Boston", address: "250 Meridian St, East Boston, MA 02128", lat: 42.3696, lng: -71.0395, city: "East Boston, MA" },
  { name: "Dorchester", address: "1570 Dorchester Ave, Dorchester, MA 02122", lat: 42.3118, lng: -71.0661, city: "Dorchester, MA" },
  { name: "Roxbury", address: "2300 Washington St, Roxbury, MA 02119", lat: 42.3190, lng: -71.0896, city: "Roxbury, MA" },
  { name: "Medford Square", address: "85 Riverside Ave, Medford, MA 02155", lat: 42.4184, lng: -71.1061, city: "Medford, MA" },
  { name: "Arlington Center", address: "869 Massachusetts Ave, Arlington, MA 02476", lat: 42.4153, lng: -71.1564, city: "Arlington, MA" },
  { name: "Belmont Center", address: "484 Common St, Belmont, MA 02478", lat: 42.3959, lng: -71.1786, city: "Belmont, MA" },
  { name: "Lexington Center", address: "1625 Massachusetts Ave, Lexington, MA 02421", lat: 42.4430, lng: -71.2308, city: "Lexington, MA" },
  { name: "Waltham Common", address: "610 Main St, Waltham, MA 02451", lat: 42.3765, lng: -71.2356, city: "Waltham, MA" },
  { name: "Quincy Center", address: "1308 Hancock St, Quincy, MA 02169", lat: 42.2529, lng: -71.0023, city: "Quincy, MA" }
];

const users = [
  {
    email: 'emma.chen@email.com',
    firstName: 'Emma',
    lastName: 'Chen',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    locationIndex: 0,
    goal: 'FIVE_K',
    socialUrl: 'https://www.instagram.com/emma_runs_boston',
    paceMin: 8.5,
    paceMax: 10.0,
    radius: 3,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] }
  },
  {
    email: 'marcus.thompson@email.com',
    firstName: 'Marcus',
    lastName: 'Thompson',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    locationIndex: 1,
    goal: 'TEN_K',
    socialUrl: 'https://www.strava.com/athletes/marcus_runner',
    paceMin: 7.0,
    paceMax: 8.5,
    radius: 5,
    schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] }
  },
  {
    email: 'sarah.martinez@email.com',
    firstName: 'Sarah',
    lastName: 'Martinez',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    locationIndex: 2,
    goal: 'HALF_MARATHON',
    socialUrl: 'https://www.instagram.com/sarah_half_marathon',
    paceMin: 8.0,
    paceMax: 9.5,
    radius: 8,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "sunday": ["AM"] }
  },
  {
    email: 'david.kim@email.com',
    firstName: 'David',
    lastName: 'Kim',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    locationIndex: 3,
    goal: 'MARATHON',
    socialUrl: 'https://davidrunning.blog',
    paceMin: 7.5,
    paceMax: 8.8,
    radius: 10,
    schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'lisa.johnson@email.com',
    firstName: 'Lisa',
    lastName: 'Johnson',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    locationIndex: 4,
    goal: 'GENERAL_FITNESS',
    socialUrl: 'https://www.instagram.com/lisa_fitness_journey',
    paceMin: 9.0,
    paceMax: 11.0,
    radius: 4,
    schedule: { "monday": ["AM"], "friday": ["AM"] }
  },
  {
    email: 'alex.rodriguez@email.com',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    locationIndex: 5,
    goal: 'TEN_K',
    socialUrl: 'https://www.strava.com/athletes/alex_10k',
    paceMin: 6.8,
    paceMax: 8.2,
    radius: 6,
    schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] }
  },
  {
    email: 'jennifer.wilson@email.com',
    firstName: 'Jennifer',
    lastName: 'Wilson',
    profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    locationIndex: 6,
    goal: 'FIVE_K',
    socialUrl: 'https://twitter.com/jen_5k_runner',
    paceMin: 8.8,
    paceMax: 10.5,
    radius: 3,
    schedule: { "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'michael.brown@email.com',
    firstName: 'Michael',
    lastName: 'Brown',
    profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    locationIndex: 7,
    goal: 'TRAIL',
    socialUrl: 'https://miketrailrunning.com',
    paceMin: 8.5,
    paceMax: 10.0,
    radius: 12,
    schedule: { "saturday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'amanda.davis@email.com',
    firstName: 'Amanda',
    lastName: 'Davis',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    locationIndex: 8,
    goal: 'SOCIAL',
    socialUrl: 'https://www.meetup.com/amanda-social-runs',
    paceMin: 9.5,
    paceMax: 11.5,
    radius: 5,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] }
  },
  {
    email: 'james.miller@email.com',
    firstName: 'James',
    lastName: 'Miller',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    locationIndex: 9,
    goal: 'HALF_MARATHON',
    socialUrl: 'https://www.instagram.com/james_half_boston',
    paceMin: 7.8,
    paceMax: 9.0,
    radius: 7,
    schedule: { "tuesday": ["AM"], "thursday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'rachel.garcia@email.com',
    firstName: 'Rachel',
    lastName: 'Garcia',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    locationIndex: 10,
    goal: 'MARATHON',
    socialUrl: 'https://www.strava.com/athletes/rachel_marathon',
    paceMin: 8.2,
    paceMax: 9.5,
    radius: 15,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'kevin.lee@email.com',
    firstName: 'Kevin',
    lastName: 'Lee',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    locationIndex: 11,
    goal: 'TEN_K',
    socialUrl: 'https://linkedin.com/in/kevin-lee-runner',
    paceMin: 7.2,
    paceMax: 8.5,
    radius: 6,
    schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] }
  },
  {
    email: 'nicole.taylor@email.com',
    firstName: 'Nicole',
    lastName: 'Taylor',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    locationIndex: 12,
    goal: 'FIVE_K',
    socialUrl: 'https://www.facebook.com/nicole.runner.5k',
    paceMin: 9.0,
    paceMax: 10.8,
    radius: 4,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] }
  },
  {
    email: 'ryan.anderson@email.com',
    firstName: 'Ryan',
    lastName: 'Anderson',
    profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    locationIndex: 13,
    goal: 'TRAIL',
    socialUrl: 'https://www.alltrails.com/members/ryan-anderson',
    paceMin: 8.0,
    paceMax: 9.8,
    radius: 10,
    schedule: { "saturday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'stephanie.white@email.com',
    firstName: 'Stephanie',
    lastName: 'White',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    locationIndex: 14,
    goal: 'GENERAL_FITNESS',
    socialUrl: 'https://www.instagram.com/steph_fitness_allston',
    paceMin: 9.2,
    paceMax: 11.0,
    radius: 5,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] }
  },
  {
    email: 'carlos.lopez@email.com',
    firstName: 'Carlos',
    lastName: 'Lopez',
    profileImageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    locationIndex: 15,
    goal: 'HALF_MARATHON',
    socialUrl: 'https://www.strava.com/athletes/carlos_brighton_half',
    paceMin: 7.5,
    paceMax: 8.8,
    radius: 8,
    schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"] }
  },
  {
    email: 'maria.gonzalez@email.com',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    locationIndex: 16,
    goal: 'MARATHON',
    socialUrl: 'https://www.instagram.com/maria_brookline_marathon',
    paceMin: 8.5,
    paceMax: 9.8,
    radius: 12,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'brian.clark@email.com',
    firstName: 'Brian',
    lastName: 'Clark',
    profileImageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    locationIndex: 17,
    goal: 'TEN_K',
    socialUrl: 'https://brianrunsnewton.blogspot.com',
    paceMin: 6.8,
    paceMax: 8.0,
    radius: 6,
    schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] }
  },
  {
    email: 'jessica.hall@email.com',
    firstName: 'Jessica',
    lastName: 'Hall',
    profileImageUrl: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face',
    locationIndex: 18,
    goal: 'SOCIAL',
    socialUrl: 'https://www.meetup.com/watertown-social-runners',
    paceMin: 9.8,
    paceMax: 11.5,
    radius: 4,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] }
  },
  {
    email: 'daniel.young@email.com',
    firstName: 'Daniel',
    lastName: 'Young',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    locationIndex: 19,
    goal: 'FIVE_K',
    socialUrl: 'https://www.instagram.com/daniel_freshpond_5k',
    paceMin: 8.5,
    paceMax: 10.2,
    radius: 3,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] }
  },
  {
    email: 'lauren.king@email.com',
    firstName: 'Lauren',
    lastName: 'King',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    locationIndex: 20,
    goal: 'HALF_MARATHON',
    socialUrl: 'https://www.strava.com/athletes/lauren_charlestown',
    paceMin: 8.0,
    paceMax: 9.2,
    radius: 7,
    schedule: { "tuesday": ["AM"], "thursday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'anthony.wright@email.com',
    firstName: 'Anthony',
    lastName: 'Wright',
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    locationIndex: 21,
    goal: 'TRAIL',
    socialUrl: 'https://www.alltrails.com/members/anthony-eastboston',
    paceMin: 8.2,
    paceMax: 10.0,
    radius: 15,
    schedule: { "saturday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'megan.scott@email.com',
    firstName: 'Megan',
    lastName: 'Scott',
    profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    locationIndex: 22,
    goal: 'GENERAL_FITNESS',
    socialUrl: 'https://www.instagram.com/megan_dorchester_fitness',
    paceMin: 9.5,
    paceMax: 11.8,
    radius: 5,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "friday": ["PM"] }
  },
  {
    email: 'christopher.green@email.com',
    firstName: 'Christopher',
    lastName: 'Green',
    profileImageUrl: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    locationIndex: 23,
    goal: 'MARATHON',
    socialUrl: 'https://chrisroxburymarathon.wordpress.com',
    paceMin: 7.8,
    paceMax: 9.0,
    radius: 10,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'ashley.adams@email.com',
    firstName: 'Ashley',
    lastName: 'Adams',
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    locationIndex: 24,
    goal: 'TEN_K',
    socialUrl: 'https://www.strava.com/athletes/ashley_medford_10k',
    paceMin: 7.5,
    paceMax: 8.8,
    radius: 6,
    schedule: { "tuesday": ["PM"], "thursday": ["PM"], "saturday": ["AM"] }
  },
  {
    email: 'matthew.baker@email.com',
    firstName: 'Matthew',
    lastName: 'Baker',
    profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    locationIndex: 25,
    goal: 'FIVE_K',
    socialUrl: 'https://www.instagram.com/matt_arlington_5k',
    paceMin: 8.8,
    paceMax: 10.5,
    radius: 4,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"] }
  },
  {
    email: 'samantha.nelson@email.com',
    firstName: 'Samantha',
    lastName: 'Nelson',
    profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    locationIndex: 26,
    goal: 'SOCIAL',
    socialUrl: 'https://www.meetup.com/belmont-social-running-group',
    paceMin: 10.0,
    paceMax: 12.0,
    radius: 3,
    schedule: { "monday": ["PM"], "wednesday": ["PM"], "sunday": ["AM"] }
  },
  {
    email: 'joshua.carter@email.com',
    firstName: 'Joshua',
    lastName: 'Carter',
    profileImageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    locationIndex: 27,
    goal: 'HALF_MARATHON',
    socialUrl: 'https://www.strava.com/athletes/josh_lexington_half',
    paceMin: 7.2,
    paceMax: 8.5,
    radius: 8,
    schedule: { "tuesday": ["AM"], "thursday": ["AM"], "saturday": ["AM"] }
  },
  {
    email: 'elizabeth.mitchell@email.com',
    firstName: 'Elizabeth',
    lastName: 'Mitchell',
    profileImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    locationIndex: 28,
    goal: 'TRAIL',
    socialUrl: 'https://www.alltrails.com/members/liz-waltham-trails',
    paceMin: 8.5,
    paceMax: 10.2,
    radius: 12,
    schedule: { "saturday": ["AM"], "sunday": ["AM"] }
  },
  {
    email: 'andrew.perez@email.com',
    firstName: 'Andrew',
    lastName: 'Perez',
    profileImageUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
    locationIndex: 29,
    goal: 'MARATHON',
    socialUrl: 'https://andrewquincymarathon.com',
    paceMin: 8.0,
    paceMax: 9.3,
    radius: 10,
    schedule: { "monday": ["AM"], "wednesday": ["AM"], "friday": ["AM"], "sunday": ["AM"] }
  }
];

// 10 runs across Boston with precise locations
const runs = [
  {
    title: "Boston Common Morning Loop",
    locationIndex: 0,
    hostEmail: 'emma.chen@email.com',
    startDate: '2025-08-25',
    startTime: '07:00',
    paceTarget: 9.0,
    maxPeople: 8
  },
  {
    title: "Charles River Esplanade Run",
    locationIndex: 4,
    hostEmail: 'marcus.thompson@email.com',
    startDate: '2025-08-25',
    startTime: '18:30',
    paceTarget: 7.5,
    maxPeople: 12
  },
  {
    title: "Harvard Square to MIT Bridge",
    locationIndex: 2,
    hostEmail: 'sarah.martinez@email.com',
    startDate: '2025-08-26',
    startTime: '06:30',
    paceTarget: 8.5,
    maxPeople: 6
  },
  {
    title: "Back Bay Architecture Run",
    locationIndex: 7,
    hostEmail: 'david.kim@email.com',
    startDate: '2025-08-26',
    startTime: '19:00',
    paceTarget: 8.0,
    maxPeople: 10
  },
  {
    title: "Jamaica Plain Hill Training",
    locationIndex: 10,
    hostEmail: 'alex.rodriguez@email.com',
    startDate: '2025-08-27',
    startTime: '07:30',
    paceTarget: 7.8,
    maxPeople: 8
  },
  {
    title: "Somerville Community Run",
    locationIndex: 11,
    hostEmail: 'jennifer.wilson@email.com',
    startDate: '2025-08-27',
    startTime: '18:00',
    paceTarget: 9.5,
    maxPeople: 15
  },
  {
    title: "Fresh Pond Loop Easy Run",
    locationIndex: 19,
    hostEmail: 'michael.brown@email.com',
    startDate: '2025-08-28',
    startTime: '08:00',
    paceTarget: 9.8,
    maxPeople: 12
  },
  {
    title: "Brookline Village Speed Work",
    locationIndex: 16,
    hostEmail: 'carlos.lopez@email.com',
    startDate: '2025-08-28',
    startTime: '17:30',
    paceTarget: 7.2,
    maxPeople: 6
  },
  {
    title: "Beacon Hill Historic Run",
    locationIndex: 9,
    hostEmail: 'rachel.garcia@email.com',
    startDate: '2025-08-29',
    startTime: '06:45',
    paceTarget: 8.8,
    maxPeople: 10
  },
  {
    title: "Watertown Square Long Run",
    locationIndex: 18,
    hostEmail: 'james.miller@email.com',
    startDate: '2025-08-29',
    startTime: '08:30',
    paceTarget: 9.2,
    maxPeople: 8
  }
];

async function main() {
  console.log('🌱 Starting Boston area seeding with full addresses...');
  
  // Hash password for all demo users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Create users
  console.log('👥 Creating 30 users across Boston area with precise addresses...');
  const createdUsers = [];
  
  for (const u of users) {
    const location = bostonLocations[u.locationIndex];
    
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
            name: `${u.firstName} ${u.lastName}`,
            goal: u.goal,
            socialUrl: u.socialUrl,
            paceMin: u.paceMin,
            paceMax: u.paceMax,
            address: location.address,
            city: location.city,
            latitude: location.lat,
            longitude: location.lng,
            radius: u.radius,
            schedule: u.schedule,
            isComplete: true
          }
        }
      },
      include: {
        preferences: true
      }
    });
    
    createdUsers.push({ ...user, locationData: location });
    console.log(`   ✓ ${u.firstName} ${u.lastName} at ${location.address}`);
  }
  
  // Create runs with precise GPS coordinates
  console.log('🏃 Creating 10 runs across Boston locations...');
  
  for (const run of runs) {
    const hostUser = createdUsers.find(u => u.email === run.hostEmail);
    if (!hostUser) {
      console.log(`   ❌ Host ${run.hostEmail} not found for run: ${run.title}`);
      continue;
    }
    
    const location = bostonLocations[run.locationIndex];
    const runDateTime = new Date(`${run.startDate}T${run.startTime}`);
    
    const createdRun = await prisma.run.create({
      data: {
        hostId: hostUser.id,
        startAt: runDateTime,
        lat: location.lat,
        lng: location.lng,
        paceTarget: run.paceTarget,
        maxPeople: run.maxPeople
      }
    });
    
    console.log(`   ✓ ${run.title} at ${location.address}`);
  }
  
  console.log('🎉 Seeding completed successfully!');
  console.log(`
📊 Summary:
   • 30 users created with full street addresses
   • 10 runs scheduled at precise Boston locations
   • All users have password: password123
   • Each user has a single social URL instead of separate Instagram/Strava
   • GPS coordinates stored for precise location matching
   
🏠 Address Examples:
   • Emma Chen: 139 Tremont St, Boston, MA 02111
   • Marcus Thompson: 1 Garden St, Cambridge, MA 02138
   • Sarah Martinez: Harvard Square, Cambridge, MA 02138
   
🔗 Social Links Examples:
   • Instagram profiles
   • Strava athlete pages
   • Personal running blogs
   • Meetup group pages
   • LinkedIn profiles
  `);
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());