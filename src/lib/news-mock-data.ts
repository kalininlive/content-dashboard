export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  description: string;
  url: string;
  category: "tools" | "research" | "business";
}

export const newsArticles: NewsArticle[] = [
  // Tools
  {
    id: "1",
    title: "Meta Launches AI-Powered Caption Generator for Instagram Reels",
    source: "Social Media Today",
    sourceUrl: "https://www.socialmediatoday.com",
    publishedAt: "2026-03-29T08:00:00Z",
    description:
      "Meta has rolled out a new generative AI feature that automatically writes captions for Reels, offering creators multiple tone options including casual, professional, and humorous styles.",
    url: "https://www.socialmediatoday.com",
    category: "tools",
  },
  {
    id: "2",
    title: "Canva Integrates Real-Time Brand Kit Syncing Across Instagram Templates",
    source: "Design Week",
    sourceUrl: "https://www.designweek.co.uk",
    publishedAt: "2026-03-28T14:30:00Z",
    description:
      "Canva's latest update enables teams to sync brand colors, fonts, and logos across all Instagram post templates in real time, eliminating manual updates when brand guidelines change.",
    url: "https://www.designweek.co.uk",
    category: "tools",
  },
  {
    id: "3",
    title: "Later Releases Bulk Scheduling for Instagram Stories with Link Stickers",
    source: "Buffer Blog",
    sourceUrl: "https://buffer.com/resources",
    publishedAt: "2026-03-27T10:00:00Z",
    description:
      "Later's new bulk-scheduling workflow now supports Story frames with link sticker placements, letting marketers queue up to 50 Stories at once without losing interactive elements.",
    url: "https://buffer.com/resources",
    category: "tools",
  },
  {
    id: "4",
    title: "Sprout Social Adds Competitive Benchmarking Dashboard to Instagram Analytics",
    source: "MarTech Alliance",
    sourceUrl: "https://martechalliance.com",
    publishedAt: "2026-03-26T09:15:00Z",
    description:
      "Sprout Social's updated analytics suite now includes a side-by-side competitor benchmarking panel for Instagram, showing engagement rate, posting frequency, and follower growth against up to five rivals.",
    url: "https://martechalliance.com",
    category: "tools",
  },
  {
    id: "5",
    title: "Hootsuite's OwlyWriter AI Now Suggests Optimal Hashtag Clusters by Niche",
    source: "Hootsuite Blog",
    sourceUrl: "https://blog.hootsuite.com",
    publishedAt: "2026-03-24T11:45:00Z",
    description:
      "OwlyWriter AI has been updated with a hashtag-cluster recommendation engine that analyzes your existing top-performing posts and suggests tailored hashtag sets to maximize discoverability.",
    url: "https://blog.hootsuite.com",
    category: "tools",
  },

  // Research
  {
    id: "6",
    title: "Instagram Engagement Peaks on Tuesday Mornings, New Study Finds",
    source: "Sprout Social Insights",
    sourceUrl: "https://sproutsocial.com/insights",
    publishedAt: "2026-03-29T07:00:00Z",
    description:
      "Analysis of 500 million Instagram posts shows Tuesday 8–10 AM local time consistently yields 23% higher engagement than the weekly average, overtaking Sunday afternoon as the top slot.",
    url: "https://sproutsocial.com/insights",
    category: "research",
  },
  {
    id: "7",
    title: "Carousel Posts Drive 3× More Profile Visits Than Single-Image Content",
    source: "Social Insider",
    sourceUrl: "https://www.socialinsider.io",
    publishedAt: "2026-03-28T12:00:00Z",
    description:
      "A 12-month study covering 80,000 accounts confirms carousel formats generate significantly more profile visits and saves, making them the highest-ROI organic format on Instagram in 2026.",
    url: "https://www.socialinsider.io",
    category: "research",
  },
  {
    id: "8",
    title: "Gen Z Prefers Authentic UGC Over Polished Brand Content on Instagram",
    source: "Nielsen Digital",
    sourceUrl: "https://nielsen.com",
    publishedAt: "2026-03-27T15:30:00Z",
    description:
      "Nielsen's annual digital trust report reveals 74% of Gen Z respondents trust user-generated content twice as much as brand-produced content, and are 68% more likely to purchase after seeing UGC.",
    url: "https://nielsen.com",
    category: "research",
  },
  {
    id: "9",
    title: "Reel Watch Time Above 30 Seconds Correlates Strongly with Explore Page Placement",
    source: "Later",
    sourceUrl: "https://later.com/blog",
    publishedAt: "2026-03-25T10:00:00Z",
    description:
      "Later's data science team analyzed 1.2 million Reels and found that crossing the 30-second average watch-time threshold is the single strongest predictor of Explore page distribution.",
    url: "https://later.com/blog",
    category: "research",
  },
  {
    id: "10",
    title: "Micro-Influencers (10K–100K) Deliver Higher ROI for E-commerce Than Mega Accounts",
    source: "Influencer Marketing Hub",
    sourceUrl: "https://influencermarketinghub.com",
    publishedAt: "2026-03-23T09:00:00Z",
    description:
      "A meta-analysis of 3,200 brand campaigns shows micro-influencer partnerships generate an average 6.2% engagement rate versus 1.8% for accounts over 1 million followers, with 40% lower CPM.",
    url: "https://influencermarketinghub.com",
    category: "research",
  },

  // Business
  {
    id: "11",
    title: "Instagram Shopping Checkout Now Available to All EU Businesses",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    publishedAt: "2026-03-29T06:30:00Z",
    description:
      "Meta has officially opened Instagram's native checkout feature to all business accounts in the EU following regulatory approval, allowing customers to complete purchases without leaving the app.",
    url: "https://techcrunch.com",
    category: "business",
  },
  {
    id: "12",
    title: "Meta Raises Ad CPMs 18% Ahead of Q2 2026 — What Brands Should Do Now",
    source: "Digiday",
    sourceUrl: "https://digiday.com",
    publishedAt: "2026-03-28T08:45:00Z",
    description:
      "Meta's Q1 earnings call confirmed a significant increase in Instagram and Facebook ad pricing. Experts recommend shifting budget mix toward organic content and creator partnerships to offset rising paid costs.",
    url: "https://digiday.com",
    category: "business",
  },
  {
    id: "13",
    title: "Creator Subscription Revenue on Instagram Grew 210% Year-Over-Year",
    source: "Business Insider",
    sourceUrl: "https://businessinsider.com",
    publishedAt: "2026-03-27T13:00:00Z",
    description:
      "Instagram's subscription monetization tool, launched in 2023, has seen explosive growth as creators shift toward recurring revenue models. Top earners now generate over $50K monthly from subscriptions alone.",
    url: "https://businessinsider.com",
    category: "business",
  },
  {
    id: "14",
    title: "DTC Brands Report 35% Increase in Instagram-Attributed Sales After Reels Strategy Shift",
    source: "Retail Dive",
    sourceUrl: "https://retaildive.com",
    publishedAt: "2026-03-26T11:00:00Z",
    description:
      "A survey of 400 direct-to-consumer brands found that those who pivoted more than 60% of their Instagram content budget to Reels in 2025 saw a significant uplift in attributed e-commerce revenue.",
    url: "https://retaildive.com",
    category: "business",
  },
  {
    id: "15",
    title: "Instagram Introduces Brand Safety Controls for Paid Partnership Labels",
    source: "Marketing Week",
    sourceUrl: "https://marketingweek.com",
    publishedAt: "2026-03-24T10:30:00Z",
    description:
      "Brands can now define content-category exclusion lists for creators using the Paid Partnership label, giving advertisers greater control over where their name appears in influencer collabs.",
    url: "https://marketingweek.com",
    category: "business",
  },
];

export const LAST_UPDATED = "2026-03-29T08:00:00Z";
