import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ProductModule } from './product.module';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: process.env.CLIENT_ID,
          brokers: [process.env.BROKER],
        },
        consumer: {
          groupId: process.env.GROUP_ID,
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
