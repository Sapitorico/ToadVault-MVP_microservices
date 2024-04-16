import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/databases/db_connection';
import { Product } from 'src/entities/prodcut/prodcut.entity';
import * as Joi from 'joi';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProductProvider {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async addProduct(productData: any): Promise<{
    success: boolean;
    message?: string;
  }> {
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection('products');
    const product = await productsCollection.findOne({
      barcode: productData.barcode,
    });
    if (product) {
      return {
        success: false,
        message: 'Product with this barcode already exists',
      };
    }
    await productsCollection.insertOne(productData);
    return { success: true, message: 'Product added successfully' };
  }

  async getProdcuts(): Promise<{
    success: boolean;
    message: string;
    products: any[];
  }> {
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection('products');
    const products = await productsCollection.find().toArray();
    return {
      success: true,
      message: 'Products retrieved successfully',
      products: products,
    };
  }

  async updateProduct(
    id: string,
    productData: any,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!ObjectId.isValid(id)) {
      return {
        success: false,
        message: 'Invalid product ID',
      };
    }
    const db = this.databaseProvider.getDb();
    const productsCollection = db.collection('products');
    const product = await productsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!product) {
      return {
        success: false,
        message: 'Product not found',
      };
    }
    await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: productData },
    );
    return {
      success: true,
      message: 'Product updated successfully',
    };
  }

  validateProductData(productData: any): {
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
      description: Joi.string().required(),
      category_id: Joi.string().required(),
    });

    const { error } = schema.validate(productData);
    if (error) {
      return { success: false, message: error.details[0].message };
    }

    return { success: true };
  }
  instantiateProduct(productData: any): Product {
    const product = new Product(
      productData.barcode,
      productData.name,
      productData.description,
      productData.category_id,
      new Date(),
      new Date(),
      [],
    );

    return product;
  }
}
