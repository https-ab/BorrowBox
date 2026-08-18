/**
 * BorrowBox seed script - realistic demo data.
 * Run: npm run seed
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Transaction from '../models/Transaction.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import Dispute from '../models/Dispute.js';
import { refreshTrust } from '../services/trustScoreService.js';
import { daysBetweenInclusive, startOfDay } from '../utils/dates.js';

const img = (id, w = 900) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;
const avatar = (seed) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ede9fe,dcfce7,fef3c7,fce7f3`;

const daysAgo = (n) => startOfDay(new Date(Date.now() - n * 86400000));
const daysAhead = (n) => startOfDay(new Date(Date.now() + n * 86400000));

// [lng, lat]
const LOC = {
  koregaonPark: [73.8938, 18.5362],
  baner: [73.7898, 18.559],
  kothrud: [73.8077, 18.5074],
  vimanNagar: [73.9143, 18.5679],
  hinjewadi: [73.7379, 18.5913],
  aundh: [73.8077, 18.5586],
  camp: [73.8797, 18.5089],
  hadapsar: [73.926, 18.5089],
  shivajinagar: [73.8478, 18.5314],
  bandra: [72.8397, 19.0596],
  andheri: [72.8697, 19.1197],
  powai: [72.9052, 19.1176],
  indiranagar: [77.6408, 12.9784],
  koramangala: [77.6245, 12.9352],
  hitechCity: [78.3772, 17.4435],
  hauzKhas: [77.2065, 28.5494],
};

async function seed() {
  await connectDB();
  console.log('[seed] clearing collections...');
  await Promise.all([
    User.deleteMany({}), Item.deleteMany({}), BorrowRequest.deleteMany({}),
    Transaction.deleteMany({}), Review.deleteMany({}), Notification.deleteMany({}), Dispute.deleteMany({}),
  ]);

  console.log('[seed] creating users...');
  const usersData = [
    { name: 'Rahul Sharma', email: 'rahul@borrowbox.in', city: 'Pune', loc: LOC.koregaonPark, isVerified: true, bio: 'Photography enthusiast and weekend trekker. I believe in sharing over owning — most of my gear is up for borrowing!', created: 420 },
    { name: 'Ananya Iyer', email: 'ananya@borrowbox.in', city: 'Pune', loc: LOC.baner, isVerified: true, bio: 'Product designer who loves music and books. Happy to lend, happier to chat about sci-fi.', created: 380 },
    { name: 'Vikram Patil', email: 'vikram@borrowbox.in', city: 'Pune', loc: LOC.kothrud, isVerified: true, bio: 'DIY junkie. My garage doubles as a mini hardware store for the neighbourhood.', created: 350 },
    { name: 'Sneha Kulkarni', email: 'sneha@borrowbox.in', city: 'Pune', loc: LOC.vimanNagar, isVerified: true, bio: 'Trekking, camping, repeat. Ask me about Sahyadri trails.', created: 300 },
    { name: 'Arjun Mehta', email: 'arjun@borrowbox.in', city: 'Pune', loc: LOC.hinjewadi, isVerified: true, bio: 'Software engineer by day, gamer by night. My consoles deserve more play time than I can give them.', created: 280 },
    { name: 'Priya Deshpande', email: 'priya@borrowbox.in', city: 'Pune', loc: LOC.aundh, isVerified: false, bio: 'Bookworm. My shelf is your shelf.', created: 200 },
    { name: 'Kabir Khan', email: 'kabir@borrowbox.in', city: 'Pune', loc: LOC.camp, isVerified: true, bio: 'Music producer. Gear should be played, not parked.', created: 260 },
    { name: 'Meera Joshi', email: 'meera@borrowbox.in', city: 'Pune', loc: LOC.hadapsar, isVerified: false, bio: 'Fitness coach and cyclist.', created: 150 },
    { name: 'Aditya Rao', email: 'aditya@borrowbox.in', city: 'Pune', loc: LOC.shivajinagar, isVerified: true, bio: 'Film student. Cameras, lights, action.', created: 190 },
    { name: 'Ishita Verma', email: 'ishita@borrowbox.in', city: 'Mumbai', loc: LOC.bandra, isVerified: true, bio: 'Travel vlogger based in Bandra. Borrow my gear while I edit!', created: 320 },
    { name: 'Rohan Nair', email: 'rohan@borrowbox.in', city: 'Mumbai', loc: LOC.andheri, isVerified: true, bio: 'Startup founder. Minimalist. Everything I own fits one shelf — and it is all listed here.', created: 240 },
    { name: 'Tanvi Kapoor', email: 'tanvi@borrowbox.in', city: 'Mumbai', loc: LOC.powai, isVerified: false, bio: 'Architect who paints on weekends.', created: 120 },
    { name: 'Siddharth Menon', email: 'siddharth@borrowbox.in', city: 'Bengaluru', loc: LOC.indiranagar, isVerified: true, bio: 'Hardware tinkerer in Indiranagar. Tools and test equipment available.', created: 270 },
    { name: 'Divya Reddy', email: 'divya@borrowbox.in', city: 'Bengaluru', loc: LOC.koramangala, isVerified: true, bio: 'Marathon runner and amateur astronomer.', created: 210 },
    { name: 'Farhan Ali', email: 'farhan@borrowbox.in', city: 'Hyderabad', loc: LOC.hitechCity, isVerified: false, bio: 'Content creator. Lights, mics and lenses on rotation.', created: 100 },
    { name: 'Nisha Gupta', email: 'nisha@borrowbox.in', city: 'Delhi', loc: LOC.hauzKhas, isVerified: true, bio: 'Baker and board-game host in Hauz Khas.', created: 160 },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await User.create({
      name: u.name, email: u.email, password: 'password123', city: u.city, bio: u.bio,
      avatar: avatar(u.name), isVerified: u.isVerified,
      location: { type: 'Point', coordinates: u.loc },
    });
    // Backdate account creation so trust "account age" is meaningful
    await User.updateOne({ _id: user._id }, { $set: { createdAt: daysAgo(u.created) } });
    users.push(user);
  }
  const [rahul, ananya, vikram, sneha, arjun, priya, kabir, meera, aditya, ishita, rohan, tanvi, siddharth, divya, farhan, nisha] = users;

  const admin = await User.create({
    name: 'BorrowBox Admin', email: 'admin@borrowbox.in', password: 'admin123', city: 'Pune',
    avatar: avatar('BorrowBox Admin'), role: 'admin', isVerified: true,
    location: { type: 'Point', coordinates: LOC.shivajinagar },
  });

  console.log('[seed] creating items...');
  const itemsData = [
    // Cameras
    { owner: rahul, name: 'Sony A6400 Mirrorless Camera', category: 'Cameras', price: 300, deposit: 2000, condition: 'Like New', area: 'Koregaon Park', loc: LOC.koregaonPark, images: [img('photo-1516035069371-29a1b244cc32'), img('photo-1502920917128-1aa500764cbd')], desc: 'Sony A6400 with 16-50mm kit lens, 2 batteries and a 64GB SD card. Crisp autofocus, flip screen for vlogging. Perfect for events, travel and college projects. Comes in a padded camera bag.', rules: 'Please return with batteries charged. No lens swapping without asking. Handle with the neck strap at all times.', created: 200 },
    { owner: aditya, name: 'Canon EOS 200D II DSLR', category: 'Cameras', price: 250, deposit: 1500, condition: 'Good', area: 'Shivajinagar', loc: LOC.shivajinagar, images: [img('photo-1502920917128-1aa500764cbd')], desc: 'Beginner-friendly DSLR with 18-55mm lens. Great in daylight, decent low light. Ideal if you are learning photography or need a reliable second body for a shoot.', rules: 'Return with an empty, formatted memory card. Small scuff on the grip already noted.', created: 150 },
    { owner: ishita, name: 'GoPro Hero 11 + Accessories Kit', category: 'Cameras', price: 350, deposit: 2500, condition: 'Like New', area: 'Bandra West', loc: LOC.bandra, images: [img('photo-1564466809058-bf4114d55352')], desc: 'GoPro Hero 11 Black with chest mount, head strap, suction mount and 3 batteries. Waterproof case included. Perfect for treks, rides and water sports.', rules: 'Rinse with fresh water after beach use. Do not open the case underwater.', created: 220 },
    { owner: rahul, name: 'DJI Mini 3 Pro Drone', category: 'Cameras', price: 800, deposit: 8000, condition: 'Like New', area: 'Koregaon Park', loc: LOC.koregaonPark, images: [img('photo-1473968512647-3e447244af8f')], desc: 'Sub-250g drone with 4K camera and 3 batteries (~90 min total flight time). Includes ND filters and a hard case. You must know local drone regulations before flying.', rules: 'Only fly in permitted zones. Any crash damage comes out of the deposit. Prior drone experience required.', created: 120 },
    { owner: farhan, name: 'Fujifilm Instax Mini 12', category: 'Cameras', price: 150, deposit: 500, condition: 'Good', area: 'HITEC City', loc: LOC.hitechCity, images: [img('photo-1526170375885-4d8ecf77b99f')], desc: 'Instant camera that is a guaranteed hit at parties and weddings. Comes with a pack of 10 films to get you started; extra film available on request.', rules: 'Film beyond the included pack is on you. Return the camera in its pouch.', created: 90 },

    // Gaming
    { owner: arjun, name: 'PlayStation 5 + 2 Controllers', category: 'Gaming', price: 400, deposit: 5000, condition: 'Like New', area: 'Hinjewadi', loc: LOC.hinjewadi, images: [img('photo-1606813907291-d86efa9b94db'), img('photo-1605901309584-818e25960a8f')], desc: 'Disc edition PS5 with two DualSense controllers. God of War Ragnarok and FIFA included. Ideal for weekend tournaments and house parties.', rules: 'No smoking around the console. Keep it well ventilated. Games must come back in their cases.', created: 180 },
    { owner: arjun, name: 'Nintendo Switch OLED', category: 'Gaming', price: 300, deposit: 3000, condition: 'Good', area: 'Hinjewadi', loc: LOC.hinjewadi, images: [img('photo-1578303512597-81e6cc155b3e')], desc: 'Switch OLED with Mario Kart 8 and Smash Bros. Two pairs of Joy-Cons so four players can jump in with the grip accessories.', rules: 'Joy-Con drift is not covered, everything else is. Return charged.', created: 160 },
    { owner: rohan, name: 'Meta Quest 3 VR Headset', category: 'Gaming', price: 500, deposit: 4000, condition: 'Like New', area: 'Andheri East', loc: LOC.andheri, images: [img('photo-1593508512255-86ab42a8e620')], desc: 'Quest 3 with Elite strap and silicone face cover (washable). Beat Saber, Golf+ and a few demos installed. Great for trying VR before buying.', rules: 'Use the included lens cloth only. Keep away from direct sunlight - it permanently damages the lenses.', created: 130 },

    // Tools
    { owner: vikram, name: 'Bosch Cordless Drill Kit', category: 'Tools', price: 120, deposit: 800, condition: 'Good', area: 'Kothrud', loc: LOC.kothrud, images: [img('photo-1504148455328-c376907d081c')], desc: 'Bosch GSB 18V-50 with two batteries, charger and a 100-piece bit set. Drills into wood, metal and masonry. The only drill you will need for furniture assembly or wall mounting.', rules: 'Return bits in their case. Charge both batteries before returning.', created: 240 },
    { owner: vikram, name: 'Angle Grinder + Cutting Discs', category: 'Tools', price: 100, deposit: 600, condition: 'Used', area: 'Kothrud', loc: LOC.kothrud, images: [img('photo-1572981779307-38b8cabb2407')], desc: 'Heavy-duty 850W angle grinder with 5 fresh cutting discs and 2 grinding discs. Wear eye protection - I include safety goggles in the kit.', rules: 'Safety goggles are mandatory. Not for users without prior grinder experience.', created: 210 },
    { owner: siddharth, name: 'Dremel Rotary Tool Set', category: 'Tools', price: 90, deposit: 500, condition: 'Like New', area: 'Indiranagar', loc: LOC.indiranagar, images: [img('photo-1530124566582-a618bc2615dc')], desc: 'Dremel 4000 with 45 accessories - engraving, sanding, polishing, cutting. The Swiss army knife of hobby tools. Ideal for model making and small repairs.', rules: 'Consumable bits (sanding bands, cut-off wheels) are fair use. Return the rest complete.', created: 170 },
    { owner: vikram, name: 'Pressure Washer (1800W)', category: 'Tools', price: 200, deposit: 1000, condition: 'Good', area: 'Kothrud', loc: LOC.kothrud, images: [img('photo-1416879595882-3373a0480b5b')], desc: 'Blast the grime off your bike, car or balcony. 1800W pressure washer with foam cannon and 5m hose. Water connection adapter for standard taps included.', rules: 'Drain water completely before returning. Do not run it dry.', created: 140 },

    // Books
    { owner: priya, name: 'Atomic Habits + Deep Work (Set)', category: 'Books', price: 20, deposit: 200, condition: 'Good', area: 'Aundh', loc: LOC.aundh, images: [img('photo-1512820790803-83ca734da794')], desc: 'The productivity duo everyone talks about. Clean copies with no markings. Borrow both, build a habit of reading, return when done.', rules: 'No dog-earing pages, bookmarks included. No reading while eating curry :)', created: 130 },
    { owner: priya, name: 'The Complete Sherlock Holmes (Hardbound)', category: 'Books', price: 30, deposit: 300, condition: 'Like New', area: 'Aundh', loc: LOC.aundh, images: [img('photo-1544947950-fa07a98d237f')], desc: 'Beautiful hardbound collector edition, all 4 novels and 56 short stories. Heavy enough to double as a dumbbell. A slow, delightful month of reading.', rules: 'Keep the dust jacket on. Handle like the collector item it is.', created: 110 },
    { owner: ananya, name: 'Design Books Bundle (Refactoring UI + more)', category: 'Books', price: 40, deposit: 400, condition: 'Good', area: 'Baner', loc: LOC.baner, images: [img('photo-1524995997946-a1c2e315a42f')], desc: 'Refactoring UI, Don\'t Make Me Think and The Design of Everyday Things. The essential starter pack for anyone getting into product design.', rules: 'Sticky notes welcome, pen marks are not.', created: 90 },

    // Music
    { owner: kabir, name: 'Yamaha F310 Acoustic Guitar', category: 'Music', price: 80, deposit: 800, condition: 'Good', area: 'Camp', loc: LOC.camp, images: [img('photo-1510915361894-db8b60106cb1')], desc: 'The classic beginner guitar with fresh strings, a padded gig bag, picks and a clip-on tuner. Learn, jam, perform - then decide if you want to buy your own.', rules: 'Loosen strings slightly if keeping more than 2 weeks. Keep away from humidity.', created: 200 },
    { owner: kabir, name: 'AKAI MPK Mini MK3 MIDI Keyboard', category: 'Music', price: 100, deposit: 900, condition: 'Like New', area: 'Camp', loc: LOC.camp, images: [img('photo-1520523839897-bd0b52f945a0')], desc: '25-key MIDI controller with pads and knobs. Works with FL Studio, Ableton and GarageBand out of the box. USB cable and software download codes included.', rules: 'Software licenses stay with me - use the trial versions or your own DAW.', created: 150 },
    { owner: kabir, name: 'Pioneer DDJ-400 DJ Controller', category: 'Music', price: 350, deposit: 3000, condition: 'Good', area: 'Camp', loc: LOC.camp, images: [img('photo-1571330735066-03aaa9429d89')], desc: 'The controller every DJ learned on. Rekordbox compatible, club-standard layout. Perfect for house parties or practicing your transitions before a gig.', rules: 'No drinks anywhere near the deck. Transport flat in the included bag.', created: 170 },
    { owner: nisha, name: 'Blue Yeti USB Microphone', category: 'Music', price: 120, deposit: 1000, condition: 'Like New', area: 'Hauz Khas', loc: LOC.hauzKhas, images: [img('photo-1590602847861-f357a9332bbc')], desc: 'Podcast-grade USB mic with 4 pickup patterns, boom arm and pop filter. Plug in and sound professional immediately.', rules: 'Keep the pop filter on while recording. Return in the original box.', created: 100 },

    // Camping
    { owner: sneha, name: 'Quechua 4-Person Tent', category: 'Camping', price: 250, deposit: 1500, condition: 'Good', area: 'Viman Nagar', loc: LOC.vimanNagar, images: [img('photo-1504280390367-361c6d9f38f4')], desc: 'Waterproof dome tent, sets up in 10 minutes. Survived three monsoon treks in the Sahyadris. Sleeps 4 comfortably, 5 if you are close friends. Groundsheet and mallet included.', rules: 'Dry it fully before packing - a wet packed tent grows mold in 2 days. Count the pegs (12).', created: 190 },
    { owner: sneha, name: 'Trekking Backpack 60L + Rain Cover', category: 'Camping', price: 100, deposit: 700, condition: 'Good', area: 'Viman Nagar', loc: LOC.vimanNagar, images: [img('photo-1501554728187-ce583db33af7')], desc: 'Forclaz 60L with adjustable back system, hip belt and integrated rain cover. Carried it to Everest Base Camp - it will handle your weekend trek just fine.', rules: 'Empty all pockets before returning (found half a sandwich once).', created: 160 },
    { owner: sneha, name: 'Camping Stove + Cookset', category: 'Camping', price: 80, deposit: 500, condition: 'Used', area: 'Viman Nagar', loc: LOC.vimanNagar, images: [img('photo-1478131143081-80f7f84ca84d')], desc: 'Compact butane stove with wind shield and a 4-piece nesting cookset. Gas canister NOT included (buy fresh, they are cheap). Makes excellent maggi at 4000ft.', rules: 'Buy your own gas canister. Clean the cookset before returning.', created: 140 },
    { owner: divya, name: 'Celestron 70mm Telescope', category: 'Camping', price: 300, deposit: 2000, condition: 'Like New', area: 'Koramangala', loc: LOC.koramangala, images: [img('photo-1566004100631-35d015d6a491')], desc: 'Travel telescope with tripod and 2 eyepieces. You can see Saturn\'s rings and Jupiter\'s moons from a city terrace. Includes a star map app guide I wrote.', rules: 'Never point at the sun. Cap the lenses when not in use.', created: 120 },

    // Sports
    { owner: meera, name: 'Btwin Riverside 500 Hybrid Cycle', category: 'Sports', price: 150, deposit: 2000, condition: 'Good', area: 'Hadapsar', loc: LOC.hadapsar, images: [img('photo-1485965120184-e220f721d03e')], desc: 'Well-maintained hybrid bike, serviced monthly. Helmet, lights and lock included. Great for river-side rides or testing whether cycling to work is for you.', rules: 'Helmet is non-negotiable. Lock it whenever parked. Report any punctures.', created: 150 },
    { owner: meera, name: 'SG Cricket Kit (Full Set)', category: 'Sports', price: 200, deposit: 1200, condition: 'Good', area: 'Hadapsar', loc: LOC.hadapsar, images: [img('photo-1531415074968-036ba1b575da')], desc: 'English willow bat, pads, gloves, helmet and kit bag. Everything you need for a weekend match except talent. Bat is knocked in and match-ready.', rules: 'No throwing the bat. Clean the pads after use.', created: 130 },
    { owner: divya, name: 'Yonex Badminton Rackets (Pair)', category: 'Sports', price: 60, deposit: 400, condition: 'Like New', area: 'Koramangala', loc: LOC.koramangala, images: [img('photo-1554068865-24cecd4e34b8')], desc: 'Two Yonex Astrox rackets with fresh grips and a tube of shuttles. Court booking not included but I can recommend good ones in Koramangala.', rules: 'String breakage from smashing is fair wear. Frame cracks are not.', created: 110 },
    { owner: tanvi, name: 'Yoga Mat + Blocks Set (Pro)', category: 'Sports', price: 40, deposit: 300, condition: 'Like New', area: 'Powai', loc: LOC.powai, images: [img('photo-1544367567-0f2fcb009e0b')], desc: 'Liforme pro mat (the one with alignment lines), 2 cork blocks and a strap. Sanitized after every borrow. Try the good gear before investing.', rules: 'Wipe down after use with the included spray.', created: 80 },

    // Electronics
    { owner: rohan, name: 'Epson Full HD Projector', category: 'Electronics', price: 400, deposit: 3000, condition: 'Like New', area: 'Andheri East', loc: LOC.andheri, images: [img('photo-1478720568477-152d9b164e26')], desc: '3300 lumens, Full HD, HDMI + wireless casting. Turns any wall into a 120-inch screen. Movie nights, presentations, IPL screenings - it does it all. Includes HDMI cable and remote.', rules: 'Let it cool down 5 minutes before unplugging (lamp life). Transport upright.', created: 210 },
    { owner: rohan, name: 'JBL PartyBox 110 Speaker', category: 'Electronics', price: 350, deposit: 2500, condition: 'Good', area: 'Andheri East', loc: LOC.andheri, images: [img('photo-1545454675-3531b543be5d')], desc: '160W of party. Battery lasts 12 hours, lights sync to the beat, two mic inputs for karaoke disasters. Your neighbours will know you borrowed this.', rules: 'Keep it dry. Charge fully before returning. Karaoke mics included - sanitize after use.', created: 180 },
    { owner: ananya, name: 'iPad Pro 11" + Apple Pencil', category: 'Electronics', price: 300, deposit: 5000, condition: 'Like New', area: 'Baner', loc: LOC.baner, images: [img('photo-1527443224154-c4a3942d3acf')], desc: 'M2 iPad Pro with Apple Pencil 2 and Magic Keyboard. Procreate and Notability installed. Ideal for design sprints, sketching or trying before buying.', rules: 'Sign out of your accounts before returning. Screen protector stays on.', created: 100 },
    { owner: siddharth, name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', price: 150, deposit: 2000, condition: 'Like New', area: 'Indiranagar', loc: LOC.indiranagar, images: [img('photo-1505740420928-5e560c06d30e')], desc: 'Industry-best noise cancelling. Perfect for a deep-work week, a long flight or deciding if they are worth your own money. Case and cable included.', rules: 'Clean ear pads with the included wipes. Do not fold them backwards.', created: 90 },
    { owner: ishita, name: 'DJI Ronin RS3 Gimbal', category: 'Electronics', price: 450, deposit: 4000, condition: 'Good', area: 'Bandra West', loc: LOC.bandra, images: [img('photo-1495707902641-75cac588d2e9')], desc: 'Professional 3-axis gimbal for mirrorless cameras up to 3kg. Buttery smooth footage for wedding shoots and music videos. Balancing takes practice - I include a printed guide.', rules: 'Balance before powering on, every single time. Return in the hard case.', created: 140 },
    { owner: nisha, name: 'Board Game Library (8 games)', category: 'Gaming', price: 100, deposit: 800, condition: 'Good', area: 'Hauz Khas', loc: LOC.hauzKhas, images: [img('photo-1610890716171-6b1bb98ffd09')], desc: 'Catan, Ticket to Ride, Codenames, Azul, Exploding Kittens and 3 more. Enough for a full weekend of game nights. All pieces counted and complete.', rules: 'Count pieces before returning. Missing pieces = small deduction from deposit.', created: 70 },
    { owner: tanvi, name: 'Artist Easel + Drawing Board', category: 'Tools', price: 50, deposit: 300, condition: 'Good', area: 'Powai', loc: LOC.powai, images: [img('photo-1513364776144-60967b0f800f')], desc: 'Adjustable wooden easel plus an A2 drawing board. Perfect for a painting phase, art class or an Instagram-worthy home studio setup.', rules: 'Paint splatters happen - just wipe what you can.', created: 60 },
    { owner: aditya, name: 'Godox LED Video Light Kit', category: 'Electronics', price: 250, deposit: 1800, condition: 'Good', area: 'Shivajinagar', loc: LOC.shivajinagar, images: [img('photo-1492724441997-5dc865305da7')], desc: 'Two Godox SL60W lights with softboxes and stands. Enough to light an interview, a YouTube setup or a small product shoot. Carrying bags included.', rules: 'Let lights cool before packing. Do not touch the LED with bare hands.', created: 110 },
    { owner: farhan, name: 'Rode Wireless GO II Mic Kit', category: 'Electronics', price: 300, deposit: 2500, condition: 'Like New', area: 'HITEC City', loc: LOC.hitechCity, images: [img('photo-1598488035139-bdbb2231ce04')], desc: 'Dual-channel wireless mic system. Crystal clear audio for interviews, vlogs and weddings. Includes dead-cat windshields and all cables for camera + phone.', rules: 'Return all 6 cables. The windshields are fragile - handle gently.', created: 80 },
    { owner: ishita, name: 'Kindle Paperwhite (11th Gen)', category: 'Books', price: 60, deposit: 800, condition: 'Like New', area: 'Bandra West', loc: LOC.bandra, images: [img('photo-1592496431122-2349e0fbc666')], desc: 'Backlit, waterproof e-reader. I will factory reset before handover so you can use your own Amazon account and library.', rules: 'Factory reset before returning. Case stays on.', created: 60 },
    { owner: siddharth, name: 'Multimeter + Soldering Station', category: 'Tools', price: 80, deposit: 600, condition: 'Good', area: 'Indiranagar', loc: LOC.indiranagar, images: [img('photo-1581092160562-40aa08e78837')], desc: 'Fluke multimeter and a temperature-controlled soldering station with solder, flux and a helping-hands stand. For electronics repair and hobby projects.', rules: 'Replace the soldering tip if you damage it (₹150). Ventilate while soldering.', created: 100 },
  ];

  const items = [];
  for (const d of itemsData) {
    const item = await Item.create({
      owner: d.owner._id, name: d.name, description: d.desc, category: d.category,
      images: d.images, condition: d.condition, pricePerDay: d.price, deposit: d.deposit,
      city: d.owner.city, area: d.area, location: { type: 'Point', coordinates: d.loc },
      rules: d.rules, views: 40 + Math.floor(Math.random() * 400),
    });
    await Item.updateOne({ _id: item._id }, { $set: { createdAt: daysAgo(d.created) } });
    items.push(item);
  }

  const itemByName = (name) => items.find((i) => i.name === name);

  console.log('[seed] creating completed transactions + reviews...');
  /** Creates request -> transaction(completed) -> two reviews */
  async function completedTxn({ item, borrower, start, end, onTime = true, borrowerReview, lenderReview, message = '' }) {
    const owner = users.find((u) => String(u._id) === String(item.owner)) || rahul;
    const days = daysBetweenInclusive(start, end);
    const rentTotal = days * item.pricePerDay;

    const request = await BorrowRequest.create({
      item: item._id, owner: item.owner, borrower: borrower._id,
      startDate: start, endDate: end, message, status: 'approved',
      days, rentTotal, deposit: item.deposit, grandTotal: rentTotal + item.deposit,
      respondedAt: new Date(start.getTime() - 86400000),
    });

    const returnedAt = onTime ? end : new Date(end.getTime() + 2 * 86400000);
    const txn = await Transaction.create({
      request: request._id, item: item._id, owner: item.owner, borrower: borrower._id,
      startDate: start, endDate: end, days, rentTotal, deposit: item.deposit,
      grandTotal: rentTotal + item.deposit, status: 'completed',
      returnedAt, completedAt: returnedAt, returnedOnTime: onTime,
      conditionBefore: { condition: item.condition, notes: 'Checked together at handover. Everything working.', photos: [item.images[0]], recordedBy: item.owner, recordedAt: start },
      conditionAfter: { condition: item.condition, notes: onTime ? 'Returned in the same condition. Smooth transaction.' : 'Item fine, returned late.', photos: [item.images[0]], recordedBy: item.owner, recordedAt: returnedAt },
      timeline: [
        { key: 'requested', label: 'Request submitted', at: new Date(start.getTime() - 3 * 86400000), by: borrower._id },
        { key: 'approved', label: 'Request approved', at: new Date(start.getTime() - 2 * 86400000), by: item.owner },
        { key: 'handover', label: 'Item handed over', at: start, by: item.owner },
        { key: 'returned', label: 'Item returned', at: returnedAt, by: borrower._id },
        { key: 'confirmed', label: 'Condition confirmed', at: returnedAt, by: item.owner },
        { key: 'completed', label: 'Transaction completed', at: returnedAt, by: item.owner },
      ],
    });
    request.transaction = txn._id;
    await request.save();

    if (borrowerReview) {
      const r = borrowerReview;
      const overall = Math.round(((r.communication + r.reliability + r.condition + r.onTime) / 4) * 10) / 10;
      await Review.create({
        transaction: txn._id, item: item._id, reviewer: borrower._id, reviewee: item.owner,
        reviewerRole: 'borrower', ratings: r, overall, comment: r.comment,
        createdAt: returnedAt,
      });
    }
    if (lenderReview) {
      const r = lenderReview;
      const overall = Math.round(((r.communication + r.reliability + r.condition + r.onTime) / 4) * 10) / 10;
      await Review.create({
        transaction: txn._id, item: item._id, reviewer: item.owner, reviewee: borrower._id,
        reviewerRole: 'lender', ratings: r, overall, comment: r.comment,
        createdAt: returnedAt,
      });
    }

    await User.updateOne({ _id: borrower._id }, { $inc: { 'stats.successfulBorrows': 1, [`stats.${onTime ? 'onTimeReturns' : 'lateReturns'}`]: 1 } });
    await User.updateOne({ _id: item.owner }, { $inc: { 'stats.successfulLends': 1 } });
    await Item.updateOne({ _id: item._id }, { $inc: { borrowCount: 1, totalEarnings: rentTotal } });
    return txn;
  }

  const five = { communication: 5, reliability: 5, condition: 5, onTime: 5 };
  const completedSpecs = [
    { item: itemByName('Sony A6400 Mirrorless Camera'), borrower: ananya, start: daysAgo(95), end: daysAgo(92), message: 'Need it for a design conference shoot.', borrowerReview: { ...five, comment: 'Camera was spotless and Rahul explained everything patiently. The extra battery saved my day.' }, lenderReview: { ...five, comment: 'Ananya returned it early with everything charged. Ideal borrower!' } },
    { item: itemByName('Sony A6400 Mirrorless Camera'), borrower: sneha, start: daysAgo(60), end: daysAgo(55), message: 'Harishchandragad trek - want good summit photos.', borrowerReview: { communication: 5, reliability: 5, condition: 4, onTime: 5, comment: 'Great camera for trekking, light and sharp. Kit lens has slight dust but photos were fine.' }, lenderReview: { ...five, comment: 'Returned on time despite coming back from a trek at 2am. Respect.' } },
    { item: itemByName('Sony A6400 Mirrorless Camera'), borrower: aditya, start: daysAgo(30), end: daysAgo(26), borrowerReview: { ...five, comment: 'Used it as a B-cam for a short film. Flawless. Rahul is the gold standard of lenders.' }, lenderReview: { ...five, comment: 'A fellow filmmaker who treats gear better than I do.' } },
    { item: itemByName('PlayStation 5 + 2 Controllers'), borrower: rahul, start: daysAgo(80), end: daysAgo(77), message: 'Weekend FIFA tournament with cousins!', borrowerReview: { ...five, comment: 'Console was basically new. Arjun even threw in an extra game. Cousins destroyed me at FIFA.' }, lenderReview: { ...five, comment: 'Rahul returned it cleaner than I gave it. 10/10.' } },
    { item: itemByName('PlayStation 5 + 2 Controllers'), borrower: kabir, start: daysAgo(40), end: daysAgo(37), borrowerReview: { communication: 5, reliability: 4, condition: 5, onTime: 5, comment: 'Smooth pickup in Hinjewadi. Everything as described.' }, lenderReview: { communication: 4, reliability: 5, condition: 5, onTime: 5, comment: 'Good borrower, slightly slow on messages but returned perfectly.' } },
    { item: itemByName('Bosch Cordless Drill Kit'), borrower: rahul, start: daysAgo(70), end: daysAgo(69), message: 'Mounting shelves in my new flat.', borrowerReview: { ...five, comment: 'Drill made my wall-mounting project a 20-minute job. Vikram gave a mini tutorial too.' }, lenderReview: { ...five, comment: 'On time, all bits back in place. Welcome anytime.' } },
    { item: itemByName('Bosch Cordless Drill Kit'), borrower: priya, start: daysAgo(45), end: daysAgo(44), borrowerReview: { ...five, comment: 'First time using a drill - Vikram\'s patience deserves 6 stars.' }, lenderReview: { ...five, comment: 'Careful and communicative. Perfect.' } },
    { item: itemByName('Quechua 4-Person Tent'), borrower: rahul, start: daysAgo(50), end: daysAgo(47), message: 'Pawna lake camping with friends.', borrowerReview: { ...five, comment: 'Tent survived surprise rain at Pawna. Sneha\'s packing checklist was a lifesaver.' }, lenderReview: { ...five, comment: 'Dried and folded it perfectly before returning. Camper of the year.' } },
    { item: itemByName('Quechua 4-Person Tent'), borrower: arjun, start: daysAgo(25), end: daysAgo(22), onTime: false, borrowerReview: { communication: 5, reliability: 5, condition: 4, onTime: 5, comment: 'Solid tent, easy setup. One peg was bent but manageable.' }, lenderReview: { communication: 4, reliability: 4, condition: 5, onTime: 2, comment: 'Returned two days late without much notice. Tent was in great shape though.' } },
    { item: itemByName('Yamaha F310 Acoustic Guitar'), borrower: ananya, start: daysAgo(65), end: daysAgo(51), message: 'Want to see if I can stick with learning guitar.', borrowerReview: { ...five, comment: 'Two weeks with this guitar and I am hooked. Kabir tuned it and taught me 3 chords at pickup.' }, lenderReview: { ...five, comment: 'Took genuinely good care of it. Strings still fresh.' } },
    { item: itemByName('Epson Full HD Projector'), borrower: ishita, start: daysAgo(35), end: daysAgo(33), borrowerReview: { ...five, comment: 'Movie night was a hit. Bright even with some ambient light. Rohan included every cable imaginable.' }, lenderReview: { ...five, comment: 'Prompt pickup and return. Great borrower.' } },
    { item: itemByName('JBL PartyBox 110 Speaker'), borrower: tanvi, start: daysAgo(20), end: daysAgo(19), message: 'House warming party!', borrowerReview: { communication: 5, reliability: 5, condition: 5, onTime: 4, comment: 'The party did not stop. Battery really does last all night.' }, lenderReview: { ...five, comment: 'Returned charged and clean. My neighbours have questions though.' } },
    { item: itemByName('GoPro Hero 11 + Accessories Kit'), borrower: rohan, start: daysAgo(55), end: daysAgo(52), borrowerReview: { ...five, comment: 'Took it scuba diving in Malvan. Footage came out insane. Ishita\'s mount kit is complete.' }, lenderReview: { ...five, comment: 'Rinsed everything exactly as asked. Trustworthy!' } },
    { item: itemByName('Btwin Riverside 500 Hybrid Cycle'), borrower: aditya, start: daysAgo(15), end: daysAgo(13), borrowerReview: { communication: 5, reliability: 5, condition: 4, onTime: 5, comment: 'Smooth ride along the river. Brakes could be tighter but Meera serviced them the same day I mentioned it.' }, lenderReview: { ...five, comment: 'Locked it every single time. Zero scratches.' } },
    { item: itemByName('Trekking Backpack 60L + Rain Cover'), borrower: rahul, start: daysAgo(110), end: daysAgo(104), borrowerReview: { ...five, comment: 'Carried it through 6 days in Himachal. Rain cover saved my camera twice.' }, lenderReview: { ...five, comment: 'Returned washed. WASHED. Legend.' } },
    { item: itemByName('AKAI MPK Mini MK3 MIDI Keyboard'), borrower: farhan, start: daysAgo(28), end: daysAgo(21), borrowerReview: { ...five, comment: 'Made two full tracks with it. Pads are super responsive.' }, lenderReview: { communication: 5, reliability: 5, condition: 5, onTime: 5, comment: 'Careful with gear and easy to coordinate with.' } },
    { item: itemByName('iPad Pro 11" + Apple Pencil'), borrower: vikram, start: daysAgo(12), end: daysAgo(10), borrowerReview: { ...five, comment: 'Used it for a client presentation. The Magic Keyboard combo is slick. Ananya is super organised.' }, lenderReview: { ...five, comment: 'Signed out of everything properly, returned on the dot.' } },
    { item: itemByName('Sony WH-1000XM5 Headphones'), borrower: divya, start: daysAgo(18), end: daysAgo(14), borrowerReview: { ...five, comment: 'Wore them through a deadline week. Now I sadly have to buy my own.' }, lenderReview: { ...five, comment: 'Perfect condition on return, pads wiped.' } },
  ];

  for (const spec of completedSpecs) await completedTxn(spec);

  console.log('[seed] creating live transactions...');
  // ACTIVE: Rahul is currently borrowing Arjun's Switch (due in 3 days)
  const switchItem = itemByName('Nintendo Switch OLED');
  const activeReq1 = await BorrowRequest.create({
    item: switchItem._id, owner: switchItem.owner, borrower: rahul._id,
    startDate: daysAgo(2), endDate: daysAhead(3), status: 'approved',
    message: 'Game night marathon with school friends this weekend.',
    days: 6, rentTotal: 6 * switchItem.pricePerDay, deposit: switchItem.deposit,
    grandTotal: 6 * switchItem.pricePerDay + switchItem.deposit, respondedAt: daysAgo(3),
  });
  const activeTxn1 = await Transaction.create({
    request: activeReq1._id, item: switchItem._id, owner: switchItem.owner, borrower: rahul._id,
    startDate: daysAgo(2), endDate: daysAhead(3), days: 6,
    rentTotal: 6 * switchItem.pricePerDay, deposit: switchItem.deposit,
    grandTotal: 6 * switchItem.pricePerDay + switchItem.deposit, status: 'active',
    conditionBefore: { condition: 'Good', notes: 'Minor scratches on the dock, screen flawless. Verified together.', photos: [switchItem.images[0]], recordedBy: switchItem.owner, recordedAt: daysAgo(2) },
    timeline: [
      { key: 'requested', label: 'Request submitted', at: daysAgo(4), by: rahul._id },
      { key: 'approved', label: 'Request approved', at: daysAgo(3), by: switchItem.owner },
      { key: 'handover', label: 'Item handed over', at: daysAgo(2), by: switchItem.owner },
    ],
  });
  activeReq1.transaction = activeTxn1._id;
  await activeReq1.save();

  // APPROVED (upcoming): Priya will borrow Rahul's Instax... Rahul's A6400 next week
  const a6400 = itemByName('Sony A6400 Mirrorless Camera');
  const upcomingReq = await BorrowRequest.create({
    item: a6400._id, owner: a6400.owner, borrower: priya._id,
    startDate: daysAhead(6), endDate: daysAhead(9), status: 'approved',
    message: 'College photography event - need a reliable camera for 4 days.',
    days: 4, rentTotal: 4 * a6400.pricePerDay, deposit: a6400.deposit,
    grandTotal: 4 * a6400.pricePerDay + a6400.deposit, respondedAt: daysAgo(1),
  });
  const upcomingTxn = await Transaction.create({
    request: upcomingReq._id, item: a6400._id, owner: a6400.owner, borrower: priya._id,
    startDate: daysAhead(6), endDate: daysAhead(9), days: 4,
    rentTotal: 4 * a6400.pricePerDay, deposit: a6400.deposit,
    grandTotal: 4 * a6400.pricePerDay + a6400.deposit, status: 'approved',
    timeline: [
      { key: 'requested', label: 'Request submitted', at: daysAgo(2), by: priya._id },
      { key: 'approved', label: 'Request approved', at: daysAgo(1), by: a6400.owner },
    ],
  });
  upcomingReq.transaction = upcomingTxn._id;
  await upcomingReq.save();

  // RETURNED (waiting for owner confirm): Meera returned Kabir's Blue Yeti... Nisha's mic
  const yeti = itemByName('Blue Yeti USB Microphone');
  const returnedReq = await BorrowRequest.create({
    item: yeti._id, owner: yeti.owner, borrower: meera._id,
    startDate: daysAgo(6), endDate: daysAgo(1), status: 'approved',
    message: 'Recording intro videos for my fitness course.',
    days: 6, rentTotal: 6 * yeti.pricePerDay, deposit: yeti.deposit,
    grandTotal: 6 * yeti.pricePerDay + yeti.deposit, respondedAt: daysAgo(7),
  });
  const returnedTxn = await Transaction.create({
    request: returnedReq._id, item: yeti._id, owner: yeti.owner, borrower: meera._id,
    startDate: daysAgo(6), endDate: daysAgo(1), days: 6,
    rentTotal: 6 * yeti.pricePerDay, deposit: yeti.deposit,
    grandTotal: 6 * yeti.pricePerDay + yeti.deposit, status: 'returned',
    returnedAt: daysAgo(1), returnedOnTime: true,
    conditionBefore: { condition: 'Like New', notes: 'Boxed, all accessories present.', photos: [yeti.images[0]], recordedBy: yeti.owner, recordedAt: daysAgo(6) },
    timeline: [
      { key: 'requested', label: 'Request submitted', at: daysAgo(8), by: meera._id },
      { key: 'approved', label: 'Request approved', at: daysAgo(7), by: yeti.owner },
      { key: 'handover', label: 'Item handed over', at: daysAgo(6), by: yeti.owner },
      { key: 'returned', label: 'Item returned', at: daysAgo(1), by: meera._id },
    ],
  });
  returnedReq.transaction = returnedTxn._id;
  await returnedReq.save();

  console.log('[seed] creating a dispute...');
  // DISPUTED: Farhan vs Siddharth over the gimbal... DJI Ronin belongs to Ishita.
  const ronin = itemByName('DJI Ronin RS3 Gimbal');
  const dispReq = await BorrowRequest.create({
    item: ronin._id, owner: ronin.owner, borrower: farhan._id,
    startDate: daysAgo(10), endDate: daysAgo(7), status: 'approved',
    message: 'Wedding shoot in Hyderabad, need smooth tracking shots.',
    days: 4, rentTotal: 4 * ronin.pricePerDay, deposit: ronin.deposit,
    grandTotal: 4 * ronin.pricePerDay + ronin.deposit, respondedAt: daysAgo(11),
  });
  const dispTxn = await Transaction.create({
    request: dispReq._id, item: ronin._id, owner: ronin.owner, borrower: farhan._id,
    startDate: daysAgo(10), endDate: daysAgo(7), days: 4,
    rentTotal: 4 * ronin.pricePerDay, deposit: ronin.deposit,
    grandTotal: 4 * ronin.pricePerDay + ronin.deposit, status: 'disputed',
    returnedAt: daysAgo(7), returnedOnTime: true,
    conditionBefore: { condition: 'Good', notes: 'Fully functional, light wear on the grip.', photos: [ronin.images[0]], recordedBy: ronin.owner, recordedAt: daysAgo(10) },
    conditionAfter: { condition: 'Damaged', notes: 'Tilt motor makes a grinding noise and axis lock is cracked.', photos: [ronin.images[0]], recordedBy: ronin.owner, recordedAt: daysAgo(6) },
    timeline: [
      { key: 'requested', label: 'Request submitted', at: daysAgo(12), by: farhan._id },
      { key: 'approved', label: 'Request approved', at: daysAgo(11), by: ronin.owner },
      { key: 'handover', label: 'Item handed over', at: daysAgo(10), by: ronin.owner },
      { key: 'returned', label: 'Item returned', at: daysAgo(7), by: farhan._id },
      { key: 'disputed', label: 'Dispute opened', at: daysAgo(6), by: ronin.owner },
    ],
  });
  dispReq.transaction = dispTxn._id;
  await dispReq.save();

  const dispute = await Dispute.create({
    transaction: dispTxn._id, item: ronin._id, raisedBy: ronin.owner, against: farhan._id,
    reason: 'Item was returned damaged',
    description: 'The tilt motor grinds when panning and the axis lock arm is cracked. It was fully functional at handover - we tested it together and I have the handover photos.',
    evidence: [
      { by: ronin.owner, description: 'The tilt motor grinds when panning and the axis lock arm is cracked. It was fully functional at handover - we tested it together and I have the handover photos.', photos: [ronin.images[0]], at: daysAgo(6) },
      { by: farhan._id, description: 'The grinding sound was already there on day one - I even messaged about it (screenshot attached). The crack on the lock arm existed at pickup; it is visible in the handover photo if you zoom in.', photos: [ronin.images[0]], at: daysAgo(5) },
    ],
    status: 'under_review',
  });
  dispTxn.dispute = dispute._id;
  await dispTxn.save();

  console.log('[seed] creating pending requests...');
  // Pending requests for Rahul's items (incoming) and by Rahul (outgoing)
  const drone = itemByName('DJI Mini 3 Pro Drone');
  await BorrowRequest.create({
    item: drone._id, owner: drone.owner, borrower: ishita._id,
    startDate: daysAhead(4), endDate: daysAhead(6), status: 'pending',
    message: 'Shooting aerial b-roll for a Konkan travel video. I have 50+ hours of drone experience.',
    days: 3, rentTotal: 3 * drone.pricePerDay, deposit: drone.deposit,
    grandTotal: 3 * drone.pricePerDay + drone.deposit,
  });
  await BorrowRequest.create({
    item: a6400._id, owner: a6400.owner, borrower: kabir._id,
    startDate: daysAhead(12), endDate: daysAhead(14), status: 'pending',
    message: 'Shooting a music video for my new track. Will treat it like my own DDJ.',
    days: 3, rentTotal: 3 * a6400.pricePerDay, deposit: a6400.deposit,
    grandTotal: 3 * a6400.pricePerDay + a6400.deposit,
  });
  const ddj = itemByName('Pioneer DDJ-400 DJ Controller');
  await BorrowRequest.create({
    item: ddj._id, owner: ddj.owner, borrower: rahul._id,
    startDate: daysAhead(8), endDate: daysAhead(10), status: 'pending',
    message: 'Hosting a rooftop party - time to test my mixing skills in public.',
    days: 3, rentTotal: 3 * ddj.pricePerDay, deposit: ddj.deposit,
    grandTotal: 3 * ddj.pricePerDay + ddj.deposit,
  });
  const projector = itemByName('Epson Full HD Projector');
  await BorrowRequest.create({
    item: projector._id, owner: projector.owner, borrower: sneha._id,
    startDate: daysAhead(2), endDate: daysAhead(3), status: 'pending',
    message: 'Outdoor movie night at our society. Wall is ready, popcorn is ready.',
    days: 2, rentTotal: 2 * projector.pricePerDay, deposit: projector.deposit,
    grandTotal: 2 * projector.pricePerDay + projector.deposit,
  });

  console.log('[seed] creating notifications...');
  const notifs = [
    { user: rahul._id, type: 'request_received', title: 'Ishita Verma requested your DJI Mini 3 Pro Drone', body: '3 day(s) · ₹10,400 total', item: drone._id, link: '/requests?tab=incoming', isRead: false, ago: 0.2 },
    { user: rahul._id, type: 'request_received', title: 'Kabir Khan requested your Sony A6400', body: '3 day(s) · ₹2,900 total', item: a6400._id, link: '/requests?tab=incoming', isRead: false, ago: 1 },
    { user: rahul._id, type: 'return_due', title: 'Nintendo Switch OLED is due in 3 days', body: 'Plan the return with Arjun to keep your on-time streak alive.', item: switchItem._id, transaction: activeTxn1._id, link: `/transactions/${activeTxn1._id}`, isRead: false, ago: 0.5 },
    { user: rahul._id, type: 'review_received', title: 'New review received · ★★★★★', body: '"A fellow filmmaker who treats gear better than I do."', item: a6400._id, link: '/profile', isRead: true, ago: 26 },
    { user: rahul._id, type: 'request_approved', title: 'Your borrow request was accepted 🎉', body: 'Nintendo Switch OLED · picked up 2 days ago', item: switchItem._id, transaction: activeTxn1._id, link: `/transactions/${activeTxn1._id}`, isRead: true, ago: 3 },
    { user: arjun._id, type: 'return_due', title: 'Your Nintendo Switch OLED is due back in 3 days', body: 'Rahul Sharma has it until then.', item: switchItem._id, transaction: activeTxn1._id, link: `/transactions/${activeTxn1._id}`, isRead: false, ago: 0.5 },
    { user: priya._id, type: 'request_approved', title: 'Your borrow request was accepted 🎉', body: 'Sony A6400 · pick it up in 6 days', item: a6400._id, transaction: upcomingTxn._id, link: `/transactions/${upcomingTxn._id}`, isRead: false, ago: 1 },
    { user: nisha._id, type: 'return_initiated', title: 'Blue Yeti USB Microphone was returned', body: 'Inspect the item and confirm its condition to complete the transaction.', item: yeti._id, transaction: returnedTxn._id, link: `/transactions/${returnedTxn._id}`, isRead: false, ago: 1 },
    { user: farhan._id, type: 'dispute_opened', title: 'A dispute was opened for DJI Ronin RS3 Gimbal', body: 'Reason: Item was returned damaged. You can respond with your side and evidence.', item: ronin._id, transaction: dispTxn._id, link: `/disputes/${dispute._id}`, isRead: true, ago: 6 },
  ];
  for (const n of notifs) {
    const { ago, ...rest } = n;
    const doc = await Notification.create(rest);
    await Notification.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(Date.now() - ago * 86400000) } });
  }

  console.log('[seed] refreshing item ratings...');
  for (const item of items) {
    const agg = await Review.aggregate([
      { $match: { item: item._id, reviewerRole: 'borrower' } },
      { $group: { _id: null, avg: { $avg: '$overall' }, count: { $sum: 1 } } },
    ]);
    if (agg[0]) {
      await Item.updateOne({ _id: item._id }, {
        rating: Math.round(agg[0].avg * 10) / 10,
        reviewCount: agg[0].count,
      });
    }
  }

  console.log('[seed] computing trust scores...');
  for (const user of users) await refreshTrust(user._id);

  console.log('\n[seed] Done! Demo accounts:');
  console.log('  User : rahul@borrowbox.in / password123');
  console.log('  Admin: admin@borrowbox.in / admin123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
