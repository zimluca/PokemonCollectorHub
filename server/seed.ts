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

  // Create English cards - Scarlet & Violet Base Set ex cards
  const scarletVioletExCards = [
    {
      name: "Koraidon ex",
      nameIt: "Koraidon ex",
      description: "Legendary Fighting-type Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Lotta",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "125/198",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_125.png",
      prices: { cardmarket: 89.99, ebay: 95.00, tcgplayer: 92.50 }
    },
    {
      name: "Miraidon ex",
      nameIt: "Miraidon ex",
      description: "Legendary Electric-type Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Elettro",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "81/198",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_81.png",
      prices: { cardmarket: 78.99, ebay: 82.00, tcgplayer: 80.25 }
    },
    {
      name: "Spidops ex",
      nameIt: "Spidops ex",
      description: "Bug-type Pokemon ex",
      descriptionIt: "Pokemon ex di tipo Coleottero",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "19/198",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_19.png",
      prices: { cardmarket: 12.99, ebay: 15.00, tcgplayer: 13.75 }
    },
    {
      name: "Arcanine ex",
      nameIt: "Arcanine ex",
      description: "Fire-type Pokemon ex",
      descriptionIt: "Pokemon ex di tipo Fuoco",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "31/198",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_31.png",
      prices: { cardmarket: 18.99, ebay: 22.00, tcgplayer: 20.50 }
    },
    {
      name: "Floragato",
      nameIt: "Floragato",
      description: "Grass-type Pokemon evolution",
      descriptionIt: "Pokemon evoluzione di tipo Erba",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "8/198",
      rarity: "Common",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_8.png",
      prices: { cardmarket: 2.99, ebay: 3.50, tcgplayer: 3.25 }
    },
    {
      name: "Meowscarada",
      nameIt: "Meowscarada",
      description: "Grass/Dark-type starter evolution",
      descriptionIt: "Evoluzione starter di tipo Erba/Buio",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "9/198",
      rarity: "Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_9.png",
      prices: { cardmarket: 8.99, ebay: 10.00, tcgplayer: 9.50 }
    },
    {
      name: "Crocalor",
      nameIt: "Crocalor",
      description: "Fire-type Pokemon evolution",
      descriptionIt: "Pokemon evoluzione di tipo Fuoco",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "26/198",
      rarity: "Common",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_26.png",
      prices: { cardmarket: 3.99, ebay: 4.50, tcgplayer: 4.25 }
    },
    {
      name: "Skeledirge",
      nameIt: "Skeledirge",
      description: "Fire/Ghost-type starter evolution",
      descriptionIt: "Evoluzione starter di tipo Fuoco/Spettro",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "27/198",
      rarity: "Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_27.png",
      prices: { cardmarket: 9.99, ebay: 11.00, tcgplayer: 10.50 }
    },
    {
      name: "Quaxwell",
      nameIt: "Quaxwell",
      description: "Water-type Pokemon evolution",
      descriptionIt: "Pokemon evoluzione di tipo Acqua",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "53/198",
      rarity: "Common",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_53.png",
      prices: { cardmarket: 2.99, ebay: 3.50, tcgplayer: 3.25 }
    },
    {
      name: "Quaquaval",
      nameIt: "Quaquaval",
      description: "Water/Fighting-type starter evolution",
      descriptionIt: "Evoluzione starter di tipo Acqua/Lotta",
      collectionId: scarletViolet.id,
      productTypeId: cardType.id,
      cardNumber: "54/198",
      rarity: "Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_54.png",
      prices: { cardmarket: 8.99, ebay: 10.00, tcgplayer: 9.50 }
    }
  ];

  // Create English cards - Paldea Evolved ex cards
  const paldeaEvolvedExCards = [
    {
      name: "Meowscarada ex",
      nameIt: "Meowscarada ex",
      description: "Grass/Dark-type starter Pokemon ex",
      descriptionIt: "Pokemon ex starter di tipo Erba/Buio",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "15/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_15.png",
      prices: { cardmarket: 45.99, ebay: 52.00, tcgplayer: 48.75 }
    },
    {
      name: "Skeledirge ex",
      nameIt: "Skeledirge ex",
      description: "Fire/Ghost-type starter Pokemon ex",
      descriptionIt: "Pokemon ex starter di tipo Fuoco/Spettro",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "33/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_33.png",
      prices: { cardmarket: 42.99, ebay: 48.00, tcgplayer: 45.50 }
    },
    {
      name: "Quaquaval ex",
      nameIt: "Quaquaval ex",
      description: "Water/Fighting-type starter Pokemon ex",
      descriptionIt: "Pokemon ex starter di tipo Acqua/Lotta",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "58/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_58.png",
      prices: { cardmarket: 38.99, ebay: 44.00, tcgplayer: 41.25 }
    },
    {
      name: "Forretress ex",
      nameIt: "Forretress ex",
      description: "Bug/Steel-type Pokemon ex",
      descriptionIt: "Pokemon ex di tipo Coleottero/Acciaio",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "5/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_5.png",
      prices: { cardmarket: 22.99, ebay: 26.00, tcgplayer: 24.50 }
    },
    {
      name: "Slowking ex",
      nameIt: "Slowking ex",
      description: "Water/Psychic-type Pokemon ex",
      descriptionIt: "Pokemon ex di tipo Acqua/Psico",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "61/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_61.png",
      prices: { cardmarket: 28.99, ebay: 32.00, tcgplayer: 30.50 }
    },
    {
      name: "Chien-Pao ex",
      nameIt: "Chien-Pao ex",
      description: "Dark/Ice-type legendary Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Buio/Ghiaccio",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "61/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_127.png",
      prices: { cardmarket: 67.99, ebay: 75.00, tcgplayer: 71.25 }
    },
    {
      name: "Ting-Lu ex",
      nameIt: "Ting-Lu ex",
      description: "Dark/Ground-type legendary Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Buio/Terra",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "103/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_103.png",
      prices: { cardmarket: 58.99, ebay: 65.00, tcgplayer: 62.25 }
    },
    {
      name: "Chi-Yu ex",
      nameIt: "Chi-Yu ex",
      description: "Dark/Fire-type legendary Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Buio/Fuoco",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "40/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_40.png",
      prices: { cardmarket: 78.99, ebay: 85.00, tcgplayer: 81.25 }
    },
    {
      name: "Wo-Chien ex",
      nameIt: "Wo-Chien ex",
      description: "Dark/Grass-type legendary Pokemon ex",
      descriptionIt: "Pokemon ex leggendario di tipo Buio/Erba",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "20/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_20.png",
      prices: { cardmarket: 52.99, ebay: 58.00, tcgplayer: 55.50 }
    },
    {
      name: "Pikachu ex",
      nameIt: "Pikachu ex",
      description: "Electric-type Pokemon ex",
      descriptionIt: "Pokemon ex di tipo Elettro",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "85/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_85.png",
      prices: { cardmarket: 89.99, ebay: 98.00, tcgplayer: 93.50 }
    },
    {
      name: "Dedenne ex",
      nameIt: "Dedenne ex",
      description: "Electric/Fairy-type Tera Pokemon ex",
      descriptionIt: "Pokemon ex Teracristal di tipo Elettro/Folletto",
      collectionId: paldea.id,
      productTypeId: cardType.id,
      cardNumber: "86/193",
      rarity: "Ultra Rare",
      language: "en",
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_86.png",
      prices: { cardmarket: 32.99, ebay: 38.00, tcgplayer: 35.50 }
    }
  ];

  // Combine all English cards
  const englishCards = [...scarletVioletExCards, ...paldeaEvolvedExCards];

  // Create Italian versions of all the cards (same images, but with Italian pricing)
  const italianCards = englishCards.map(card => ({
    ...card,
    language: "it",
    prices: {
      cardmarket: card.prices.cardmarket * 0.85, // Generally 15% cheaper in Italian market
      ebay: card.prices.ebay * 0.88,
      tcgplayer: card.prices.tcgplayer * 0.87
    }
  }));

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
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_127.png",
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
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_125.png",
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
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_61.png",
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
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/paldea-evolved/en-us/SV02_EN_127.png",
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
      imageUrl: "https://dz3we2x72f7ol.cloudfront.net/expansions/scarlet-violet/en-us/SV01_EN_81.png",
      featured: false,
      publishedAt: new Date()
    }
  ];

  await db.insert(articles).values(sampleArticles);

  console.log("Database seeding completed successfully!");
}

// Run the seed function
seedDatabase().catch(console.error);