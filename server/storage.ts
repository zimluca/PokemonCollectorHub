import { 
  users, articles, collections, productTypes, products, userCollections,
  type User, type Article, type InsertArticle,
  type Collection, type InsertCollection, type ProductType, type InsertProductType,
  type Product, type InsertProduct, type UserCollection, type InsertUserCollection,
  type LoginData, type RegisterData
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, ilike, isNotNull } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { pokemonAPI, type PokemonTCGCard } from "./pokemon-api";

export interface IStorage {
  // User methods (Classic Auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: RegisterData): Promise<User>;
  loginUser(loginData: LoginData): Promise<User | null>;

  // Article methods
  getArticles(language?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Collection methods
  getCollections(): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Product type methods
  getProductTypes(): Promise<ProductType[]>;
  getProductType(id: number): Promise<ProductType | undefined>;
  createProductType(productType: InsertProductType): Promise<ProductType>;

  // Product methods
  getProducts(filters?: {
    collectionId?: number;
    productTypeId?: number;
    language?: string;
    search?: string;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  upsertProduct(product: any): Promise<Product>;
  syncPokemonCards(): Promise<void>;
  syncAllPokemonCards(forceUpdate?: boolean): Promise<void>;

  // User collection methods
  getUserCollection(userId: number): Promise<UserCollection[]>;
  addToUserCollection(userCollection: InsertUserCollection): Promise<UserCollection>;
  removeFromUserCollection(userId: number, productId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if data already exists
      const existingProductTypes = await db.select().from(productTypes).limit(1);
      if (existingProductTypes.length > 0) {
        console.log('Database already initialized');
        return;
      }

      console.log('Initializing database with sample data...');

      // Initialize product types
      await db.insert(productTypes).values([
        {
          name: "Single Cards",
          nameIt: "Carte Singole", 
          description: "Individual Pokemon cards",
          descriptionIt: "Carte Pokemon individuali"
        },
        {
          name: "Booster Pack",
          nameIt: "Busta Espansione",
          description: "Pokemon card booster packs", 
          descriptionIt: "Buste Pokemon con carte casuali"
        },
        {
          name: "Box Set",
          nameIt: "Set Scatola", 
          description: "Complete Pokemon card box sets",
          descriptionIt: "Set completi di carte Pokemon in scatola"
        }
      ]);

      // Initialize collections
      await db.insert(collections).values([
        {
          name: "Paldea Evolved",
          nameIt: "Paldea Evolved",
          description: "The latest expansion featuring Paldea region Pokemon",
          descriptionIt: "L'ultima espansione con Pokemon della regione di Paldea",
          imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
          releaseDate: new Date("2024-06-09")
        },
        {
          name: "Scarlet & Violet", 
          nameIt: "Scarlatto e Violetto",
          description: "Base set of the Scarlet & Violet series",
          descriptionIt: "Set base della serie Scarlatto e Violetto",
          imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          releaseDate: new Date("2023-03-31")
        }
      ]);

      // Initialize articles
      await db.insert(articles).values([
        {
          title: "Paldea Evolved Now Available",
          content: "The highly anticipated Paldea Evolved expansion is now available in stores worldwide.",
          excerpt: "Discover the latest Pokemon cards from the Paldea region",
          author: "Pokemon News Team",
          category: "News", 
          language: "en",
          imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=400&fit=crop",
          featured: true
        },
        {
          title: "Tips for New Pokemon Card Collectors",
          content: "Starting your Pokemon card collection can be exciting but overwhelming.",
          excerpt: "Essential guide for beginning Pokemon card collectors", 
          author: "Expert Collector",
          category: "Guide",
          language: "en",
          imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&h=400&fit=crop", 
          featured: false
        }
      ]);

      console.log('Database initialization completed');

      // Sync Pokemon cards after initializing other data
      await this.syncPokemonCards();

    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // User methods (Classic Auth)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: RegisterData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning();
    return user;
  }

  async loginUser(loginData: LoginData): Promise<User | null> {
    const user = await this.getUserByUsername(loginData.username);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    if (!isValidPassword) return null;

    return user;
  }

  // Article methods
  async getArticles(language?: string): Promise<Article[]> {
    if (language) {
      return await db.select().from(articles).where(eq(articles.language, language)).orderBy(desc(articles.publishedAt));
    }
    return await db.select().from(articles).orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(articleData: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(articleData).returning();
    return article;
  }

  // Collection methods
  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async createCollection(collectionData: InsertCollection): Promise<Collection> {
    const [collection] = await db.insert(collections).values(collectionData).returning();
    return collection;
  }

  // Product type methods
  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(productTypes);
  }

  async getProductType(id: number): Promise<ProductType | undefined> {
    const [productType] = await db.select().from(productTypes).where(eq(productTypes.id, id));
    return productType;
  }

  async createProductType(productTypeData: InsertProductType): Promise<ProductType> {
    const [productType] = await db.insert(productTypes).values(productTypeData).returning();
    return productType;
  }

  // Product methods
  async getProducts(filters?: {
    collectionId?: number;
    productTypeId?: number;
    language?: string;
    search?: string;
  }): Promise<Product[]> {
    let whereConditions = [];

    if (filters?.collectionId) {
      whereConditions.push(eq(products.collectionId, filters.collectionId));
    }
    if (filters?.productTypeId) {
      whereConditions.push(eq(products.productTypeId, filters.productTypeId));
    }
    if (filters?.language) {
      whereConditions.push(eq(products.language, filters.language));
    }
    if (filters?.search) {
      whereConditions.push(ilike(products.name, `%${filters.search}%`));
    }

    let query = db.select().from(products);
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    return query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async upsertProduct(productData: any): Promise<Product> {
    try {
      // Validate required fields
      if (!productData.name || !productData.collectionId || !productData.productTypeId) {
        console.error('Missing required fields:', {
          name: productData.name,
          collectionId: productData.collectionId,
          productTypeId: productData.productTypeId
        });
        throw new Error('Missing required product data fields');
      }

      // Check if product with tcgId exists
      if (productData.tcgId) {
        const existing = await db.select().from(products).where(eq(products.tcgId, productData.tcgId));
        if (existing.length > 0) {
          console.log(`Updating existing card: ${productData.name}`);
          const [product] = await db.update(products)
            .set({ ...productData, updatedAt: new Date() })
            .where(eq(products.tcgId, productData.tcgId))
            .returning();
          return product;
        }
      }

      // Create new product
      console.log(`Creating new card: ${productData.name} (${productData.tcgId})`);
      const [product] = await db.insert(products).values({
        ...productData,
        updatedAt: new Date(),
      }).returning();
      return product;
    } catch (error) {
      console.error('Error in upsertProduct:', error);
      console.error('Product data:', JSON.stringify(productData, null, 2));
      throw error;
    }
  }

  async syncPokemonCards(): Promise<void> {
    try {
      console.log('Starting comprehensive Pokemon cards synchronization from ALL sets...');
      
      // Check if we need to do a full sync (threshold is now much higher)
      const existingCards = await db.select().from(products).where(isNotNull(products.tcgId));
      console.log(`Current database contains ${existingCards.length} Pokemon cards.`);
      
      if (existingCards.length > 15000) {
        console.log(`Database already contains ${existingCards.length} Pokemon cards. Skipping sync.`);
        return;
      }

      console.log('Fetching ALL Pokemon cards from ALL sets and expansions...');

      // Fetch ALL cards from the Pokemon TCG API using the comprehensive method
      let allCards: any[] = [];
      
      try {
        allCards = await pokemonAPI.getAllCardsFromAllSets();
        console.log(`Successfully fetched ${allCards.length} total cards from API`);
      } catch (error) {
        console.error('Error fetching from sets, trying direct API fetch:', error);
        try {
          allCards = await pokemonAPI.getAllCards();
          console.log(`Fallback fetch successful: ${allCards.length} cards`);
        } catch (fallbackError) {
          console.error('All API methods failed:', fallbackError);
          throw new Error('Unable to fetch Pokemon cards from API');
        }
      }

      if (allCards.length === 0) {
        throw new Error('No cards were fetched from the Pokemon TCG API');
      }

      console.log(`*** STARTING DATABASE PROCESSING FOR ${allCards.length} POKEMON CARDS ***`);

      // Get existing collections and product types
      const allCollections = await this.getCollections();
      let allProductTypes = await this.getProductTypes();
      
      console.log(`Found ${allCollections.length} existing collections and ${allProductTypes.length} product types`);

      // Find or create "Carte Singole" product type
      let carteSingoleType = allProductTypes.find(pt => pt.nameIt === "Carte Singole" || pt.name === "Single Cards");
      if (!carteSingoleType) {
        console.log('Creating "Carte Singole" product type...');
        carteSingoleType = await this.createProductType({
          name: "Single Cards",
          nameIt: "Carte Singole",
          description: "Individual Pokemon cards",
          descriptionIt: "Carte Pokemon individuali"
        });
        allProductTypes.push(carteSingoleType);
      }

      let processedCount = 0;
      let createdCollections = 0;

      console.log(`*** BEGINNING CARD PROCESSING LOOP FOR ${allCards.length} CARDS ***`);
      
      // Process cards in batches
      for (const card of allCards) {
        try {
          if (processedCount === 0) {
            console.log(`Processing first card: ${card.name} from set ${card.set.name}`);
          }
          // Find or create collection for this set
          let collection = allCollections.find(c => c.name === card.set.name);
          if (!collection) {
            console.log(`Creating new collection: ${card.set.name}`);
            collection = await this.createCollection({
              name: card.set.name,
              nameIt: card.set.name,
              description: `Pokemon TCG set: ${card.set.name}`,
              descriptionIt: `Set Pokemon TCG: ${card.set.name}`,
              imageUrl: card.set.images?.logo || null,
              releaseDate: card.set.releaseDate ? new Date(card.set.releaseDate) : null
            });
            allCollections.push(collection);
            createdCollections++;
          }

          // Prepare card data for "Carte Singole" 
          const cardData = {
            tcgId: card.id,
            name: card.name,
            nameIt: card.name,
            description: card.flavorText || `${card.name} Pokemon card`,
            descriptionIt: card.flavorText || `Carta Pokemon ${card.name}`,
            collectionId: collection.id,
            productTypeId: carteSingoleType.id,  // Always use "Carte Singole"
            cardNumber: card.number,
            rarity: card.rarity,
            language: "en",
            imageUrl: card.images?.small || null,
            imageUrlLarge: card.images?.large || null,
            setName: card.set.name,
            setId: card.set.id,
            artist: card.artist || null,
            hp: card.hp || null,
            types: card.types || null,
            prices: this.extractPrices(card),
          };

          console.log(`Attempting to save card: ${card.name} (${card.id}) to collection ${collection.name} (${collection.id}) as type ${carteSingoleType.nameIt} (${carteSingoleType.id})`);
          
          const savedCard = await this.upsertProduct(cardData);
          if (savedCard) {
            processedCount++;
            console.log(`✓ Successfully saved card ${processedCount}: ${savedCard.name}`);
          } else {
            console.error(`✗ Failed to save card: ${card.name}`);
          }

          if (processedCount % 500 === 0) {
            console.log(`Progress: ${processedCount}/${allCards.length} cards processed...`);
          }
        } catch (error) {
          console.error(`Error processing card ${card.id}:`, error);
        }
      }

      console.log(`Automatic sync completed! Processed ${processedCount} Pokemon cards from ${createdCollections} new collections`);
    } catch (error) {
      console.error('Error in automatic Pokemon cards synchronization:', error);
      throw error;
    }
  }

  private extractPrices(card: any): any {
    // Extract prices from TCG Player and Cardmarket data
    const prices: any = {};
    
    if (card.tcgplayer?.prices) {
      prices.tcgplayer = card.tcgplayer.prices;
    }
    
    if (card.cardmarket?.prices) {
      prices.cardmarket = card.cardmarket.prices;
    }
    
    return Object.keys(prices).length > 0 ? prices : null;
  }

  async syncAllPokemonCards(forceUpdate: boolean = false): Promise<void> {
    try {
      console.log('Starting manual Pokemon cards synchronization...');
      
      if (!forceUpdate) {
        const existingCount = await db.select().from(products).where(isNotNull(products.tcgId));
        console.log(`Found ${existingCount.length} existing Pokemon cards in database`);
      }

      // Fetch ALL cards from the Pokemon TCG API
      let allCards: any[] = [];
      
      try {
        allCards = await pokemonAPI.getAllCardsFromAllSets();
        console.log(`Successfully fetched ${allCards.length} total cards from API`);
      } catch (error) {
        console.error('Error fetching from sets, trying direct API fetch:', error);
        try {
          allCards = await pokemonAPI.getAllCards();
          console.log(`Fallback fetch successful: ${allCards.length} cards`);
        } catch (fallbackError) {
          console.error('All API methods failed:', fallbackError);
          throw new Error('Unable to fetch Pokemon cards from API');
        }
      }

      if (allCards.length === 0) {
        throw new Error('No cards were fetched from the Pokemon TCG API');
      }

      console.log(`Processing ${allCards.length} Pokemon cards for database insertion...`);

      // Get existing collections and product types
      const allCollections = await this.getCollections();
      const allProductTypes = await this.getProductTypes();

      const cardProductType = allProductTypes.find(pt => pt.name === "Single Cards");
      if (!cardProductType) {
        throw new Error("Single Cards product type not found");
      }

      let processedCount = 0;
      let updatedCount = 0;
      let newCount = 0;

      // Process cards in batches
      for (const card of allCards) {
        try {
          // Find or create collection for this set
          let collection = allCollections.find(c => c.name === card.set.name);
          if (!collection) {
            collection = await this.createCollection({
              name: card.set.name,
              nameIt: card.set.name,
              description: `Pokemon TCG set: ${card.set.name}`,
              descriptionIt: `Set Pokemon TCG: ${card.set.name}`,
              imageUrl: card.set.images?.logo || null,
              releaseDate: card.set.releaseDate ? new Date(card.set.releaseDate) : null
            });
            allCollections.push(collection);
          }

          // Check if card already exists
          const existingCard = await db.select().from(products).where(eq(products.tcgId, card.id));
          
          // Prepare product data
          const productData = {
            tcgId: card.id,
            name: card.name,
            nameIt: card.name,
            description: card.flavorText || `${card.name} Pokemon card`,
            descriptionIt: card.flavorText || `Carta Pokemon ${card.name}`,
            collectionId: collection.id,
            productTypeId: cardProductType.id,
            cardNumber: card.number,
            rarity: card.rarity,
            language: "en",
            imageUrl: card.images?.small || null,
            imageUrlLarge: card.images?.large || null,
            setName: card.set.name,
            setId: card.set.id,
            artist: card.artist || null,
            hp: card.hp || null,
            types: card.types || null,
            prices: this.extractPrices(card),
          };

          if (existingCard.length > 0) {
            // Update existing card
            await db.update(products)
              .set({ ...productData, updatedAt: new Date() })
              .where(eq(products.tcgId, card.id));
            updatedCount++;
          } else {
            // Insert new card
            await this.upsertProduct(productData);
            newCount++;
          }

          processedCount++;

          if (processedCount % 500 === 0) {
            console.log(`Processed ${processedCount}/${allCards.length} cards... (${newCount} new, ${updatedCount} updated)`);
          }
        } catch (error) {
          console.error(`Error processing card ${card.id}:`, error);
        }
      }

      console.log(`Manual sync completed! Processed ${processedCount} cards (${newCount} new, ${updatedCount} updated)`);
    } catch (error) {
      console.error('Error in manual Pokemon cards synchronization:', error);
      throw error;
    }
  }

  // User collection methods
  async getUserCollection(userId: number): Promise<UserCollection[]> {
    return await db.select().from(userCollections).where(eq(userCollections.userId, userId));
  }

  async addToUserCollection(userCollectionData: InsertUserCollection): Promise<UserCollection> {
    // Check if item already exists in user's collection
    const existing = await db.select().from(userCollections)
      .where(and(
        eq(userCollections.userId, userCollectionData.userId!),
        eq(userCollections.productId, userCollectionData.productId!)
      ));

    if (existing.length > 0) {
      // Update quantity
      const [updated] = await db.update(userCollections)
        .set({ 
          quantity: (existing[0].quantity || 1) + (userCollectionData.quantity || 1) 
        })
        .where(eq(userCollections.id, existing[0].id))
        .returning();
      return updated;
    }

    // Add new item
    const [userCollection] = await db.insert(userCollections).values(userCollectionData).returning();
    return userCollection;
  }

  async removeFromUserCollection(userId: number, productId: number): Promise<boolean> {
    const result = await db.delete(userCollections)
      .where(and(
        eq(userCollections.userId, userId),
        eq(userCollections.productId, productId)
      ));

    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();