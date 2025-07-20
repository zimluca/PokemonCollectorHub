import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertProductSchema, insertUserCollectionSchema, loginSchema, registerSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { multilingualSync } from "./multilingual-sync.js";

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

  // Pokemon synchronization route (basic sync)
  app.post("/api/sync/pokemon", isAuthenticated, async (req, res) => {
    try {
      console.log('Starting Pokemon cards synchronization...');
      await storage.syncPokemonCards();
      
      // Get count of synced products
      const products = await storage.getProducts();
      
      res.json({ 
        message: "Carte Pokemon sincronizzate con successo",
        timestamp: new Date().toISOString(),
        totalCards: products.length
      });
    } catch (error) {
      console.error('Pokemon sync error:', error);
      res.status(500).json({ 
        message: "Errore nella sincronizzazione delle carte Pokemon",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Comprehensive sync route for ALL Pokemon cards
  app.post("/api/sync/pokemon/all", isAuthenticated, async (req, res) => {
    try {
      const forceUpdate = req.body.forceUpdate === true;
      
      console.log(`Starting comprehensive Pokemon sync (forceUpdate: ${forceUpdate})`);
      
      // This will take a long time, so send immediate response
      res.json({ 
        message: "Sincronizzazione completa di TUTTE le carte Pokemon avviata",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        note: "Questa operazione potrebbe richiedere diversi minuti. Controlla i log per il progresso."
      });

      // Start the comprehensive sync process in background
      storage.syncAllPokemonCards(forceUpdate).then(async () => {
        const finalProducts = await storage.getProducts();
        const pokemonCards = finalProducts.filter(p => p.tcgId);
        console.log(`Comprehensive Pokemon sync completed! Total Pokemon cards: ${pokemonCards.length}`);
      }).catch((error) => {
        console.error('Comprehensive Pokemon sync failed:', error);
      });

    } catch (error) {
      console.error('Error starting comprehensive Pokemon sync:', error);
      res.status(500).json({ 
        message: "Errore nell'avvio della sincronizzazione completa",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get sync status route
  app.get("/api/sync/status", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const pokemonCards = products.filter(p => p.tcgId);
      
      res.json({
        totalProducts: products.length,
        pokemonCards: pokemonCards.length,
        lastUpdate: pokemonCards.length > 0 ? 
          Math.max(...pokemonCards.map(p => new Date(p.updatedAt || 0).getTime())) : null,
        hasPokemonCards: pokemonCards.length > 0
      });
    } catch (error) {
      console.error('Error getting sync status:', error);
      res.status(500).json({ 
        message: "Errore nel recupero dello stato di sincronizzazione"
      });
    }
  });

  // Auto-sync Pokemon cards on startup if database is empty
  app.get("/api/sync/auto", async (req, res) => {
    try {
      const existingCards = await storage.getProducts({ search: "" });
      
      if (existingCards.length < 100) { // If less than 100 cards, trigger sync
        console.log('*** DATABASE HAS FEW CARDS, STARTING COMPREHENSIVE AUTO-SYNC ***');
        await storage.syncPokemonCards();
        const finalCards = await storage.getProducts();
        res.json({ 
          success: true, 
          message: "Auto-sync completato",
          cardsAdded: true,
          totalCards: finalCards.length
        });
      } else {
        res.json({ 
          success: true, 
          message: "Database già popolato",
          cardsAdded: false,
          totalCards: existingCards.length
        });
      }
    } catch (error) {
      console.error("Auto-sync error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Errore durante auto-sync",
        error: error.message
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

  // Multilingual routes
  app.get('/api/multilingual/test', async (req, res) => {
    try {
      const connected = await multilingualSync.testTCGdxConnection();
      if (connected) {
        await multilingualSync.testMultilingualCard();
        res.json({ success: true, message: 'Multilingual test completed successfully' });
      } else {
        res.status(500).json({ error: 'TCGdx API connection failed' });
      }
    } catch (error) {
      console.error('Multilingual test error:', error);
      res.status(500).json({ error: 'Multilingual test failed' });
    }
  });

  app.post('/api/multilingual/enhance', async (req, res) => {
    try {
      const { limit = 50 } = req.body;
      await multilingualSync.enhanceExistingCardsWithMultilingual(Number(limit));
      res.json({ success: true, message: `Enhanced up to ${limit} cards with multilingual data` });
    } catch (error) {
      console.error('Multilingual enhancement error:', error);
      res.status(500).json({ error: 'Multilingual enhancement failed' });
    }
  });

  app.get('/api/cards/:id/multilingual', async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const cardData = await multilingualSync.getCardWithAllLanguages(cardId);
      
      if (!cardData) {
        return res.status(404).json({ error: 'Card not found' });
      }
      
      res.json(cardData);
    } catch (error) {
      console.error('Get multilingual card error:', error);
      res.status(500).json({ error: 'Failed to get multilingual card data' });
    }
  });

  app.get('/api/multilingual/stats', async (req, res) => {
    try {
      const stats = await multilingualSync.getMultilingualStats();
      res.json(stats);
    } catch (error) {
      console.error('Get multilingual stats error:', error);
      res.status(500).json({ error: 'Failed to get multilingual statistics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
