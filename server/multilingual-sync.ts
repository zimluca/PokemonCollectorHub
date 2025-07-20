// Multilingual synchronization service for Pokemon cards
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db.js";
import { products, collections } from "@shared/schema.js";
import { tcgdxAPI, type SupportedLanguage, type TCGdxCard } from "./tcgdx-api.js";

interface MultilingualCardData {
  cardId: number;
  names: Record<SupportedLanguage, string | null>;
  images: Record<SupportedLanguage, string | null>;
  descriptions: Record<SupportedLanguage, string | null>;
}

class MultilingualSync {
  async testTCGdxConnection(): Promise<boolean> {
    try {
      console.log('Testing TCGdx API connection...');
      const sets = await tcgdxAPI.getAllSets('en');
      console.log(`✓ TCGdx connected successfully. Found ${sets.length} sets.`);
      return sets.length > 0;
    } catch (error) {
      console.error('✗ TCGdx connection failed:', error);
      return false;
    }
  }

  async testMultilingualCard(): Promise<void> {
    try {
      console.log('Testing multilingual card fetch...');
      
      // Try to get a card from Base set in multiple languages
      const cardData = await tcgdxAPI.getCardMultilingual('base1', '1');
      
      const languages = Object.keys(cardData) as SupportedLanguage[];
      console.log('Languages tested:', languages);
      
      for (const lang of languages) {
        const card = cardData[lang];
        if (card) {
          console.log(`✓ ${lang.toUpperCase()}: ${card.name} (ID: ${card.id})`);
        } else {
          console.log(`✗ ${lang.toUpperCase()}: Not available`);
        }
      }
    } catch (error) {
      console.error('Multilingual test failed:', error);
    }
  }

  async enhanceExistingCardsWithMultilingual(limit: number = 50): Promise<void> {
    console.log(`Starting multilingual enhancement for up to ${limit} cards...`);
    
    // Get existing cards that don't have multilingual data yet
    const existingCards = await db
      .select({
        id: products.id,
        tcgId: products.tcgId,
        setId: products.setId,
        cardNumber: products.cardNumber,
        name: products.name,
        nameIt: products.nameIt,
        nameFr: products.nameFr
      })
      .from(products)
      .where(sql`${products.tcgId} IS NOT NULL AND (${products.nameFr} IS NULL OR ${products.nameDe} IS NULL)`)
      .limit(limit);

    console.log(`Found ${existingCards.length} cards to enhance with multilingual data.`);

    let enhanced = 0;
    for (const card of existingCards) {
      try {
        if (!card.tcgId || !card.setId || !card.cardNumber) {
          console.log(`Skipping card ${card.id}: missing TCG ID or set info`);
          continue;
        }

        console.log(`Enhancing card: ${card.name} (${card.tcgId})`);
        
        // Extract set ID and card local ID from tcgId (format: setId-cardNumber)
        const tcgIdParts = card.tcgId.split('-');
        if (tcgIdParts.length < 2) {
          console.log(`Skipping card ${card.id}: invalid TCG ID format`);
          continue;
        }
        
        const setId = tcgIdParts[0];
        const localId = tcgIdParts.slice(1).join('-');
        
        // Get multilingual data for this card
        const multilingualData = await tcgdxAPI.getCardMultilingual(setId, localId);
        
        // Prepare update data
        const updateData: any = {};
        
        if (multilingualData.fr?.name) updateData.nameFr = multilingualData.fr.name;
        if (multilingualData.de?.name) updateData.nameDe = multilingualData.de.name;
        if (multilingualData.es?.name) updateData.nameEs = multilingualData.es.name;
        if (multilingualData.pt?.name) updateData.namePt = multilingualData.pt.name;
        if (multilingualData.nl?.name) updateData.nameNl = multilingualData.nl.name;
        
        if (multilingualData.fr?.image) updateData.imageUrlFr = multilingualData.fr.image;
        if (multilingualData.de?.image) updateData.imageUrlDe = multilingualData.de.image;
        if (multilingualData.es?.image) updateData.imageUrlEs = multilingualData.es.image;
        if (multilingualData.pt?.image) updateData.imageUrlPt = multilingualData.pt.image;
        if (multilingualData.nl?.image) updateData.imageUrlNl = multilingualData.nl.image;

        // Update the card with multilingual data
        if (Object.keys(updateData).length > 0) {
          await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, card.id));
          
          enhanced++;
          console.log(`✓ Enhanced card ${card.id}: ${card.name} with ${Object.keys(updateData).length} fields`);
        } else {
          console.log(`No multilingual data found for card ${card.id}: ${card.name}`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error enhancing card ${card.id}:`, error);
      }
    }
    
    console.log(`✓ Multilingual enhancement completed! Enhanced ${enhanced} out of ${existingCards.length} cards.`);
  }

  async getCardWithAllLanguages(cardId: number): Promise<MultilingualCardData | null> {
    const card = await db
      .select()
      .from(products)
      .where(eq(products.id, cardId))
      .limit(1);

    if (card.length === 0) {
      return null;
    }

    const cardData = card[0];
    
    return {
      cardId: cardData.id,
      names: {
        en: cardData.name,
        it: cardData.nameIt,
        fr: cardData.nameFr,
        de: cardData.nameDe,
        es: cardData.nameEs,
        pt: cardData.namePt,
        nl: cardData.nameNl
      },
      images: {
        en: cardData.imageUrl,
        it: cardData.imageUrl, // Italian uses same image as English usually
        fr: cardData.imageUrlFr,
        de: cardData.imageUrlDe,
        es: cardData.imageUrlEs,
        pt: cardData.imageUrlPt,
        nl: cardData.imageUrlNl
      },
      descriptions: {
        en: cardData.description,
        it: cardData.descriptionIt,
        fr: cardData.descriptionFr,
        de: cardData.descriptionDe,
        es: cardData.descriptionEs,
        pt: cardData.descriptionPt,
        nl: cardData.descriptionNl
      }
    };
  }

  async getMultilingualStats(): Promise<{
    totalCards: number;
    cardsWithFrench: number;
    cardsWithGerman: number;
    cardsWithSpanish: number;
    cardsWithPortuguese: number;
    cardsWithDutch: number;
  }> {
    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        french: sql<number>`count(${products.nameFr})`,
        german: sql<number>`count(${products.nameDe})`,
        spanish: sql<number>`count(${products.nameEs})`,
        portuguese: sql<number>`count(${products.namePt})`,
        dutch: sql<number>`count(${products.nameNl})`
      })
      .from(products);

    return {
      totalCards: stats[0].total,
      cardsWithFrench: stats[0].french,
      cardsWithGerman: stats[0].german,
      cardsWithSpanish: stats[0].spanish,
      cardsWithPortuguese: stats[0].portuguese,
      cardsWithDutch: stats[0].dutch
    };
  }
}

export const multilingualSync = new MultilingualSync();