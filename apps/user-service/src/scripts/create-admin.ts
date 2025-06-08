import { UserServiceService } from '../user-service.service';
import { Role } from '@app/common/constants/roles.constant';
import * as bcrypt from 'bcrypt';
import { UserServiceModule } from '../user-service.module';
import { NestFactory } from '@nestjs/core';
import { randomUUID } from 'crypto';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(UserServiceModule);

  const userService = app.get(UserServiceService);

  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || '123456';
  const name = process.env.ADMIN_NAME || 'Super Admin';

  const exists = await userService.findByEmail(email);
  if (exists) {
    console.log('Error: Admin already exists');
    return process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const newAdmin = await userService.create({
    id: randomUUID(),
    email,
    password: hash,
    name,
    roles: [Role.ADMIN],
  });

  console.log('Admin created:', newAdmin.email);
  console.log('Admin password:', password);
  process.exit(0);
}

bootstrap();
