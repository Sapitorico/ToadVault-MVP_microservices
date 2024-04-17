import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/databases/db_connection';
import { Inventory, InventoryData } from 'src/entities/inventory.entitie';
import * as Joi from 'joi';
import { ObjectId } from 'mongodb';

/**
 * InventoryProvider class handles the management of inventory items in a store.
 * It provides methods for adding, retrieving, and validating inventory items.
 * The class relies on a DatabaseProvider instance for database operations.
 */
@Injectable()
export class InventoryProvider {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  /**
   * Adds an item to the inventory of a specific store.
   *
   * @param storeId - The ID of the store where the item will be added.
   * @param itemData - The data of the item to be added.
   * @returns A promise that resolves to an object with the following properties:
   *   - success: A boolean indicating if the item was added successfully.
   *   - message: An optional string message indicating the result of the operation.
   */
  async addItem(
    storeId: string,
    itemData: Inventory,
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection(`inventory_store_${storeId}`);
    const product = await productsCollection.findOne({
      barcode: itemData.barcode,
    });
    if (!product) {
      await productsCollection.insertOne(itemData);
    } else {
      await productsCollection.updateOne(
        { barcode: itemData.barcode },
        { $inc: { stock: itemData.stock } },
      );
    }
    return { success: true, message: 'Item added successfully' };
  }

  /**
   * Retrieves the inventory of a specific store.
   *
   * @param storeId - The ID of the store to retrieve the inventory from.
   * @returns A promise that resolves to an object with the following properties:
   *   - success: A boolean indicating if the inventory retrieval was successful.
   *   - message: A string message indicating the result of the operation.
   *   - products: An array of InventoryData objects representing the products in the inventory.
   */
  async getInventory(storeId: string): Promise<{
    success: boolean;
    message: string;
    products: InventoryData[];
  }> {
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection(`inventory_store_${storeId}`);
    const products = await productsCollection.find().toArray();
    return {
      success: true,
      message: 'Items retrieved successfully',
      products: products as InventoryData[],
    };
  }

  /**
   * Retrieves an item from the inventory of a specific store based on its barcode or ID.
   *
   * @param storeId - The ID of the store where the item is located.
   * @param barcode_id - The barcode or ID of the item to retrieve.
   * @returns A promise that resolves to an object with the following properties:
   *   - success: A boolean indicating if the item retrieval was successful.
   *   - message: A string message indicating the result of the operation.
   *   - product: An optional InventoryData object representing the retrieved item.
   */
  async getItemByBarcodeOrID(
    storeId: string,
    barcode_id: string,
  ): Promise<{
    success: boolean;
    message: string;
    product?: InventoryData;
  }> {
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection(`inventory_store_${storeId}`);
    if (!ObjectId.isValid(barcode_id)) {
      const product = await productsCollection.findOne({
        barcode: barcode_id,
      });
      if (!product) {
        return {
          success: false,
          message: 'Item not found',
        };
      }
      return {
        success: true,
        message: 'Item retrieved successfully',
        product: { ...product } as InventoryData,
      };
    }
    const product = await productsCollection.findOne({
      _id: new ObjectId(barcode_id),
    });
    if (!product) {
      return {
        success: false,
        message: 'Item not found',
      };
    }
    return {
      success: true,
      message: 'Item retrieved successfully',
      product: { ...product } as InventoryData,
    };
  }

  /**
   * Validates the store information.
   *
   * @param storeInfo - The store information to be validated.
   * @returns An object with the following properties:
   *   - success: A boolean indicating if the validation was successful.
   *   - message: An optional string message indicating the result of the validation.
   */
  validateStore(storeInfo: InventoryData): {
    success: boolean;
    message?: string;
  } {
    const schema = Joi.object({
      store_id: Joi.string()
        .pattern(/^\d+$/)
        .messages({
          'string.pattern.base': "'store_id' must be a string of numbers",
        })
        .required(),
    });
    const { error } = schema.validate(storeInfo);
    if (error) {
      return { success: false, message: error.details[0].message };
    }
    return { success: true };
  }

  /**
   * Validates the item data.
   *
   * @param itemData - The item data to be validated.
   * @returns An object with the following properties:
   *   - success: A boolean indicating if the validation was successful.
   *   - message: An optional string message indicating the result of the validation.
   */
  validateItemData(itemData: InventoryData): {
    success: boolean;
    message?: string;
  } {
    const schema = Joi.object({
      barcode: Joi.string()
        .pattern(/^\d+$/)
        .messages({
          'string.pattern.base': "'barcode' must be a string of numbers",
        })
        .required(),
      name: Joi.string().required(),
      description: Joi.string().allow(''),
      price: Joi.number().required(),
      stock: Joi.number().required(),
      supplier: Joi.string().allow(''),
      variants: Joi.array()
        .items(Joi.object({ name: Joi.string().required() }))
        .min(0),
    });

    const { error } = schema.validate(itemData);
    if (error) {
      return { success: false, message: error.details[0].message };
    }

    return { success: true };
  }

  /**
   * Instantiates an item object based on the provided item data.
   *
   * @param ItemData - The item data used to create the item object.
   * @returns An instance of the Inventory class representing the item.
   */
  instantiateItem(ItemData: InventoryData): Inventory {
    const item = new Inventory(
      ItemData.barcode,
      ItemData.name,
      ItemData.description,
      ItemData.price,
      ItemData.stock,
      ItemData.supplier,
      new Date(),
      new Date(),
      ItemData.variants,
    );

    return item;
  }
}
