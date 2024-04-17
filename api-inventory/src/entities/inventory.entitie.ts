import { ObjectId } from 'mongodb';

export interface InventoryData {
  _id?: ObjectId;
  barcode: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  supplier: string;
  created_at: Date;
  updated_at: Date;
  variants: Variant[];
}

/**
 * Represents an inventory item.
 *
 * @param barcode - The barcode of the item.
 * @param name - The name of the item.
 * @param description - The description of the item.
 * @param price - The price of the item.
 * @param stock - The stock quantity of the item.
 * @param supplier - The supplier of the item.
 * @param created_at - The date and time when the item was created.
 * @param updated_at - The date and time when the item was last updated.
 * @param variants - The variants of the item.
 */
export class Inventory implements InventoryData {
  constructor(
    public barcode: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public supplier: string,
    public created_at: Date,
    public updated_at: Date,
    public variants: Variant[],
  ) {}
}

export interface VariantData {
  name: string;
  price: number;
  stock: number;
}

export class Variant implements VariantData {
  constructor(
    public name: string,
    public price: number,
    public stock: number,
  ) {}
}
