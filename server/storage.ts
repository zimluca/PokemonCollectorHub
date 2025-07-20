import { 
  users, articles, collections, productTypes, products, userCollections,
  type User, type UpsertUser, type Article, type InsertArticle,
  type Collection, type InsertCollection, type ProductType, type InsertProductType,
  type Product, type InsertProduct, type UserCollection, type InsertUserCollection
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { pokemonAPI, type PokemonTCGCard } from "./pokemon-api";

export interface IStorage {
  // User methods (Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

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

  // User collection methods
  getUserCollection(userId: string): Promise<UserCollection[]>;
  addToUserCollection(userCollection: InsertUserCollection): Promise<UserCollection>;
  removeFromUserCollection(userId: string, productId: number): Promise<boolean>;
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

  // User methods (Replit Auth)
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
    // Check if product with tcgId exists
    if (productData.tcgId) {
      const existing = await db.select().from(products).where(eq(products.tcgId, productData.tcgId));
      if (existing.length > 0) {
        const [product] = await db.update(products)
          .set({ ...productData, updatedAt: new Date() })
          .where(eq(products.tcgId, productData.tcgId))
          .returning();
        return product;
      }
    }

    // Create new product
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async syncPokemonCards(): Promise<void> {
    try {
      console.log('Starting Pokemon cards synchronization...');

      // Get popular sets to sync
      const popularSets = await pokemonAPI.getPopularSets();
      let allCards: any[] = [];
      
      // Get cards from multiple sets
      for (const setId of popularSets.slice(0, 2)) { // Get cards from first 2 sets
        console.log(`Fetching cards from set: ${setId}`);
        try {
          const setCards = await pokemonAPI.getAllCardsFromSet(setId);
          allCards.push(...setCards.slice(0, 50)); // Limit to 50 cards per set
        } catch (error) {
          console.error(`Error fetching cards from set ${setId}:`, error);
        }
      }

      // If API fails, fallback to sample data
      if (allCards.length === 0) {
        console.log('API failed, using fallback sample data...');
        allCards = [
          {
            id: 'sv1-1',
            name: 'Charizard ex',
            set: { id: 'sv1', name: 'Scarlet & Violet' },
            number: '001',
            rarity: 'Ultra Rare',
            images: { 
              small: 'https://images.pokemontcg.io/sv1/1.png',
              large: 'https://images.pokemontcg.io/sv1/1_hires.png'
            },
            flavorText: 'A legendary fire-type Pokemon',
            artist: 'PLANETA Mochizuki',
            hp: '330',
            types: ['Fire']
          },
          {
            id: 'sv1-25',
            name: 'Pikachu',
            set: { id: 'sv1', name: 'Scarlet & Violet' },
            number: '025',
            rarity: 'Common',
            images: { 
              small: 'https://images.pokemontcg.io/sv1/25.png',
              large: 'https://images.pokemontcg.io/sv1/25_hires.png'
            },
            flavorText: 'An electric mouse Pokemon',
            artist: 'Kouki Saitou',
            hp: '60',
            types: ['Lightning']
          },
          {
            id: 'sv2-1',
            name: 'Pikachu ex',
            set: { id: 'sv2', name: 'Paldea Evolved' },
            number: '85',
            rarity: 'Ultra Rare',
            images: { 
              small: 'https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_85.png',
              large: 'https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_85_hires.png'
            },
            flavorText: 'Electric-type Pokemon ex',
            artist: 'Ayaka Yoshida',
            hp: '200',
            types: ['Electric']
          },
          {
            id: 'sv2-2',
            name: 'Charizard ex',
            set: { id: 'sv2', name: 'Paldea Evolved' },
            number: '054',
            rarity: 'Ultra Rare',
            images: { 
              small: 'https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_54.png',
              large: 'https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_54_hires.png'
            },
            flavorText: 'Fire/Flying-type Pokemon ex',
            artist: 'PLANETA Mochizuki',
            hp: '330',
            types: ['Fire']
          }
        ];
      }

      const cards = allCards;
      console.log(`Retrieved ${cards.length} sample cards for demonstration`);

      // Get existing collections and product types
      const allCollections = await this.getCollections();
      const allProductTypes = await this.getProductTypes();

      const cardProductType = allProductTypes.find(pt => pt.name === "Single Cards");
      if (!cardProductType) {
        throw new Error("Single Cards product type not found");
      }

      let processedCount = 0;

      // Process cards in batches
      for (const card of cards) {
        try {
          // Find or create collection for this set
          let collection = allCollections.find(c => c.name === card.set.name);
          if (!collection) {
            collection = await this.createCollection({
              name: card.set.name,
              nameIt: card.set.name,
              description: `Pokemon TCG set: ${card.set.name}`,
              descriptionIt: `Set Pokemon TCG: ${card.set.name}`,
              imageUrl: null,
              releaseDate: null
            });
            allCollections.push(collection);
          }

          // Prepare product data
          const productData = {
            tcgId: card.id,
            name: card.name,
            nameIt: card.name, // Could be localized later
            description: card.flavorText || `${card.name} Pokemon card`,
            descriptionIt: card.flavorText || `Carta Pokemon ${card.name}`,
            collectionId: collection.id,
            productTypeId: cardProductType.id,
            cardNumber: card.number,
            rarity: card.rarity,
            language: "en", // Default to English
            imageUrl: card.images?.small || null,
            imageUrlLarge: card.images?.large || null,
            setName: card.set.name,
            setId: card.set.id,
            artist: card.artist || null,
            hp: card.hp || null,
            types: card.types || null,
            prices: null,
          };

          await this.upsertProduct(productData);
          processedCount++;

          if (processedCount % 100 === 0) {
            console.log(`Processed ${processedCount} cards...`);
          }
        } catch (error) {
          console.error(`Error processing card ${card.id}:`, error);
        }
      }

      console.log(`Successfully synchronized ${processedCount} Pokemon cards`);
    } catch (error) {
      console.error('Error in Pokemon cards synchronization:', error);
      throw error;
    }
  }

  // User collection methods
  async getUserCollection(userId: string): Promise<UserCollection[]> {
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

  async removeFromUserCollection(userId: string, productId: number): Promise<boolean> {
    const result = await db.delete(userCollections)
      .where(and(
        eq(userCollections.userId, userId),
        eq(userCollections.productId, productId)
      ));

    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();