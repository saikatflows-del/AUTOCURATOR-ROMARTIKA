import { db } from "./db";
import { analyses, type InsertAnalysis, type Analysis } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAnalyses(userId: string): Promise<Analysis[]>;
  getAnalysisById(id: number): Promise<Analysis | undefined>;
  createAnalysis(userId: string, data: Omit<InsertAnalysis, "userId">): Promise<Analysis>;
  deleteAnalysisById(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAnalyses(userId: string): Promise<Analysis[]> {
    return await db.select().from(analyses).where(eq(analyses.userId, userId)).orderBy(desc(analyses.createdAt));
  }

  async getAnalysisById(id: number): Promise<Analysis | undefined> {
    const [result] = await db.select().from(analyses).where(eq(analyses.id, id));
    return result;
  }

  async createAnalysis(userId: string, data: Omit<InsertAnalysis, "userId">): Promise<Analysis> {
    const [result] = await db.insert(analyses).values({
      userId,
      artistName: data.artistName || null,
      imageBase64: data.imageBase64,
      result: data.result,
    }).returning();
    return result;
  }

  async deleteAnalysisById(id: number): Promise<void> {
    await db.delete(analyses).where(eq(analyses.id, id));
  }
}

export const storage = new DatabaseStorage();
