import { UserServiceService } from '../user-service.service';
import * as bcrypt from 'bcrypt';
import { UserServiceModule } from '../user-service.module';
import { NestFactory } from '@nestjs/core';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(UserServiceModule);

  const userService = app.get(UserServiceService);

  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || '123456';

  const exists = await userService.findOneBy({ email });
  if (exists) {
    console.log('Error: Admin already exists');
    return process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);

  const newAdmin = await userService.createAdmin({
    email,
    password: hash,
    isAdmin: true,
  });

  console.log('Admin created:', newAdmin.email);
  console.log('Admin password:', password);
  process.exit(0);
}

bootstrap();
