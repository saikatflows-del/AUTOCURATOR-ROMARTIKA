import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import express from "express";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.post(api.analysis.analyzeImage.path, async (req: any, res) => {
    try {
      const input = api.analysis.analyzeImage.input.parse(req.body);
      const artistName = input.artistName?.trim() || null;
      
      const artistContext = artistName 
        ? ` The artist's name is "${artistName}". Include the artist's name prominently in your analysis and interpretation.`
        : "";
      
      const pricingDetails = input.pricingDetails;
      let pricingPrompt = "";
      let pricingSchemaAddition = "";
      
      if (pricingDetails) {
        pricingPrompt = ` Additionally, estimate the market price in Indian Rupees (INR) for this artwork. The artwork details: Size: ${pricingDetails.heightInches}" x ${pricingDetails.widthInches}" inches, Surface: ${pricingDetails.surface}, Medium: ${pricingDetails.medium}, Artist recognition: ${pricingDetails.artistRecognition}, Gallery represented: ${pricingDetails.galleryRepresented ? "Yes" : "No"}. IMPORTANT: This pricing estimation is for contemporary and emerging artists ONLY. Master artists are NOT considered for this estimation. Provide realistic Indian art market prices.`;
        pricingSchemaAddition = `, marketPriceEstimate: { estimatedPriceINR: string (formatted like "₹1,50,000"), priceRangeLowINR: string, priceRangeHighINR: string, pricingFactors: string[] (list of factors that influenced the price), pricingNotes: string (brief explanation of the estimate) }`;
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `You are an expert art historian and critic. Analyze the provided image of a painting.${artistContext}${pricingPrompt} Return a JSON object strictly matching this schema structure: { artMovement: string, movementPeriod: string, movementDescription: string, movementCharacteristics: string[], leadingArtists: [{ name: string, nationality: string, lifespan: string, bio: string, wikipediaUrl: string, famousWorks: string[] }], paintingInterpretation: string, visualElements: { colorPalette: string[], techniques: string[], composition: string, mood: string }, masterComparison: [{ masterName: string, colorHarmony: number, colorContrast: number, colorTemperature: number, compositionBalance: number, depthAndPerspective: number, brushworkSimilarity: number, overallSimilarity: number, comparisonNotes: string }], buyerInterest: { buyerTypes: string[], collectingReasons: string[], idealSettings: string[], investmentPotential: string, suggestedGalleries: [{ name: string, city: string, country: string }] }, confidence: number${pricingSchemaAddition} } where confidence is 0-100. For suggestedGalleries, provide a mix of 4-6 galleries from India and across the globe that would be suitable for displaying this style of work. Avoid ultra-prestigious institutions like the Louvre, MoMA, or Tate Modern; instead, focus on established but accessible venues like the Jehangir Art Gallery in Mumbai, similar private galleries, or mid-tier contemporary spaces.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this artwork${artistName ? ` by ${artistName}` : ""} and output the JSON.` },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")}` } }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 8192,
      });
      
      const content = response.choices[0]?.message?.content || "{}";
      const analysisResult = JSON.parse(content);
      
      const saved = await storage.createAnalysis("public", {
        imageBase64: input.imageBase64,
        artistName: artistName,
        result: analysisResult,
      });

      res.status(200).json({ analysis: analysisResult, savedId: saved.id });
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.analysis.list.path, async (req: any, res) => {
    try {
      const analyses = await storage.getAnalyses("public");
      res.status(200).json(analyses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.analysis.get.path, async (req: any, res) => {
    try {
      const analysisId = Number(req.params.id);
      const analysis = await storage.getAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Analysis not found" });
      }
      
      res.status(200).json(analysis);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.analysis.delete.path, async (req: any, res) => {
    try {
      const analysisId = Number(req.params.id);
      await storage.deleteAnalysisById(analysisId);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
