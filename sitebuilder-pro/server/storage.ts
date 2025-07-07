import {
  users,
  sites,
  templates,
  products,
  orders,
  analytics,
  type User,
  type UpsertUser,
  type Site,
  type InsertSite,
  type Template,
  type InsertTemplate,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Analytics,
  type InsertAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Site operations
  getSitesByUser(userId: string): Promise<Site[]>;
  getSite(id: string): Promise<Site | undefined>;
  getSiteBySlug(slug: string): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, site: Partial<InsertSite>): Promise<Site>;
  deleteSite(id: string): Promise<void>;
  
  // Product operations
  getProductsBySite(siteId: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Order operations
  getOrdersBySite(siteId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Analytics operations
  getAnalytics(siteId: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  updateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDashboardStats(userId: string): Promise<{
    totalSites: number;
    totalOrders: number;
    totalRevenue: number;
    totalViews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(templates.name);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  // Site operations
  async getSitesByUser(userId: string): Promise<Site[]> {
    return await db.select().from(sites).where(eq(sites.userId, userId)).orderBy(desc(sites.createdAt));
  }

  async getSite(id: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async getSiteBySlug(slug: string): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.slug, slug));
    return site;
  }

  async createSite(site: InsertSite): Promise<Site> {
    const [newSite] = await db.insert(sites).values(site).returning();
    return newSite;
  }

  async updateSite(id: string, site: Partial<InsertSite>): Promise<Site> {
    const [updatedSite] = await db
      .update(sites)
      .set({ ...site, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return updatedSite;
  }

  async deleteSite(id: string): Promise<void> {
    await db.delete(sites).where(eq(sites.id, id));
  }

  // Product operations
  async getProductsBySite(siteId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.siteId, siteId)).orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Order operations
  async getOrdersBySite(siteId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.siteId, siteId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Analytics operations
  async getAnalytics(siteId: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.siteId, siteId),
          gte(analytics.date, startDate),
          lte(analytics.date, endDate)
        )
      )
      .orderBy(analytics.date);
  }

  async updateAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [existing] = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.siteId, analyticsData.siteId),
          eq(analytics.date, analyticsData.date)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(analytics)
        .set({
          views: analyticsData.views || existing.views,
          orders: analyticsData.orders || existing.orders,
          revenue: analyticsData.revenue || existing.revenue,
          conversionRate: analyticsData.conversionRate || existing.conversionRate,
        })
        .where(eq(analytics.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newAnalytics] = await db.insert(analytics).values(analyticsData).returning();
      return newAnalytics;
    }
  }

  async getDashboardStats(userId: string): Promise<{
    totalSites: number;
    totalOrders: number;
    totalRevenue: number;
    totalViews: number;
  }> {
    const userSites = await db.select().from(sites).where(eq(sites.userId, userId));
    const siteIds = userSites.map(site => site.id);

    if (siteIds.length === 0) {
      return {
        totalSites: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0,
      };
    }

    // Simple aggregation to avoid array issues
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalViews = 0;

    for (const siteId of siteIds) {
      const orderCount = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.siteId, siteId));
      const orderRevenue = await db.select({ revenue: sql<number>`sum(${orders.totalAmount})` }).from(orders).where(eq(orders.siteId, siteId));
      const viewCount = await db.select({ views: sql<number>`sum(${analytics.views})` }).from(analytics).where(eq(analytics.siteId, siteId));
      
      totalOrders += Number(orderCount[0]?.count || 0);
      totalRevenue += Number(orderRevenue[0]?.revenue || 0);
      totalViews += Number(viewCount[0]?.views || 0);
    }

    return {
      totalSites: userSites.length,
      totalOrders,
      totalRevenue,
      totalViews,
    };
  }
}

export const storage = new DatabaseStorage();
