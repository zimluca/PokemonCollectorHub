import { db } from "./db";
import { users, articles, collections, productTypes, products, userCollections } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Clear existing data
  await db.delete(userCollections);
  await db.delete(products);
  await db.delete(articles);
  await db.delete(collections);
  await db.delete(productTypes);
  await db.delete(users);

  // Create product types
  const [cardType] = await db.insert(productTypes).values({
    name: "Single Cards",
    nameIt: "Carte Singole",
    description: "Individual Pokemon cards",
    descriptionIt: "Carte Pokemon individuali"
  }).returning();

  const [packType] = await db.insert(productTypes).values({
    name: "Booster Packs",
    nameIt: "Buste",
    description: "Booster packs containing random cards",
    descriptionIt: "Buste contenenti carte casuali"
  }).returning();

  const [etbType] = await db.insert(productTypes).values({
    name: "Elite Trainer Box",
    nameIt: "Elite Trainer Box",
    description: "Complete trainer boxes with packs and accessories",
    descriptionIt: "Scatole complete con buste e accessori"
  }).returning();

  // Create collections
  const [paldea] = await db.insert(collections).values({
    name: "Paldea Evolved",
    nameIt: "Paldea Evolved",
    description: "The latest expansion featuring Paldea region Pokemon",
    descriptionIt: "L'ultima espansione con Pokemon della regione di Paldea",
    imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
    releaseDate: new Date("2024-06-09")
  }).returning();

  const [scarletViolet] = await db.insert(collections).values({
    name: "Scarlet & Violet",
    nameIt: "Scarlatto e Violetto",
    description: "Base set of the Scarlet & Violet series",
    descriptionIt: "Set base della serie Scarlatto e Violetto",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    releaseDate: new Date("2023-03-31")
  }).returning();

  // Create English cards
  const englishCards = [
    {
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
      prices: { cardmarket: 89.99, ebay: 95.00, tcgplayer: 92.50 }
    },
    {
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
      prices: { cardmarket: 45.99, ebay: 52.00, tcgplayer: 48.75 }
    },
    {
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
      prices: { cardmarket: 67.50, ebay: 72.00, tcgplayer: 69.25 }
    },
    {
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
      prices: { cardmarket: 32.99, ebay: 38.00, tcgplayer: 35.50 }
    },
    {
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
      prices: { cardmarket: 78.99, ebay: 85.00, tcgplayer: 81.25 }
    }
  ];

  // Create Italian cards
  const italianCards = [
    {
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
      prices: { cardmarket: 75.99, ebay: 82.00, tcgplayer: 78.50 }
    },
    {
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
      prices: { cardmarket: 38.99, ebay: 44.00, tcgplayer: 41.25 }
    },
    {
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
      prices: { cardmarket: 58.50, ebay: 63.00, tcgplayer: 60.25 }
    },
    {
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
      prices: { cardmarket: 28.99, ebay: 33.00, tcgplayer: 30.50 }
    },
    {
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
      prices: { cardmarket: 68.99, ebay: 74.00, tcgplayer: 71.25 }
    }
  ];

  // Insert cards
  await db.insert(products).values(englishCards);
  await db.insert(products).values(italianCards);

  // Create booster packs
  const packs = [
    {
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
      prices: { cardmarket: 3.99, ebay: 4.50, tcgplayer: 4.25 }
    },
    {
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
      prices: { cardmarket: 4.25, ebay: 4.75, tcgplayer: 4.50 }
    },
    {
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
      prices: { cardmarket: 39.99, ebay: 45.00, tcgplayer: 42.50 }
    }
  ];

  await db.insert(products).values(packs);

  // Create articles
  const sampleArticles = [
    {
      title: "Paldea Evolved: Complete Set Review & Investment Guide",
      content: "Discover the most valuable cards from the latest expansion and learn which ones are worth adding to your collection.",
      excerpt: "Complete guide to Paldea Evolved set with investment tips",
      author: "PokeHunter Team",
      category: "Featured",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=400&fit=crop",
      featured: true,
      publishedAt: new Date()
    },
    {
      title: "Pack Opening Strategy: Maximizing Your Pulls",
      content: "Learn the best techniques and timing for opening booster packs to get the most value.",
      excerpt: "Best practices for booster pack opening",
      author: "PokeHunter Team",
      category: "Strategy",
      language: "en",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop",
      featured: false,
      publishedAt: new Date()
    }
  ];

  await db.insert(articles).values(sampleArticles);

  console.log("Database seeding completed successfully!");
}

// Run the seed function
seedDatabase().catch(console.error);