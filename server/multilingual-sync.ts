// Multilingual synchronization service for Pokemon cards
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db.js";
import { products, collections } from "@shared/schema.js";
import { pokemonMultilingualAPI, type SupportedLanguage } from "./pokemon-multilingual-api.js";

interface MultilingualCardData {
  cardId: number;
  names: Record<SupportedLanguage, string | null>;
  images: Record<SupportedLanguage, string | null>;
  descriptions: Record<SupportedLanguage, string | null>;
}

class MultilingualSync {
  async testTCGdxConnection(): Promise<boolean> {
    try {
      console.log('Testing Pokemon multilingual API connection...');
      const connected = await pokemonMultilingualAPI.testConnection();
      if (connected) {
        console.log('✓ Pokemon TCG API connected successfully.');
        // Test basic translations
        const testTranslations = await pokemonMultilingualAPI.getCardMultilingualNames('Charizard');
        console.log('Sample translations for Charizard:', testTranslations);
        return true;
      } else {
        console.log('✗ Pokemon TCG API connection failed.');
        return false;
      }
    } catch (error) {
      console.error('✗ Connection test failed:', error);
      return false;
    }
  }

  async testMultilingualCard(): Promise<void> {
    try {
      console.log('Testing multilingual card translations...');
      
      // Test sample multilingual card
      const sampleCard = await pokemonMultilingualAPI.getSampleMultilingualCard();
      console.log('Sample multilingual card:', sampleCard);
      
      // Test translations for popular Pokemon
      const testPokemon = ['Pikachu', 'Charizard', 'Blastoise'];
      
      for (const pokemon of testPokemon) {
        const translations = await pokemonMultilingualAPI.getCardMultilingualNames(pokemon);
        console.log(`${pokemon} translations:`, translations);
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
        nameFr: products.nameFr,
        imageUrl: products.imageUrl
      })
      .from(products)
      .where(sql`${products.tcgId} IS NOT NULL AND ${products.language} = 'en' AND (${products.nameFr} IS NULL OR ${products.nameDe} IS NULL)`)
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
        
        // Get basic multilingual translations for this card
        const translations = await pokemonMultilingualAPI.enhanceCardWithBasicTranslations(card.name);
        
        // Prepare update data
        const updateData: any = {};
        
        if (translations.fr && translations.fr !== card.name) updateData.nameFr = translations.fr;
        if (translations.de && translations.de !== card.name) updateData.nameDe = translations.de;
        if (translations.es && translations.es !== card.name) updateData.nameEs = translations.es;
        if (translations.pt && translations.pt !== card.name) updateData.namePt = translations.pt;
        
        // For images, use the same image URL for now (European cards often use same artwork)
        if (card.imageUrl && translations.fr) updateData.imageUrlFr = card.imageUrl;
        if (card.imageUrl && translations.de) updateData.imageUrlDe = card.imageUrl;
        if (card.imageUrl && translations.es) updateData.imageUrlEs = card.imageUrl;
        if (card.imageUrl && translations.pt) updateData.imageUrlPt = card.imageUrl;

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
        
        // Small delay for processing
        await new Promise(resolve => setTimeout(resolve, 50));
        
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

      },
      images: {
        en: cardData.imageUrl,
        it: cardData.imageUrl, // Italian uses same image as English usually
        fr: cardData.imageUrlFr,
        de: cardData.imageUrlDe,
        es: cardData.imageUrlEs,
        pt: cardData.imageUrlPt,

      },
      descriptions: {
        en: cardData.description,
        it: cardData.descriptionIt,
        fr: cardData.descriptionFr,
        de: cardData.descriptionDe,
        es: cardData.descriptionEs,
        pt: cardData.descriptionPt,

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

      })
      .from(products);

    return {
      totalCards: stats[0].total,
      cardsWithFrench: stats[0].french,
      cardsWithGerman: stats[0].german,
      cardsWithSpanish: stats[0].spanish,
      cardsWithPortuguese: stats[0].portuguese,

    };
  }
}

export const multilingualSync = new MultilingualSync();