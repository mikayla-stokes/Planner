// Hand-transcribed from Wedding Binder Documents.docx (mammoth extraction flattens
// tables to linear text, so this structured data was reconstructed by hand from that
// extraction rather than re-parsed programmatically — see the plan doc for context)
// and For the Girlies (and Kyle).xlsx.

export const WEDDING = {
  weddingDate: new Date("2027-05-01T00:00:00"),
  brideName: "Mikayla Stokes",
  groomName: "Caleb Brown",
  bridePhone: "(217) 415-5522",
  groomPhone: "(813) 545-6026",
  venueName: "Hotel Flor",
  ceremonyLocation: "Crystal Ballroom",
  receptionLocation: "Floridan Ballroom",
  estimatedGuestCountLow: 125,
  estimatedGuestCountHigh: 150,
};

export const VENUE = {
  name: "Hotel Flor",
  address: "905 N Florida Ave, Tampa, FL 33602",
  roomRate: "$249/night",
  includedAmenities: [
    "Honeymoon suite",
    "Bridal getting-ready room",
    "Tables, chairs, and napkins",
    "Shuttle and bicycles",
  ],
  excludedAmenities: ["Guest valet parking ($25/day)", "Groomsmen getting-ready room"],
  notes: "Coffee shop on-site with its own hours. No open flames allowed.",
};

// Best-effort name -> wedding-party role/side/phone, applied as an overlay onto
// whichever Guest rows match by name. Not every name here is guaranteed to find
// an exact match in the guest list (nicknames, etc.) — that's fine for Phase 1.
export const WEDDING_PARTY: {
  firstName: string;
  lastName: string;
  role: string;
  side: "bride" | "groom" | "both";
  phone?: string;
}[] = [
  { firstName: "Kelsey", lastName: "Hunt", role: "Maid of Honor", side: "bride", phone: "(505)240-7459" },
  { firstName: "Lauren", lastName: "Oxley", role: "Bridesmaid", side: "bride" },
  { firstName: "Jessica", lastName: "Brown", role: "Bridesmaid (Groom's Sister)", side: "both" },
  { firstName: "Kyle", lastName: "Burrell", role: "Bridesman", side: "bride" },
  { firstName: "Jackson", lastName: "Chadwell", role: "Best Man", side: "groom" },
  { firstName: "Henry", lastName: "Chadwell", role: "Groomsman", side: "groom" },
  { firstName: "Brett", lastName: "Jordan", role: "Groomsman", side: "groom" },
  { firstName: "Richard", lastName: "Bernaldo", role: "Usher", side: "groom" },
  { firstName: "Ryan", lastName: "Bernaldo", role: "Usher", side: "groom" },
];

export const TIMELINE_EVENTS: {
  subEvent: "WEDDING_DAY" | "BACHELORETTE_WEEKEND";
  time: string;
  description: string;
  location?: string;
}[] = [
  { subEvent: "WEDDING_DAY", time: "9 am", description: "Bridal Party Breakfast", location: "The Dan" },
  { subEvent: "WEDDING_DAY", time: "10 am", description: "Hair and Makeup" },
  { subEvent: "WEDDING_DAY", time: "10 am", description: "Groomsmen Meet in Caleb's Room" },
  { subEvent: "WEDDING_DAY", time: "1 pm", description: "Groomsmen Lunch" },
  { subEvent: "WEDDING_DAY", time: "1 pm", description: "Bridal Party Lunch" },
  { subEvent: "WEDDING_DAY", time: "2 pm", description: "Photographer Arrives / Getting Ready Photos" },
  { subEvent: "WEDDING_DAY", time: "3:45 pm", description: "Pictures with the Groomsmen and Dads" },
  { subEvent: "WEDDING_DAY", time: "3:45 pm", description: "Guests Start Arriving" },
  { subEvent: "WEDDING_DAY", time: "4:15 pm", description: "Pictures with the Bridesmaids and Moms" },
  { subEvent: "WEDDING_DAY", time: "4:30 pm", description: "Guests Are Escorted to Their Seats" },
  { subEvent: "WEDDING_DAY", time: "4:45 pm", description: "Ceremony Begins" },
  { subEvent: "WEDDING_DAY", time: "5:30 pm", description: "Cocktail Hour Begins" },
  { subEvent: "WEDDING_DAY", time: "5:30 pm", description: "Pictures with the Groomsmen and Bridesmaids" },
  { subEvent: "WEDDING_DAY", time: "5:45 pm", description: "Pictures with the Families" },
  { subEvent: "WEDDING_DAY", time: "6 pm", description: "Pictures with Just the Bride and Groom" },
  { subEvent: "WEDDING_DAY", time: "6:30 pm", description: "Reception Begins" },
  { subEvent: "WEDDING_DAY", time: "6:40 pm", description: "Bride and Groom Enter" },
  { subEvent: "WEDDING_DAY", time: "6:45 pm", description: "Toasts" },
  { subEvent: "WEDDING_DAY", time: "7 pm", description: "First Dance and Parent Dances" },
  { subEvent: "WEDDING_DAY", time: "7:15 pm", description: "Dinner" },
  { subEvent: "WEDDING_DAY", time: "7:15 pm", description: "Bride and Groom Private Dinner and Outfit Change" },
  { subEvent: "WEDDING_DAY", time: "7:40 pm", description: "Bride and Groom Re-Enter" },
  { subEvent: "WEDDING_DAY", time: "7:45 pm", description: "Cut the Cake" },
  { subEvent: "WEDDING_DAY", time: "7:50 pm", description: "Game / Teach a Line Dance" },
  { subEvent: "WEDDING_DAY", time: "8 pm", description: "Open Dancing" },
  { subEvent: "WEDDING_DAY", time: "9:30 pm", description: "Bar Closes" },
  { subEvent: "WEDDING_DAY", time: "10 pm", description: "Last Dance" },

  { subEvent: "BACHELORETTE_WEEKEND", time: "Thu 7:00 am", description: "Meet at Jessie's", location: "10908 McMullen Loop, Riverview, FL 33569" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Thu 7:30 am", description: "Einstein Bagels Drive Through" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Thu 8-9 pm", description: "Arrive in Nashville, park at uncle's house", location: "4408A Hunt Pl, Nashville, TN 37215" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Thu 10 pm", description: "Settle In / Go Out If We Feel Like It", location: "Airbnb — 501 Rep John Lewis Way S" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 9 am", description: "Breakfast (TBD)" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 10:30 am", description: "Shopping", location: "Broadway" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 1 pm", description: "Lunch", location: "Assembly Food Hall" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 2 pm", description: "Make Custom Lip Gloss", location: "Lip Lab" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 3:30 pm", description: "More Shopping", location: "Broadway" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 7 pm", description: "Dinner (TBD)" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Fri 8:30 pm", description: "Line Dancing / Bar Hopping (Category 10)", location: "Broadway" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sat 11 am", description: "Brunch (TBD)" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sat 12:30 pm", description: "Shopping / Daily Activities", location: "Broadway" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sat 6:30 pm", description: "Dinner (TBD)" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sat 8 pm", description: "Line Dancing / Bar Hopping", location: "Broadway" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sun 7 am", description: "Breakfast With Family (TBD)" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sun 8 am", description: "Drive Home" },
  { subEvent: "BACHELORETTE_WEEKEND", time: "Sun ~10 pm", description: "Back at Jessie's", location: "10908 McMullen Loop" },
];

export const PACKING_LISTS: {
  type: "WEDDING" | "HONEYMOON" | "BACHELORETTE";
  name: string;
  items: { text: string; subcategory?: string }[];
}[] = [
  {
    type: "WEDDING",
    name: "Wedding Day",
    items: [
      { text: "Rehearsal Dress", subcategory: "Suitcase" },
      { text: "Getting Ready PJs / Robe", subcategory: "Suitcase" },
      { text: "Wedding Dress", subcategory: "Suitcase" },
      { text: "Tights", subcategory: "Suitcase" },
      { text: "Jewelry", subcategory: "Suitcase" },
      { text: "Veil", subcategory: "Suitcase" },
      { text: "Perfume", subcategory: "Suitcase" },
      { text: "Shoes", subcategory: "Suitcase" },
      { text: "Bachelorette Travel Outfit", subcategory: "Suitcase" },
      { text: "Shapewear", subcategory: "Suitcase" },
      { text: "Phone Charger", subcategory: "Suitcase" },
      { text: "Makeup", subcategory: "Suitcase" },
      { text: "Hair Stuff", subcategory: "Suitcase" },
      { text: "Shampoo / Conditioner", subcategory: "Suitcase" },
      { text: "Razor", subcategory: "Suitcase" },
      { text: "PJs", subcategory: "Suitcase" },
      { text: "Stuffed Animal", subcategory: "Suitcase" },
      { text: "Table Boxes", subcategory: "Other" },
      { text: "Details Box (Ring Box / Rings / Invitation)", subcategory: "Other" },
      { text: "Welcome Sign", subcategory: "Other" },
      { text: "Guest Book", subcategory: "Other" },
      { text: "Seating Chart", subcategory: "Other" },
      { text: "Photo Spot", subcategory: "Other" },
      { text: "Flower Girl Baskets", subcategory: "Other" },
      { text: "Kids Activity Baskets", subcategory: "Other" },
      { text: "Misc Decor", subcategory: "Other" },
      { text: "Parent Gifts", subcategory: "Other" },
      { text: "Gifts For Each Other", subcategory: "Other" },
      { text: "Reception Party Favors", subcategory: "Other" },
    ],
  },
  {
    type: "HONEYMOON",
    name: "Honeymoon",
    items: [
      { text: "Swimsuits" },
      { text: "Coverups" },
      { text: "Underwear" },
      { text: "Shoes" },
      { text: "Dresses" },
      { text: "PJs" },
      { text: "Daily Outfits" },
      { text: "Passport" },
      { text: "Download Music / Audiobooks / TV" },
      { text: "Pool Float?" },
      { text: "Headphones" },
    ],
  },
  {
    type: "BACHELORETTE",
    name: "Bachelorette Weekend",
    items: [
      { text: "Silver Star Outfit (Written in the Stars theme)", subcategory: "Outfits" },
      { text: "\"Last Rodeo\" Cowgirl Outfit", subcategory: "Outfits" },
      { text: "2 Comfy Outfits (for the drive)", subcategory: "Outfits" },
      { text: "Dancing / Walking Shoes (boots preferred)", subcategory: "General" },
      { text: "Purses", subcategory: "General" },
      { text: "Pajamas", subcategory: "General" },
      { text: "Fans", subcategory: "General" },
      { text: "Socks", subcategory: "General" },
      { text: "Underwear", subcategory: "General" },
      { text: "Jewelry", subcategory: "General" },
      { text: "Toiletries", subcategory: "General" },
      { text: "Hair / Makeup Stuff", subcategory: "General" },
      { text: "Phone Charger", subcategory: "General" },
      { text: "Energy Drinks (white Monster / Reign)", subcategory: "Mikayla (For the Car/House)" },
      { text: "Tequila", subcategory: "Mikayla (For the Car/House)" },
      { text: "Margarita Mix", subcategory: "Mikayla (For the Car/House)" },
      { text: "Vodka", subcategory: "Mikayla (For the Car/House)" },
      { text: "Lemonade", subcategory: "Mikayla (For the Car/House)" },
      { text: "Sprite", subcategory: "Mikayla (For the Car/House)" },
      { text: "Shooters", subcategory: "Mikayla (For the Car/House)" },
      { text: "Popcorn", subcategory: "Mikayla (For the Car/House)" },
      { text: "Chips", subcategory: "Mikayla (For the Car/House)" },
      { text: "Candy", subcategory: "Mikayla (For the Car/House)" },
      { text: "Decorations", subcategory: "Mikayla (For the Car/House)" },
      { text: "Gifts For Everyone", subcategory: "Mikayla (For the Car/House)" },
      { text: "Cooler", subcategory: "Mikayla (For the Car/House)" },
      { text: "Phone Chargers", subcategory: "Mikayla (For the Car/House)" },
      { text: "Blankets", subcategory: "Mikayla (For the Car/House)" },
      { text: "Board Games", subcategory: "Mikayla (For the Car/House)" },
      { text: "Shot Glasses", subcategory: "Mikayla (For the Car/House)" },
    ],
  },
];

// From the girlies workbook's "Wedding Day Info" hair/makeup signup table.
// Matched to Guest rows by first name only at seed time (best-effort — the
// source sheet only has first names) — Mikayla is excluded, she's the bride.
export const HAIR_MAKEUP_SIGNUPS: { firstName: string; wantsHair: boolean; wantsMakeup: boolean }[] = [
  { firstName: "Kelsey", wantsHair: true, wantsMakeup: false },
  { firstName: "Lauren", wantsHair: false, wantsMakeup: false },
  { firstName: "Jessica", wantsHair: false, wantsMakeup: false },
  { firstName: "Paige", wantsHair: false, wantsMakeup: false },
  { firstName: "Deborah", wantsHair: true, wantsMakeup: true },
  { firstName: "Kelli", wantsHair: false, wantsMakeup: false },
  { firstName: "Madison", wantsHair: false, wantsMakeup: false },
];

export const MESSAGE_TEMPLATES: { triggerLabel?: string; body: string; audience?: string }[] = [
  {
    body: "Our invitations just went out. Keep an eye on your mailbox.",
    audience: "All guests",
  },
  {
    body: "You should have received an invitation by now… here is the link to our wedding website so you can RSVP.",
    audience: "All guests",
  },
  {
    body: "This is a reminder that whether you can come or whether you can't we would still like to know. Please RSVP - even if it's a no.",
    audience: "Non-RSVPs",
  },
  {
    triggerLabel: "March 15, 2027",
    body: "This is your last chance to RSVP. If you don't RSVP by April 1st, you will automatically be marked as a no.",
    audience: "Non-RSVPs",
  },
  {
    body: "Thank you for your RSVP. We are so sorry that you are unable to attend and we will miss you. If this is an error please submit another RSVP here: …",
    audience: "RSVP'd no",
  },
  {
    triggerLabel: "April 15, 2027",
    body: "Our wedding is in 2 weeks! ... If you're attending the welcome party you need an all white outfit. There is also a dress code for the wedding...",
    audience: "All guests",
  },
  {
    triggerLabel: "April 30, 2027",
    body: "Our wedding is tomorrow. This is everything you need to know about the venue/parking and just a reminder that the doors will be closed at … and we will not be allowing anyone in after that.",
    audience: "All guests",
  },
  {
    body: "Thank you so much for attending our wedding. We were so happy to have you there.",
    audience: "All guests",
  },
];
