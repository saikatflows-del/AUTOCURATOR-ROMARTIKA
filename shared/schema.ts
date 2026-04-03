import { pgTable, serial, text, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  artistName: varchar("artist_name"),
  imageBase64: text("image_base64").notNull(), 
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

export const artistSchema = z.object({
  name: z.string(),
  nationality: z.string(),
  lifespan: z.string(),
  bio: z.string(),
  wikipediaUrl: z.string(),
  famousWorks: z.array(z.string()),
});

export const gallerySchema = z.object({
  name: z.string(),
  city: z.string(),
  country: z.string(),
});

export const buyerInterestSchema = z.object({
  buyerTypes: z.array(z.string()),
  collectingReasons: z.array(z.string()),
  idealSettings: z.array(z.string()),
  investmentPotential: z.string(),
  suggestedGalleries: z.array(gallerySchema),
});

export const masterComparisonSchema = z.object({
  masterName: z.string(),
  colorHarmony: z.number().min(0).max(100),
  colorContrast: z.number().min(0).max(100),
  colorTemperature: z.number().min(0).max(100),
  compositionBalance: z.number().min(0).max(100),
  depthAndPerspective: z.number().min(0).max(100),
  brushworkSimilarity: z.number().min(0).max(100),
  overallSimilarity: z.number().min(0).max(100),
  comparisonNotes: z.string(),
});

export const artAnalysisSchema = z.object({
  artMovement: z.string(),
  movementPeriod: z.string(),
  movementDescription: z.string(),
  movementCharacteristics: z.array(z.string()),
  leadingArtists: z.array(artistSchema),
  paintingInterpretation: z.string(),
  visualElements: z.object({
    colorPalette: z.array(z.string()),
    techniques: z.array(z.string()),
    composition: z.string(),
    mood: z.string(),
  }),
  masterComparison: z.array(masterComparisonSchema),
  buyerInterest: buyerInterestSchema,
  confidence: z.number(),
});

export type Artist = z.infer<typeof artistSchema>;
export type ArtAnalysis = z.infer<typeof artAnalysisSchema>;

export const pricingDetailsSchema = z.object({
  heightInches: z.number().min(1),
  widthInches: z.number().min(1),
  surface: z.enum(["canvas", "paper", "other"]),
  medium: z.string(),
  artistRecognition: z.enum(["well-known", "moderately-known", "little-known"]),
  galleryRepresented: z.boolean(),
});

export type PricingDetails = z.infer<typeof pricingDetailsSchema>;

export const marketPriceEstimateSchema = z.object({
  estimatedPriceINR: z.string(),
  priceRangeLowINR: z.string(),
  priceRangeHighINR: z.string(),
  pricingFactors: z.array(z.string()),
  pricingNotes: z.string(),
});

export type MarketPriceEstimate = z.infer<typeof marketPriceEstimateSchema>;

export const analyzeImageRequestSchema = z.object({
  imageBase64: z.string(),
  artistName: z.string().optional(),
  pricingDetails: pricingDetailsSchema.optional(),
});

export type AnalyzeImageRequest = z.infer<typeof analyzeImageRequestSchema>;
