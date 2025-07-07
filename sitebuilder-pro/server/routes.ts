import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSiteSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertAnalyticsSchema,
  insertTemplateSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/templates', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(validatedData);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Site routes
  app.get('/api/sites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sites = await storage.getSitesByUser(userId);
      res.json(sites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });

  app.get('/api/sites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.id);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      res.json(site);
    } catch (error) {
      console.error("Error fetching site:", error);
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  app.post('/api/sites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSiteSchema.parse({
        ...req.body,
        userId
      });
      const site = await storage.createSite(validatedData);
      res.json(site);
    } catch (error) {
      console.error("Error creating site:", error);
      res.status(500).json({ message: "Failed to create site" });
    }
  });

  app.put('/api/sites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.id);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const validatedData = insertSiteSchema.partial().parse(req.body);
      const updatedSite = await storage.updateSite(req.params.id, validatedData);
      res.json(updatedSite);
    } catch (error) {
      console.error("Error updating site:", error);
      res.status(500).json({ message: "Failed to update site" });
    }
  });

  app.delete('/api/sites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.id);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      await storage.deleteSite(req.params.id);
      res.json({ message: "Site deleted successfully" });
    } catch (error) {
      console.error("Error deleting site:", error);
      res.status(500).json({ message: "Failed to delete site" });
    }
  });

  // Product routes
  app.get('/api/sites/:siteId/products', async (req, res) => {
    try {
      const products = await storage.getProductsBySite(req.params.siteId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/sites/:siteId/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const validatedData = insertProductSchema.parse({
        ...req.body,
        siteId: req.params.siteId
      });
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const site = await storage.getSite(product.siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(parseInt(req.params.id), validatedData);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Order routes
  app.get('/api/sites/:siteId/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const orders = await storage.getOrdersBySite(req.params.siteId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/sites/:siteId/orders', async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        siteId: req.params.siteId
      });
      const order = await storage.createOrder(validatedData);
      
      // Here you would integrate with WhatsApp API
      // For now, just return the order
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const site = await storage.getSite(order.siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Analytics routes
  app.get('/api/sites/:siteId/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const site = await storage.getSite(req.params.siteId);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      const analytics = await storage.getAnalytics(req.params.siteId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.post('/api/sites/:siteId/analytics', async (req, res) => {
    try {
      const validatedData = insertAnalyticsSchema.parse({
        ...req.body,
        siteId: req.params.siteId
      });
      const analytics = await storage.updateAnalytics(validatedData);
      res.json(analytics);
    } catch (error) {
      console.error("Error updating analytics:", error);
      res.status(500).json({ message: "Failed to update analytics" });
    }
  });

  // Site by slug route (public)
  app.get('/api/sites/by-slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const site = await storage.getSiteBySlug(slug);
      
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      res.json(site);
    } catch (error) {
      console.error("Error fetching site by slug:", error);
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  // Site analytics with period parameter
  app.get('/api/sites/:id/analytics/:period?', isAuthenticated, async (req: any, res) => {
    try {
      const { id, period = '30d' } = req.params;
      const userId = req.user.claims.sub;
      
      const site = await storage.getSite(id);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Calculate date range based on period
      let startDate = new Date();
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default: // 30d
          startDate.setDate(startDate.getDate() - 30);
      }
      
      const analytics = await storage.getAnalytics(id, startDate, new Date());
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching site analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Track page view (public)
  app.post('/api/sites/:id/track-view', async (req, res) => {
    try {
      const { id } = req.params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await storage.updateAnalytics({
        siteId: id,
        date: today,
        views: 1,
        orders: 0,
        revenue: "0"
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Public site routes (for generated sites)
  app.get('/api/public/sites/:slug', async (req, res) => {
    try {
      const site = await storage.getSiteBySlug(req.params.slug);
      if (!site || !site.isActive) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const products = await storage.getProductsBySite(site.id);
      res.json({ site, products });
    } catch (error) {
      console.error("Error fetching public site:", error);
      res.status(500).json({ message: "Failed to fetch site" });
    }
  });

  // Netlify deployment route
  app.post('/api/sites/:id/deploy', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const site = await storage.getSite(id);
      if (!site || site.userId !== userId) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      // Here you would integrate with Netlify API
      // For now, simulate deployment
      const netlifyUrl = `https://${site.slug}.netlify.app`;
      const netlifyId = `site-${Date.now()}`;
      
      await storage.updateSite(id, {
        netlifyUrl,
        netlifyId
      });
      
      res.json({ 
        success: true, 
        url: netlifyUrl,
        message: "Site deployed successfully!"
      });
    } catch (error) {
      console.error("Error deploying site:", error);
      res.status(500).json({ message: "Failed to deploy site" });
    }
  });

  // Track site view
  app.post('/api/public/sites/:slug/view', async (req, res) => {
    try {
      const site = await storage.getSiteBySlug(req.params.slug);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await storage.updateAnalytics({
        siteId: site.id,
        date: today,
        views: 1,
      });
      
      res.json({ message: "View tracked" });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
