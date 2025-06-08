import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('kafka')
export class KafkaController  implements OnModuleInit{
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {

  }

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('find_one_by');
    await this.kafkaClient.connect();
  }

}