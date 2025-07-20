import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertProductSchema, insertUserCollectionSchema, loginSchema, registerSchema } from "@shared/schema";
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
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username già esistente" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email già registrata" });
      }

      const user = await storage.createUser(validatedData);
      req.session.userId = user.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, message: "Registrazione completata" });
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Dati non validi" });
      }
      res.status(500).json({ message: "Errore durante la registrazione" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.loginUser(validatedData);
      if (!user) {
        return res.status(401).json({ message: "Username o password non corretti" });
      }

      req.session.userId = user.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, message: "Login effettuato con successo" });
    } catch (error) {
      console.error("Login error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: error.errors[0]?.message || "Dati non validi" });
      }
      res.status(500).json({ message: "Errore durante il login" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', async (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      res.json({ message: "Logout effettuato con successo" });
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
  app.get("/api/user-collections", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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

  app.delete("/api/user-collections/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
