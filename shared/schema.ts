import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  language: text("language").notNull().default("en"),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameIt: text("name_it"),
  description: text("description"),
  descriptionIt: text("description_it"),
  imageUrl: text("image_url"),
  releaseDate: timestamp("release_date"),
});

export const productTypes = pgTable("product_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameIt: text("name_it"),
  description: text("description"),
  descriptionIt: text("description_it"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  tcgId: text("tcg_id").unique(), // ID from Pokemon TCG API
  name: text("name").notNull(),
  nameIt: text("name_it"),
  description: text("description"),
  descriptionIt: text("description_it"),
  collectionId: integer("collection_id").references(() => collections.id),
  productTypeId: integer("product_type_id").references(() => productTypes.id),
  cardNumber: text("card_number"),
  rarity: text("rarity"),
  language: text("language").notNull(),
  imageUrl: text("image_url"),
  imageUrlLarge: text("image_url_large"),
  setName: text("set_name"),
  setId: text("set_id"),
  artist: text("artist"),
  hp: text("hp"),
  types: jsonb("types"), // Pokemon types
  prices: jsonb("prices"), // Store price data from different sources
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userCollections = pgTable("user_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").default(1),
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  publishedAt: true,
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
});

export const insertProductTypeSchema = createInsertSchema(productTypes).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertUserCollectionSchema = createInsertSchema(userCollections).omit({
  id: true,
  addedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type ProductType = typeof productTypes.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertUserCollection = z.infer<typeof insertUserCollectionSchema>;
export type UserCollection = typeof userCollections.$inferSelect;
