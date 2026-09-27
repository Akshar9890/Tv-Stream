// StreamHub Core Type Definitions

export type ContentBucket = 'owned' | 'licensed' | 'user_generated';

export type ContentType = 'movie' | 'series';

export type EntitlementTier = 'free' | 'vip' | 'premium';

export type ContentStatus = 
  | 'pending_moderation' 
  | 'transcoding' 
  | 'published' 
  | 'rejected' 
  | 'taken_down';

export interface VideoRendition {
  quality: string;       // '1080p' | '720p' | '480p' | '360p'
  resolution: string;    // '1920x1080', '1280x720', etc.
  bitrate: string;       // '4.5 Mbps', '2.2 Mbps', etc.
  url: string;
}

export interface AudioTrack {
  id: string;
  label: string;
  language: string;
  isDefault?: boolean;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  src: string;
  isDefault?: boolean;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  streamUrl: string;
  renditions: VideoRendition[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface RightsAttestation {
  attestedBy: string;
  attestedAt: string;
  bucket: ContentBucket;
  licenseRecordId?: string;
  contractExpiryDate?: string;
  rightsHolderOrganization?: string;
  dmcaAccepted: boolean;
  notes?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  synopsis: string;
  duration: number; // seconds
  releaseYear: number;
  rating: number; // e.g. 8.7
  ageRating: 'U' | 'U/A 13+' | 'U/A 16+' | 'A 18+';
  genres: string[];
  cast: string[];
  director: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  bucket: ContentBucket;
  licenseRecordId?: string;
  rightsAttestation?: RightsAttestation;
  entitlementTier: EntitlementTier;
  seasons?: Season[];
  streamManifestUrl: string;
  renditions: VideoRendition[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  status: ContentStatus;
  viewCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
}

export interface SubscriptionPlan {
  id: EntitlementTier;
  name: string;
  priceMonthly: number;
  priceFormatted: string;
  maxQuality: string;
  concurrentStreams: number;
  adSupported: boolean;
  features: string[];
  highlight?: boolean;
}

export interface UserSubscription {
  planId: EntitlementTier;
  status: 'active' | 'canceled' | 'past_due';
  expiresAt: string;
  cancelAtPeriodEnd: boolean;
  paymentMethod: string;
  lastBilledAt: string;
}

export interface WatchHistoryItem {
  contentId: string;
  episodeId?: string;
  title: string;
  posterUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

export interface DmcaNotice {
  id: string;
  contentId: string;
  contentTitle: string;
  claimantName: string;
  claimantEmail: string;
  copyrightOwner: string;
  workDescription: string;
  proofDocumentUrl?: string;
  status: 'pending' | 'takedown_executed' | 'rejected';
  receivedAt: string;
  resolvedAt?: string;
  actionTaken?: string;
}

export interface ModerationItem {
  id: string;
  content: ContentItem;
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  transcodingProgress?: number; // 0 - 100
}
