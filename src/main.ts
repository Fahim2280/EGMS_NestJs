import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { join } from 'path';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Parse HTTP cookies
  app.use(cookieParser());

  // Attach user to res.locals for Handlebars template rendering
  const jwtService = app.get(JwtService);
  app.use((req: any, res: any, next: any) => {
    const token =
      req.cookies?.jwt_token ||
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      try {
        const decoded = jwtService.verify(token);
        req.user = decoded;
        res.locals.currentUser = decoded;
      } catch {
        // Token expired or invalid
      }
    }
    next();
  });

  const viewsPath = join(process.cwd(), 'views');
  const partialsPath = join(process.cwd(), 'views', 'partials');
  const publicPath = join(process.cwd(), 'public');

  // Configure Express MVC settings
  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });

  // Register Handlebars partials
  hbs.registerPartials(partialsPath);

  // Register Handlebars helpers
  hbs.registerHelper('eq', (a: any, b: any) => a === b);
  hbs.registerHelper('ne', (a: any, b: any) => a !== b);
  hbs.registerHelper('and', (a: any, b: any) => Boolean(a && b));
  hbs.registerHelper('or', (a: any, b: any) => Boolean(a || b));
  hbs.registerHelper('not', (a: any) => !a);
  hbs.registerHelper('json', (context: any) => JSON.stringify(context, null, 2));

  hbs.registerHelper('roleBadge', (role: string) => {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const label = isSuperAdmin ? 'Super Admin' : 'General Employee';
    const badgeClass = isSuperAdmin ? 'badge-admin' : 'badge-officer';
    return new (hbs as any).handlebars.SafeString(
      `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${label}</span>`,
    );
  });

  // Global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`=============================================================`);
  logger.log(`🚀 Company, Garage & Employee Management Portal running at http://localhost:${port}`);
  logger.log(`📊 Dashboard:     http://localhost:${port}/`);
  logger.log(`🏢 Garages:       http://localhost:${port}/garages`);
  logger.log(`👥 Employees:     http://localhost:${port}/employees`);
  logger.log(`🔐 Login:         http://localhost:${port}/login`);
  logger.log(`📝 Register:      http://localhost:${port}/register`);
  logger.log(`=============================================================`);
}


bootstrap();
