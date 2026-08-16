const VERSES = [
  "Trust in the Lord with all your heart, and do not lean on your own understanding. — Proverbs 3:5",
  "Be still, and know that I am God. — Psalm 46:10",
  "Love is patient and kind; love does not envy or boast. — 1 Corinthians 13:4",
  "I can do all things through him who strengthens me. — Philippians 4:13",
  "The Lord is my shepherd; I shall not want. — Psalm 23:1",
  "Cast all your anxieties on him, because he cares for you. — 1 Peter 5:7",
  "Two are better than one, because they have a good reward for their toil. — Ecclesiastes 4:9",
  "Above all, keep loving one another earnestly. — 1 Peter 4:8",
  "Do not be anxious about anything, but in everything by prayer let your requests be made known to God. — Philippians 4:6",
  "This is the day that the Lord has made; let us rejoice and be glad in it. — Psalm 118:24",
  "Bear with each other and forgive one another. — Colossians 3:13",
  "Let all that you do be done in love. — 1 Corinthians 16:14",
  "He gives strength to the weary and increases the power of the weak. — Isaiah 40:29",
  "A cheerful heart is good medicine. — Proverbs 17:22",
  "Rejoice always, pray without ceasing, give thanks in all circumstances. — 1 Thessalonians 5:16-18",
  "Come to me, all who labor and are heavy laden, and I will give you rest. — Matthew 11:28",
  "Therefore encourage one another and build one another up. — 1 Thessalonians 5:11",
  "The Lord your God is with you, mighty to save. — Zephaniah 3:17",
];

export function pickRandomVerse(): string {
  return VERSES[Math.floor(Math.random() * VERSES.length)];
}
