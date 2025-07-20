import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertProductSchema, insertUserCollectionSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'temporary-dev-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // Simple auth middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Login route - for demo purposes, create a demo user
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      // Create or get demo user
      const demoUserId = 'demo-user-1';
      let user = await storage.getUser(demoUserId);
      
      if (!user) {
        user = await storage.upsertUser({
          id: demoUserId,
          email: 'demo@pokehunter.com',
          firstName: 'Demo',
          lastName: 'User',
          profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
        });
      }

      req.session.userId = user.id;
      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Pokemon synchronization route
  app.post("/api/sync/pokemon", async (req, res) => {
    try {
      console.log('Starting Pokemon cards synchronization...');
      await storage.syncPokemonCards();
      
      // Get count of synced products
      const products = await storage.getProducts();
      
      res.json({ 
        message: "Pokemon cards synchronized successfully",
        timestamp: new Date().toISOString(),
        totalCards: products.length
      });
    } catch (error) {
      console.error('Pokemon sync error:', error);
      res.status(500).json({ 
        message: "Failed to synchronize Pokemon cards",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const language = req.query.language as string;
      const articles = await storage.getArticles(language);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const articleData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ message: "Invalid article data" });
    }
  });

  // Collections routes
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Product types routes
  app.get("/api/product-types", async (req, res) => {
    try {
      const productTypes = await storage.getProductTypes();
      res.json(productTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product types" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        collectionId: req.query.collectionId ? parseInt(req.query.collectionId as string) : undefined,
        productTypeId: req.query.productTypeId ? parseInt(req.query.productTypeId as string) : undefined,
        language: req.query.language as string,
        search: req.query.search as string
      };
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  // User collection routes (protected)
  app.get("/api/user-collections/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const userCollections = await storage.getUserCollection(userId);
      res.json(userCollections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user collection" });
    }
  });

  app.post("/api/user-collections", isAuthenticated, async (req, res) => {
    try {
      const userCollectionData = insertUserCollectionSchema.parse(req.body);
      const userCollection = await storage.addToUserCollection(userCollectionData);
      res.status(201).json(userCollection);
    } catch (error) {
      res.status(400).json({ message: "Invalid user collection data" });
    }
  });

  app.delete("/api/user-collections/:userId/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.params.userId;
      const productId = parseInt(req.params.productId);
      const success = await storage.removeFromUserCollection(userId, productId);
      if (!success) {
        return res.status(404).json({ message: "User collection item not found" });
      }
      res.json({ message: "Item removed from collection" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from collection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
