import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import * as hbs from 'hbs';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import {
  translate,
  formatNumberWithLang,
  formatDateWithLang,
  formatTimeWithLang,
} from './infrastructure/i18n/i18n.service';
import { CurrentUserInterceptor } from './infrastructure/auth/current-user.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Parse HTTP cookies
  app.use(cookieParser());

  // Handle Chrome DevTools well-known probe cleanly without 404 error noise
  app.use((req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/.well-known/appspecific/com.chrome.devtools.json')) {
      return res.status(204).end();
    }
    next();
  });

  // Attach user, language, and theme to res.locals for Handlebars template rendering
  const jwtService = app.get(JwtService);
  app.use((req: any, res: any, next: any) => {
    const lang: 'en' | 'bn' = req.cookies?.lang === 'bn' ? 'bn' : 'en';
    const theme: 'dark' | 'light' = req.cookies?.theme === 'light' ? 'light' : 'dark';

    res.locals.lang = lang;
    res.locals.isBn = lang === 'bn';
    res.locals.isEn = lang === 'en';
    res.locals.theme = theme;
    res.locals.isLight = theme === 'light';
    res.locals.isDark = theme === 'dark';

    const token =
      req.cookies?.jwt_token ||
      req.cookies?.jwt ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      try {
        const decoded = jwtService.verify(token);
        if (
          decoded.role === 'SUPER_ADMIN' ||
          decoded.isSuperAdmin ||
          decoded.role?.toUpperCase() === 'SUPER_ADMIN'
        ) {
          decoded.role = 'SUPER_ADMIN';
          decoded.isSuperAdmin = true;
          decoded.canCreate = true;
          decoded.canEdit = true;
          decoded.canDelete = true;
          decoded.canView = true;
          decoded.garageIds = null;
        }
        req.user = decoded;
        res.locals.currentUser = decoded;
        res.locals.isSuperAdmin = Boolean(decoded.isSuperAdmin);
      } catch {
        // Token expired or invalid
      }
    }
    next();
  });

  // Determine root directory robustly (supports running from repo root or src/)
  const candidateDirs = [
    process.cwd(),
    join(process.cwd(), '..'),
    join(__dirname, '..'),
    join(__dirname, '../..'),
  ];
  const rootDir =
    candidateDirs.find((dir) => existsSync(join(dir, 'views'))) || process.cwd();

  const viewsPath = join(rootDir, 'views');
  const partialsPath = join(rootDir, 'views', 'partials');
  const publicPath = join(rootDir, 'public');

  // Configure Express MVC settings
  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });

  // Synchronously register all partials with exact, hyphenated, and underscored aliases
  if (existsSync(partialsPath)) {
    const files = readdirSync(partialsPath);
    for (const file of files) {
      if (file.endsWith('.hbs') || file.endsWith('.html')) {
        const partialName = file.replace(/\.(hbs|html)$/, '');
        const partialContent = readFileSync(join(partialsPath, file), 'utf8');
        hbs.registerPartial(partialName, partialContent);
        hbs.registerPartial(partialName.replace(/-/g, '_'), partialContent);
        hbs.registerPartial(partialName.replace(/_/g, '-'), partialContent);
      }
    }
  }

  // Also register with hbs default walker
  hbs.registerPartials(partialsPath);

  // Register Handlebars helpers
  hbs.registerHelper('eq', (a: any, b: any) => a === b);
  hbs.registerHelper('ne', (a: any, b: any) => a !== b);
  hbs.registerHelper('gt', (a: any, b: any) => Number(a) > Number(b));
  hbs.registerHelper('gte', (a: any, b: any) => Number(a) >= Number(b));
  hbs.registerHelper('lt', (a: any, b: any) => Number(a) < Number(b));
  hbs.registerHelper('lte', (a: any, b: any) => Number(a) <= Number(b));
  hbs.registerHelper('and', function (...args: any[]) {
    const values = args.slice(0, -1);
    return values.every((val) => Boolean(val));
  });
  hbs.registerHelper('or', function (...args: any[]) {
    const values = args.slice(0, -1);
    return values.some((val) => Boolean(val));
  });
  hbs.registerHelper('not', (a: any) => !a);
  hbs.registerHelper('json', (context: any) => JSON.stringify(context, null, 2));
  hbs.registerHelper('includes', (arr: any, val: any) => {
    if (!arr) return false;
    if (Array.isArray(arr)) {
      return arr.includes(val);
    }
    return false;
  });

  // Translation & Numeral formatting helpers
  hbs.registerHelper('t', function (key: string, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return translate(key, lang);
  });

  hbs.registerHelper('bnNum', function (val: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatNumberWithLang(val, lang);
  });

  hbs.registerHelper('tDate', function (date: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatDateWithLang(date, lang);
  });

  hbs.registerHelper('tTime', function (date: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatTimeWithLang(date, lang);
  });

  hbs.registerHelper('deviceChip', (ua: string) => {
    if (!ua) return '🌐 Web Client';
    if (ua.includes('iPhone')) return '📱 iPhone';
    if (ua.includes('iPad')) return '📱 iPad';
    if (ua.includes('Android')) return '📱 Android';
    if (ua.includes('Windows')) return '💻 Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) return '💻 Mac';
    if (ua.includes('Linux')) return '💻 Linux';
    if (ua.includes('Chrome')) return '🌐 Chrome';
    if (ua.includes('Firefox')) return '🌐 Firefox';
    if (ua.includes('Safari')) return '🌐 Safari';
    return '🌐 Web Client';
  });

  hbs.registerHelper('formatDate', (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? 'N/A' : d.toISOString().split('T')[0];
    } catch {
      return String(date);
    }
  });

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

  // Global interceptor to synchronize req.user to res.locals.currentUser for Handlebars
  app.useGlobalInterceptors(new CurrentUserInterceptor());

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
