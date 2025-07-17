import { 
  users, articles, collections, productTypes, products, userCollections,
  type User, type InsertUser, type Article, type InsertArticle,
  type Collection, type InsertCollection, type ProductType, type InsertProductType,
  type Product, type InsertProduct, type UserCollection, type InsertUserCollection
} from "@shared/schema";

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
    const cardType = this.createProductType({
      name: "Single Cards",
      nameIt: "Carte Singole",
      description: "Individual Pokemon cards",
      descriptionIt: "Carte Pokemon individuali"
    });

    const packType = this.createProductType({
      name: "Booster Packs",
      nameIt: "Buste",
      description: "Booster packs containing random cards",
      descriptionIt: "Buste contenenti carte casuali"
    });

    const etbType = this.createProductType({
      name: "Elite Trainer Box",
      nameIt: "Elite Trainer Box",
      description: "Complete trainer boxes with packs and accessories",
      descriptionIt: "Scatole complete con buste e accessori"
    });

    // Initialize collections
    const paldea = this.createCollection({
      name: "Paldea Evolved",
      nameIt: "Paldea Evolved",
      description: "The latest expansion featuring Paldea region Pokemon",
      descriptionIt: "L'ultima espansione con Pokemon della regione di Paldea",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      releaseDate: new Date("2024-06-09")
    });

    const scarletViolet = this.createCollection({
      name: "Scarlet & Violet",
      nameIt: "Scarlatto e Violetto",
      description: "Base set of the Scarlet & Violet series",
      descriptionIt: "Set base della serie Scarlatto e Violetto",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      releaseDate: new Date("2023-03-31")
    });

    // Initialize sample products
    this.createProduct({
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
    });

    this.createProduct({
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
    });

    // Initialize sample articles
    this.createArticle({
      title: "Paldea Evolved: Complete Set Review & Investment Guide",
      content: "Discover the most valuable cards from the latest expansion and learn which ones are worth adding to your collection.",
      excerpt: "Complete guide to Paldea Evolved set with investment tips",
      author: "PokeHunter Team",
      category: "Featured",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=400&fit=crop",
      featured: true
    });

    this.createArticle({
      title: "Pack Opening Strategy: Maximizing Your Pulls",
      content: "Learn the best techniques and timing for opening booster packs to get the most value.",
      excerpt: "Best practices for booster pack opening",
      author: "PokeHunter Team",
      category: "Strategy",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      featured: false
    });
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

export const storage = new MemStorage();
