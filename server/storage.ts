import { 
  users, articles, collections, productTypes, products, userCollections,
  type User, type InsertUser, type Article, type InsertArticle,
  type Collection, type InsertCollection, type ProductType, type InsertProductType,
  type Product, type InsertProduct, type UserCollection, type InsertUserCollection
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, or, desc, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

  // User collection methods
  getUserCollection(userId: number): Promise<UserCollection[]>;
  addToUserCollection(userCollection: InsertUserCollection): Promise<UserCollection>;
  removeFromUserCollection(userId: number, productId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private articles: Map<number, Article> = new Map();
  private collections: Map<number, Collection> = new Map();
  private productTypes: Map<number, ProductType> = new Map();
  private products: Map<number, Product> = new Map();
  private userCollections: Map<number, UserCollection> = new Map();
  
  private userIdCounter = 1;
  private articleIdCounter = 1;
  private collectionIdCounter = 1;
  private productTypeIdCounter = 1;
  private productIdCounter = 1;
  private userCollectionIdCounter = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize product types
    const cardType = {
      id: this.productTypeIdCounter++,
      name: "Single Cards",
      nameIt: "Carte Singole",
      description: "Individual Pokemon cards",
      descriptionIt: "Carte Pokemon individuali"
    };
    this.productTypes.set(cardType.id, cardType);

    const packType = {
      id: this.productTypeIdCounter++,
      name: "Booster Packs",
      nameIt: "Buste",
      description: "Booster packs containing random cards",
      descriptionIt: "Buste contenenti carte casuali"
    };
    this.productTypes.set(packType.id, packType);

    const etbType = {
      id: this.productTypeIdCounter++,
      name: "Elite Trainer Box",
      nameIt: "Elite Trainer Box",
      description: "Complete trainer boxes with packs and accessories",
      descriptionIt: "Scatole complete con buste e accessori"
    };
    this.productTypes.set(etbType.id, etbType);

    // Initialize collections
    const paldea = {
      id: this.collectionIdCounter++,
      name: "Paldea Evolved",
      nameIt: "Paldea Evolved",
      description: "The latest expansion featuring Paldea region Pokemon",
      descriptionIt: "L'ultima espansione con Pokemon della regione di Paldea",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      releaseDate: new Date("2024-06-09")
    };
    this.collections.set(paldea.id, paldea);

    const scarletViolet = {
      id: this.collectionIdCounter++,
      name: "Scarlet & Violet",
      nameIt: "Scarlatto e Violetto",
      description: "Base set of the Scarlet & Violet series",
      descriptionIt: "Set base della serie Scarlatto e Violetto",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      releaseDate: new Date("2023-03-31")
    };
    this.collections.set(scarletViolet.id, scarletViolet);

    // Initialize sample products - English cards
    const charizardEN = {
      id: this.productIdCounter++,
      name: "Charizard VMAX",
      nameIt: "Charizard VMAX",
      description: "Rare Charizard VMAX card",
      descriptionIt: "Carta rara Charizard VMAX",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "020/189",
      rarity: "Rare",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 89.99,
        ebay: 95.00,
        tcgplayer: 92.50
      }
    };
    this.products.set(charizardEN.id, charizardEN);

    const pikachuEN = {
      id: this.productIdCounter++,
      name: "Pikachu V",
      nameIt: "Pikachu V",
      description: "Electric-type Pokemon V card",
      descriptionIt: "Carta Pokemon V di tipo Elettro",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "025/198",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 45.99,
        ebay: 52.00,
        tcgplayer: 48.75
      }
    };
    this.products.set(pikachuEN.id, pikachuEN);

    const mewtwoEN = {
      id: this.productIdCounter++,
      name: "Mewtwo EX",
      nameIt: "Mewtwo EX",
      description: "Psychic-type legendary Pokemon EX",
      descriptionIt: "Pokemon EX leggendario di tipo Psico",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "150/198",
      rarity: "EX",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 67.50,
        ebay: 72.00,
        tcgplayer: 69.25
      }
    };
    this.products.set(mewtwoEN.id, mewtwoEN);

    const garchompEN = {
      id: this.productIdCounter++,
      name: "Garchomp V",
      nameIt: "Garchomp V",
      description: "Dragon-type Pokemon V card",
      descriptionIt: "Carta Pokemon V di tipo Drago",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "445/189",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 32.99,
        ebay: 38.00,
        tcgplayer: 35.50
      }
    };
    this.products.set(garchompEN.id, garchompEN);

    const lucarioEN = {
      id: this.productIdCounter++,
      name: "Lucario VMAX",
      nameIt: "Lucario VMAX",
      description: "Fighting-type Pokemon VMAX",
      descriptionIt: "Pokemon VMAX di tipo Lotta",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "448/198",
      rarity: "VMAX",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 78.99,
        ebay: 85.00,
        tcgplayer: 81.25
      }
    };
    this.products.set(lucarioEN.id, lucarioEN);

    // Italian cards
    const charizardIT = {
      id: this.productIdCounter++,
      name: "Charizard VMAX",
      nameIt: "Charizard VMAX",
      description: "Rare Charizard VMAX card",
      descriptionIt: "Carta rara Charizard VMAX",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "020/189",
      rarity: "Rare",
      language: "it",
      imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 75.99,
        ebay: 82.00,
        tcgplayer: 78.50
      }
    };
    this.products.set(charizardIT.id, charizardIT);

    const pikachuIT = {
      id: this.productIdCounter++,
      name: "Pikachu V",
      nameIt: "Pikachu V",
      description: "Electric-type Pokemon V card",
      descriptionIt: "Carta Pokemon V di tipo Elettro",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "025/198",
      rarity: "Ultra Rare",
      language: "it",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 38.99,
        ebay: 44.00,
        tcgplayer: 41.25
      }
    };
    this.products.set(pikachuIT.id, pikachuIT);

    const mewtwoIT = {
      id: this.productIdCounter++,
      name: "Mewtwo EX",
      nameIt: "Mewtwo EX",
      description: "Psychic-type legendary Pokemon EX",
      descriptionIt: "Pokemon EX leggendario di tipo Psico",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "150/198",
      rarity: "EX",
      language: "it",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 58.50,
        ebay: 63.00,
        tcgplayer: 60.25
      }
    };
    this.products.set(mewtwoIT.id, mewtwoIT);

    const garchompIT = {
      id: this.productIdCounter++,
      name: "Garchomp V",
      nameIt: "Garchomp V",
      description: "Dragon-type Pokemon V card",
      descriptionIt: "Carta Pokemon V di tipo Drago",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "445/189",
      rarity: "Ultra Rare",
      language: "it",
      imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 28.99,
        ebay: 33.00,
        tcgplayer: 30.50
      }
    };
    this.products.set(garchompIT.id, garchompIT);

    const lucarioIT = {
      id: this.productIdCounter++,
      name: "Lucario VMAX",
      nameIt: "Lucario VMAX",
      description: "Fighting-type Pokemon VMAX",
      descriptionIt: "Pokemon VMAX di tipo Lotta",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "448/198",
      rarity: "VMAX",
      language: "it",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 68.99,
        ebay: 74.00,
        tcgplayer: 71.25
      }
    };
    this.products.set(lucarioIT.id, lucarioIT);

    // Add some booster packs
    const paldeaPack = {
      id: this.productIdCounter++,
      name: "Paldea Evolved Booster Pack",
      nameIt: "Busta Paldea Evolved",
      description: "11 card booster pack",
      descriptionIt: "Busta da 11 carte",
      collectionId: paldea.id,
      productTypeId: packType.id,
      cardNumber: null,
      rarity: null,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 3.99,
        ebay: 4.50,
        tcgplayer: 4.25
      }
    };
    this.products.set(paldeaPack.id, paldeaPack);

    const scarletPack = {
      id: this.productIdCounter++,
      name: "Scarlet & Violet Booster Pack",
      nameIt: "Busta Scarlatto e Violetto",
      description: "11 card booster pack",
      descriptionIt: "Busta da 11 carte",
      collectionId: scarletViolet.id,
      productTypeId: packType.id,
      cardNumber: null,
      rarity: null,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 4.25,
        ebay: 4.75,
        tcgplayer: 4.50
      }
    };
    this.products.set(scarletPack.id, scarletPack);

    const paldeaETB = {
      id: this.productIdCounter++,
      name: "Paldea Evolved Elite Trainer Box",
      nameIt: "Elite Trainer Box Paldea Evolved",
      description: "Contains 9 booster packs and accessories",
      descriptionIt: "Contiene 9 buste e accessori",
      collectionId: paldea.id,
      productTypeId: etbType.id,
      cardNumber: null,
      rarity: null,
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      prices: {
        cardmarket: 39.99,
        ebay: 45.00,
        tcgplayer: 42.50
      }
    };
    this.products.set(paldeaETB.id, paldeaETB);

    // Initialize sample articles
    const featuredArticle = {
      id: this.articleIdCounter++,
      title: "Paldea Evolved: Complete Set Review & Investment Guide",
      content: "Discover the most valuable cards from the latest expansion and learn which ones are worth adding to your collection.",
      excerpt: "Complete guide to Paldea Evolved set with investment tips",
      author: "PokeHunter Team",
      category: "Featured",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=400&fit=crop",
      featured: true,
      publishedAt: new Date()
    };
    this.articles.set(featuredArticle.id, featuredArticle);

    const strategyArticle = {
      id: this.articleIdCounter++,
      title: "Pack Opening Strategy: Maximizing Your Pulls",
      content: "Learn the best techniques and timing for opening booster packs to get the most value.",
      excerpt: "Best practices for booster pack opening",
      author: "PokeHunter Team",
      category: "Strategy",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      featured: false,
      publishedAt: new Date()
    };
    this.articles.set(strategyArticle.id, strategyArticle);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Article methods
  async getArticles(language?: string): Promise<Article[]> {
    const articles = Array.from(this.articles.values());
    return language ? articles.filter(article => article.language === language) : articles;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const article: Article = {
      ...insertArticle,
      id,
      publishedAt: new Date()
    };
    this.articles.set(id, article);
    return article;
  }

  // Collection methods
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.collectionIdCounter++;
    const collection: Collection = { ...insertCollection, id };
    this.collections.set(id, collection);
    return collection;
  }

  // Product type methods
  async getProductTypes(): Promise<ProductType[]> {
    return Array.from(this.productTypes.values());
  }

  async getProductType(id: number): Promise<ProductType | undefined> {
    return this.productTypes.get(id);
  }

  async createProductType(insertProductType: InsertProductType): Promise<ProductType> {
    const id = this.productTypeIdCounter++;
    const productType: ProductType = { ...insertProductType, id };
    this.productTypes.set(id, productType);
    return productType;
  }

  // Product methods
  async getProducts(filters?: {
    collectionId?: number;
    productTypeId?: number;
    language?: string;
    search?: string;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters?.collectionId) {
      products = products.filter(p => p.collectionId === filters.collectionId);
    }

    if (filters?.productTypeId) {
      products = products.filter(p => p.productTypeId === filters.productTypeId);
    }

    if (filters?.language) {
      products = products.filter(p => p.language === filters.language);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.nameIt?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  // User collection methods
  async getUserCollection(userId: number): Promise<UserCollection[]> {
    return Array.from(this.userCollections.values()).filter(uc => uc.userId === userId);
  }

  async addToUserCollection(insertUserCollection: InsertUserCollection): Promise<UserCollection> {
    const id = this.userCollectionIdCounter++;
    const userCollection: UserCollection = {
      ...insertUserCollection,
      id,
      addedAt: new Date()
    };
    this.userCollections.set(id, userCollection);
    return userCollection;
  }

  async removeFromUserCollection(userId: number, productId: number): Promise<boolean> {
    for (const [id, userCollection] of this.userCollections) {
      if (userCollection.userId === userId && userCollection.productId === productId) {
        this.userCollections.delete(id);
        return true;
      }
    }
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getArticles(language?: string): Promise<Article[]> {
    if (language) {
      return await db.select().from(articles).where(eq(articles.language, language)).orderBy(desc(articles.publishedAt));
    }
    return await db.select().from(articles).orderBy(desc(articles.publishedAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(insertCollection)
      .returning();
    return collection;
  }

  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(productTypes);
  }

  async getProductType(id: number): Promise<ProductType | undefined> {
    const [productType] = await db.select().from(productTypes).where(eq(productTypes.id, id));
    return productType || undefined;
  }

  async createProductType(insertProductType: InsertProductType): Promise<ProductType> {
    const [productType] = await db
      .insert(productTypes)
      .values(insertProductType)
      .returning();
    return productType;
  }

  async getProducts(filters?: {
    collectionId?: number;
    productTypeId?: number;
    language?: string;
    search?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (filters?.collectionId) {
      conditions.push(eq(products.collectionId, filters.collectionId));
    }
    if (filters?.productTypeId) {
      conditions.push(eq(products.productTypeId, filters.productTypeId));
    }
    if (filters?.language) {
      conditions.push(eq(products.language, filters.language));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.nameIt, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`),
          ilike(products.descriptionIt, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async getUserCollection(userId: number): Promise<UserCollection[]> {
    return await db.select().from(userCollections).where(eq(userCollections.userId, userId));
  }

  async addToUserCollection(insertUserCollection: InsertUserCollection): Promise<UserCollection> {
    const [userCollection] = await db
      .insert(userCollections)
      .values(insertUserCollection)
      .returning();
    return userCollection;
  }

  async removeFromUserCollection(userId: number, productId: number): Promise<boolean> {
    const result = await db
      .delete(userCollections)
      .where(
        and(
          eq(userCollections.userId, userId),
          eq(userCollections.productId, productId)
        )
      );
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
