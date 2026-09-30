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
  resolveMessage,
  formatNumberWithLang,
  formatMoneyWithLang,
  formatDateWithLang,
  formatTimeWithLang,
  translateAuditDetails,
} from './infrastructure/i18n/i18n.service';
import { CurrentUserInterceptor } from './infrastructure/auth/current-user.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Determine root directory robustly (supports running from repo root or src/)
  const candidateDirs = [
    process.cwd(),
    join(process.cwd(), '..'),
    join(__dirname, '..'),
    join(__dirname, '../..'),
  ];
  const rootDir =
    candidateDirs.find((dir) => existsSync(join(dir, 'views'))) || process.cwd();

  // HTTPS SSL Configuration
  const defaultKeyPath = join(rootDir, 'certs', 'server.key');
  const defaultCertPath = join(rootDir, 'certs', 'server.crt');
  const keyPath = process.env.SSL_KEY_PATH || defaultKeyPath;
  const certPath = process.env.SSL_CERT_PATH || defaultCertPath;

  const wantsHttps =
    process.env.HTTPS !== 'false' &&
    (process.env.HTTPS === 'true' ||
      process.env.ENABLE_HTTPS === 'true' ||
      (existsSync(keyPath) && existsSync(certPath)));

  let httpsOptions: { key: Buffer; cert: Buffer } | undefined;
  if (wantsHttps) {
    if (existsSync(keyPath) && existsSync(certPath)) {
      httpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      };
      logger.log(`🔒 HTTPS mode active with certificate from ${certPath}`);
    } else {
      logger.warn(`⚠️ HTTPS requested but certificate files not found at ${keyPath} and ${certPath}`);
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    httpsOptions ? { httpsOptions } : {},
  );

  // Enable graceful shutdown hooks for container lifecycle (SIGTERM, SIGINT)
  app.enableShutdownHooks();

  // Trust reverse proxy (Nginx, Caddy, Cloudflare, AWS ALB) for correct req.ip and req.secure
  app.set('trust proxy', 1);

  // Disable X-Powered-By header to prevent fingerprinting
  app.disable('x-powered-by');

  // OWASP Production Security Headers
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (req.secure || req.headers['x-forwarded-proto'] === 'https' || wantsHttps) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Health check endpoint for uptime monitors, Docker HEALTHCHECK, and load balancers
  app.use('/health', (req: any, res: any) => {
    return res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

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

    // Parse notification / feedback messages from query or cookie
    const qSuccess = req.query?.success;
    const qError = req.query?.error;
    const qInfo = req.query?.info || req.query?.message;

    let flashType: 'success' | 'error' | 'info' | null = null;
    let rawMsg: string | null = null;

    if (qSuccess) {
      flashType = 'success';
      rawMsg = String(qSuccess);
    } else if (qError) {
      flashType = 'error';
      rawMsg = String(qError);
    } else if (qInfo) {
      flashType = 'info';
      rawMsg = String(qInfo);
    } else if (req.cookies?.flash_msg) {
      flashType = req.cookies?.flash_type || 'success';
      rawMsg = String(req.cookies.flash_msg);
      res.clearCookie('flash_msg');
      res.clearCookie('flash_type');
    }

    if (flashType && rawMsg) {
      const localizedMsg = resolveMessage(rawMsg, lang);
      res.locals.flash = {
        type: flashType,
        message: localizedMsg,
        isSuccess: flashType === 'success',
        isError: flashType === 'error',
        isInfo: flashType === 'info',
      };
      res.locals.toast = {
        type: flashType,
        message: localizedMsg,
      };
      if (flashType === 'success') {
        res.locals.successMessage = localizedMsg;
      } else if (flashType === 'error') {
        res.locals.error = localizedMsg;
      }
    }

    // Wrap res.render to auto-translate any controller-passed error or success messages
    const originalRender = res.render.bind(res);
    res.render = function (view: string, options?: any, callback?: any) {
      const opts = options || {};
      if (opts.error) {
        opts.error = resolveMessage(opts.error, lang);
      }
      if (opts.successMessage) {
        opts.successMessage = resolveMessage(opts.successMessage, lang);
      }
      if (opts.success) {
        opts.success = resolveMessage(opts.success, lang);
      }
      if (!opts.flash && res.locals.flash) {
        opts.flash = res.locals.flash;
      }
      if (!opts.toast && res.locals.toast) {
        opts.toast = res.locals.toast;
      }
      return originalRender(view, opts, callback);
    };

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
        } else {
          decoded.isSuperAdmin = false;
          if (!Array.isArray(decoded.garageIds)) {
            decoded.garageIds = [];
          }
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
  hbs.registerHelper('add', (a: any, b: any) => Number(a || 0) + Number(b || 0));
  hbs.registerHelper('subtract', (a: any, b: any) => Number(a) - Number(b));
  hbs.registerHelper('modulo', (a: any, b: any) => ((Math.abs(Number(a)) % Number(b)) + 1));
  hbs.registerHelper('concat', function (...args: any[]) {
    const values = args.slice(0, -1);
    return values.join('');
  });
  hbs.registerHelper('firstChar', function (str: any) {
    if (!str || typeof str !== 'string') return '';
    const trimmed = str.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase();
  });
  hbs.registerHelper('first', function (arr: any) {
    if (!arr) return '';
    if (Array.isArray(arr) && arr.length > 0) {
      const item = arr[0];
      if (item && typeof item === 'object') {
        return item.number || item.value || item.name || '';
      }
      return item;
    }
    return arr;
  });
  hbs.registerHelper('resolvePhones', function (phones: any, fallbackNum?: any) {
    if (Array.isArray(phones) && phones.length > 0) {
      const valid = phones.filter((p: any) => p && p.number && String(p.number).trim());
      if (valid.length > 0) return valid;
    }
    if (typeof phones === 'string' && phones.trim() && phones !== 'true' && phones !== 'false') {
      try {
        const parsed = JSON.parse(phones);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((p: any) => p && p.number && String(p.number).trim());
          if (valid.length > 0) return valid;
        }
      } catch {}
      return [{ number: phones.trim(), type: 'PRIMARY', isPrimary: true }];
    }
    if (fallbackNum && typeof fallbackNum === 'string' && fallbackNum.trim() && fallbackNum !== 'true' && fallbackNum !== 'false') {
      return [{ number: fallbackNum.trim(), type: 'PRIMARY', isPrimary: true }];
    }
    return [];
  });
  hbs.registerHelper('profilePicUrl', function (entity: any) {
    if (!entity) return null;
    if (typeof entity === 'string') return entity.trim() ? entity : null;
    if (entity.profilePicture) return entity.profilePicture;
    if (entity.photoUrl) return entity.photoUrl;

    const docs = Array.isArray(entity.documents) ? entity.documents : [];
    if (!docs || docs.length === 0) return null;

    // Look for document tagged as PHOTO or AVATAR or PROFILE
    const photo = docs.slice().reverse().find((d: any) => {
      if (!d) return false;
      const tag = (d.tag || '').toUpperCase();
      const isPhotoTag = tag === 'PHOTO' || tag === 'AVATAR' || tag === 'PROFILE';
      const isImg = (d.mimeType && d.mimeType.startsWith('image/')) ||
                    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.filePath || d.fileName || d.originalName || '');
      return isPhotoTag && isImg;
    });

    if (photo && photo.filePath) {
      return `/files/preview?path=${encodeURIComponent(photo.filePath)}&name=${encodeURIComponent(photo.fileName || photo.originalName || 'photo.jpg')}`;
    }

    // Fallback: any image document
    const anyImg = docs.slice().reverse().find((d: any) => {
      if (!d) return false;
      return (d.mimeType && d.mimeType.startsWith('image/')) ||
             /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.filePath || d.fileName || d.originalName || '');
    });

    if (anyImg && anyImg.filePath) {
      return `/files/preview?path=${encodeURIComponent(anyImg.filePath)}&name=${encodeURIComponent(anyImg.fileName || anyImg.originalName || 'photo.jpg')}`;
    }

    return null;
  });
  hbs.registerHelper('formatFileSize', function (bytes: any) {
    const num = Number(bytes);
    if (!num || num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  });
  hbs.registerHelper('fileIcon', function (mimeOrName: string) {
    const str = String(mimeOrName || '').toLowerCase();
    if (str.includes('pdf')) return '📕';
    if (str.includes('image') || str.includes('jpg') || str.includes('jpeg') || str.includes('png') || str.includes('webp') || str.includes('heic')) return '🖼️';
    if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv')) return '📊';
    if (str.includes('word') || str.includes('doc')) return '📄';
    return '📁';
  });

  // Translation & Numeral formatting helpers
  hbs.registerHelper('t', function (key: string, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return translate(key, lang);
  });

  hbs.registerHelper('resolveMsg', function (msg: string, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return resolveMessage(msg, lang);
  });

  hbs.registerHelper('bnNum', function (val: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatNumberWithLang(val, lang);
  });

  // bnMoney: always 2 decimal places — use for money, meter readings, unit amounts
  hbs.registerHelper('bnMoney', function (val: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatMoneyWithLang(val, lang);
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

  hbs.registerHelper('formatDate', function (date: any, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    return formatDateWithLang(date, lang);
  });

  hbs.registerHelper('roleBadge', function (role: string, options: any) {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const lang = options?.data?.root?.lang || 'en';
    const label = isSuperAdmin
      ? (lang === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin')
      : (lang === 'bn' ? 'সাধারণ কর্মকর্তা' : 'General Staff');
    const badgeClass = isSuperAdmin ? 'badge-admin' : 'badge-officer';
    return new (hbs as any).handlebars.SafeString(
      `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${label}</span>`,
    );
  });

  hbs.registerHelper('tAuditDetail', function (details: string, options: any) {
    const lang = options?.data?.root?.lang || (typeof options === 'string' ? options : 'en');
    return translateAuditDetails(details, lang as any);
  });

  hbs.registerHelper('auditActionBadge', function (action: string, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    const isBn = lang === 'bn';

    const badges: Record<string, { labelBn: string; labelEn: string; icon: string; bg: string; color: string; border: string }> = {
      CREATE: { labelBn: 'নতুন তৈরি', labelEn: 'CREATE', icon: '➕', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
      UPDATE: { labelBn: 'আপডেট', labelEn: 'UPDATE', icon: '✏️', bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
      DELETE: { labelBn: 'মুছে ফেলা', labelEn: 'DELETE', icon: '🗑️', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' },
      LOGIN: { labelBn: 'লগইন', labelEn: 'LOGIN', icon: '🔑', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
      LOGOUT: { labelBn: 'লগআউট', labelEn: 'LOGOUT', icon: '🚪', bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
      PERMISSIONS_UPDATE: { labelBn: 'পারমিশন', labelEn: 'PERMISSION', icon: '🛡️', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
      PASSWORD_RESET: { labelBn: 'রিসেট', labelEn: 'RESET', icon: '🔒', bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
    };

    const item = badges[action] || {
      labelBn: action,
      labelEn: action,
      icon: '⚡',
      bg: 'rgba(99, 102, 241, 0.15)',
      color: '#818cf8',
      border: 'rgba(99, 102, 241, 0.3)',
    };

    const mainLabel = isBn ? item.labelBn : item.labelEn;

    return new (hbs as any).handlebars.SafeString(
      `<span class="badge" style="background: ${item.bg}; color: ${item.color}; border: 1px solid ${item.border}; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>${item.icon}</span> <span>${mainLabel}</span>
      </span>`,
    );
  });

  hbs.registerHelper('auditEntityBadge', function (entityType: string, options: any) {
    const lang = options?.data?.root?.lang || 'en';
    const isBn = lang === 'bn';

    const entities: Record<string, { labelBn: string; labelEn: string; icon: string }> = {
      CUSTOMER: { labelBn: 'গ্রাহক', labelEn: 'Customer', icon: '👥' },
      ELECTRIC_BILL: { labelBn: 'বিদ্যুৎ বিল', labelEn: 'Electric Bill', icon: '⚡' },
      GARAGE: { labelBn: 'গ্যারেজ', labelEn: 'Garage', icon: '🏢' },
      EMPLOYEE: { labelBn: 'কর্মকর্তা', labelEn: 'Employee', icon: '🧑‍💼' },
      AUTH: { labelBn: 'নিরাপত্তা', labelEn: 'Auth', icon: '🔐' },
      COMPANY: { labelBn: 'কোম্পানি', labelEn: 'Company', icon: '🏛️' },
    };

    const item = entities[entityType] || { labelBn: entityType, labelEn: entityType, icon: '🏷️' };
    const mainLabel = isBn ? item.labelBn : item.labelEn;

    return new (hbs as any).handlebars.SafeString(
      `<span class="badge" style="background: rgba(99, 102, 241, 0.12); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.25); font-size: 0.74rem; font-weight: 600; padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>${item.icon}</span> <span>${mainLabel}</span>
      </span>`,
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
  const protocol = httpsOptions ? 'https' : 'http';
  logger.log(`=============================================================`);
  logger.log(`🚀 Company, Garage & Employee Management Portal running at ${protocol}://localhost:${port}`);
  logger.log(`📊 Dashboard:     ${protocol}://localhost:${port}/`);
  logger.log(`🏢 Garages:       ${protocol}://localhost:${port}/garages`);
  logger.log(`👥 Employees:     ${protocol}://localhost:${port}/employees`);
  logger.log(`🔐 Login:         ${protocol}://localhost:${port}/login`);
  logger.log(`📝 Register:      ${protocol}://localhost:${port}/register`);
  logger.log(`=============================================================`);
}


bootstrap();
