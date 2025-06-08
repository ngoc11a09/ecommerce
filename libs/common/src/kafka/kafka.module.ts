// libs/common/kafka/kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Partitioners } from 'kafkajs';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: config.get('KAFKA_CLIENT_ID') || 'default-client',
              brokers: [config.get('KAFKA_BROKER') || 'localhost:9092'],
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            consumer: {
              groupId: `${config.get('KAFKA_GROUP_ID') || 'default-consumer'}-${Date.now()}`,
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
  providers: [KafkaController],
})
export class KafkaModule {}
