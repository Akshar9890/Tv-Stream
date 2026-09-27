import { ContentItem, SubscriptionPlan, UserProfile, UserSubscription } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  { id: 'p1', name: 'Primary Account', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isKids: false },
  { id: 'p2', name: 'Family / TV', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isKids: false },
  { id: 'p3', name: 'Kids Zone', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80', isKids: true }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'StreamHub Free',
    priceMonthly: 0,
    priceFormatted: 'Free with Ads',
    maxQuality: '720p HD',
    concurrentStreams: 1,
    adSupported: true,
    features: [
      'Access to Free Catalog & Creator Spotlights',
      'Watch on 1 Screen',
      '720p HD resolution',
      'Standard audio (Stereo 2.0)'
    ]
  },
  {
    id: 'vip',
    name: 'Super VIP',
    priceMonthly: 7.99,
    priceFormatted: '$7.99 / month',
    maxQuality: '1080p Full HD',
    concurrentStreams: 2,
    adSupported: false,
    features: [
      'All Movies, Series & Originals',
      'Ad-free uninterrupted streaming',
      'Watch on 2 Screens simultaneously',
      '1080p Full HD Video',
      'Dolby 5.1 Surround Sound',
      'Smart TV & Mobile App access'
    ],
    highlight: true
  },
  {
    id: 'premium',
    name: 'Premium 4K Ultra',
    priceMonthly: 13.99,
    priceFormatted: '$13.99 / month',
    maxQuality: '4K Ultra HD + HDR',
    concurrentStreams: 4,
    adSupported: false,
    features: [
      'Complete StreamHub VIP + 4K Library',
      '4K Ultra HD + HDR10 / Dolby Vision',
      'Dolby Atmos spatial audio',
      'Watch on 4 Screens at once',
      'Early access to StreamHub Originals',
      'Offline download on mobile & TV'
    ]
  }
];

export const INITIAL_USER_SUBSCRIPTION: UserSubscription = {
  planId: 'vip',
  status: 'active',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  paymentMethod: 'Visa ending in 4242',
  lastBilledAt: new Date().toISOString()
};

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'sh-upload-1790506117026',
    title: 'The Great Indian Kapil Show',
    slug: 'the-great-indian-kapil-show',
    type: 'series',
    synopsis: 'Kapil Sharma and his comedy troupe bring unscripted banter, celebrity interviews, and hilarious sketches.',
    duration: 3600,
    releaseYear: 2026,
    rating: 9.4,
    ageRating: 'U/A 13+',
    genres: ['Comedy', 'Talk Show'],
    cast: ['Kapil Sharma', 'Sunil Grover', 'Archana Puran Singh'],
    director: 'Kapil Sharma',
    posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&auto=format&fit=crop&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&auto=format&fit=crop&q=80',
    bucket: 'owned',
    entitlementTier: 'free',
    featured: true,
    streamManifestUrl: '/uploads/The_Great_Indian_Kapil_Show_Season_5_Episode_1.720p_-_1vegamovies.tw.mkv',
    renditions: [
      {
        quality: '720p',
        resolution: '1280x720',
        bitrate: '2.5 Mbps',
        url: '/uploads/The_Great_Indian_Kapil_Show_Season_5_Episode_1.720p_-_1vegamovies.tw.mkv'
      }
    ],
    audioTracks: [
      {
        id: 'hi',
        label: 'Hindi Original',
        language: 'hi',
        isDefault: true
      }
    ],
    subtitleTracks: [],
    seasons: [
      {
        seasonNumber: 5,
        title: 'Season 5',
        episodes: [
          {
            id: 'kapil-s5-e1',
            seasonNumber: 5,
            episodeNumber: 1,
            title: 'Episode 1: The Grand Season Premiere',
            synopsis: 'Kapil Sharma, Sunil Grover, and the cast return with celebrity guests and non-stop laughter.',
            duration: 3600,
            thumbnailUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500&auto=format&fit=crop&q=80',
            streamUrl: '/uploads/The_Great_Indian_Kapil_Show_Season_5_Episode_1.720p_-_1vegamovies.tw.mkv',
            renditions: [
              {
                quality: '720p',
                resolution: '1280x720',
                bitrate: '2.5 Mbps',
                url: '/uploads/The_Great_Indian_Kapil_Show_Season_5_Episode_1.720p_-_1vegamovies.tw.mkv'
              }
            ]
          }
        ]
      }
    ],
    status: 'published',
    viewCount: 1,
    createdAt: '2026-09-27T10:48:37.026Z',
    updatedAt: '2026-09-27T10:48:37.026Z'
  }
];
