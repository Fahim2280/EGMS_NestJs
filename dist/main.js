"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const path_1 = require("path");
const fs_1 = require("fs");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const i18n_service_1 = require("./infrastructure/i18n/i18n.service");
const current_user_interceptor_1 = require("./infrastructure/auth/current-user.interceptor");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const candidateDirs = [
        process.cwd(),
        (0, path_1.join)(process.cwd(), '..'),
        (0, path_1.join)(__dirname, '..'),
        (0, path_1.join)(__dirname, '../..'),
    ];
    const rootDir = candidateDirs.find((dir) => (0, fs_1.existsSync)((0, path_1.join)(dir, 'views'))) || process.cwd();
    const defaultKeyPath = (0, path_1.join)(rootDir, 'certs', 'server.key');
    const defaultCertPath = (0, path_1.join)(rootDir, 'certs', 'server.crt');
    const keyPath = process.env.SSL_KEY_PATH || defaultKeyPath;
    const certPath = process.env.SSL_CERT_PATH || defaultCertPath;
    const wantsHttps = process.env.HTTPS !== 'false' &&
        (process.env.HTTPS === 'true' ||
            process.env.ENABLE_HTTPS === 'true' ||
            ((0, fs_1.existsSync)(keyPath) && (0, fs_1.existsSync)(certPath)));
    let httpsOptions;
    if (wantsHttps) {
        if ((0, fs_1.existsSync)(keyPath) && (0, fs_1.existsSync)(certPath)) {
            httpsOptions = {
                key: (0, fs_1.readFileSync)(keyPath),
                cert: (0, fs_1.readFileSync)(certPath),
            };
            logger.log(`🔒 HTTPS mode active with certificate from ${certPath}`);
        }
        else {
            logger.warn(`⚠️ HTTPS requested but certificate files not found at ${keyPath} and ${certPath}`);
        }
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, httpsOptions ? { httpsOptions } : {});
    app.enableShutdownHooks();
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use((req, res, next) => {
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
    app.use('/health', (req, res) => {
        return res.status(200).json({
            status: 'ok',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        });
    });
    app.use(cookieParser());
    app.use((req, res, next) => {
        if (req.url && req.url.startsWith('/.well-known/appspecific/com.chrome.devtools.json')) {
            return res.status(204).end();
        }
        next();
    });
    const jwtService = app.get(jwt_1.JwtService);
    app.use((req, res, next) => {
        const lang = req.cookies?.lang === 'bn' ? 'bn' : 'en';
        const theme = req.cookies?.theme === 'light' ? 'light' : 'dark';
        res.locals.lang = lang;
        res.locals.isBn = lang === 'bn';
        res.locals.isEn = lang === 'en';
        res.locals.theme = theme;
        res.locals.isLight = theme === 'light';
        res.locals.isDark = theme === 'dark';
        const qSuccess = req.query?.success;
        const qError = req.query?.error;
        const qInfo = req.query?.info || req.query?.message;
        let flashType = null;
        let rawMsg = null;
        if (qSuccess) {
            flashType = 'success';
            rawMsg = String(qSuccess);
        }
        else if (qError) {
            flashType = 'error';
            rawMsg = String(qError);
        }
        else if (qInfo) {
            flashType = 'info';
            rawMsg = String(qInfo);
        }
        else if (req.cookies?.flash_msg) {
            flashType = req.cookies?.flash_type || 'success';
            rawMsg = String(req.cookies.flash_msg);
            res.clearCookie('flash_msg');
            res.clearCookie('flash_type');
        }
        if (flashType && rawMsg) {
            const localizedMsg = (0, i18n_service_1.resolveMessage)(rawMsg, lang);
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
            }
            else if (flashType === 'error') {
                res.locals.error = localizedMsg;
            }
        }
        const originalRender = res.render.bind(res);
        res.render = function (view, options, callback) {
            const opts = options || {};
            if (opts.error) {
                opts.error = (0, i18n_service_1.resolveMessage)(opts.error, lang);
            }
            if (opts.successMessage) {
                opts.successMessage = (0, i18n_service_1.resolveMessage)(opts.successMessage, lang);
            }
            if (opts.success) {
                opts.success = (0, i18n_service_1.resolveMessage)(opts.success, lang);
            }
            if (!opts.flash && res.locals.flash) {
                opts.flash = res.locals.flash;
            }
            if (!opts.toast && res.locals.toast) {
                opts.toast = res.locals.toast;
            }
            return originalRender(view, opts, callback);
        };
        const token = req.cookies?.jwt_token ||
            req.cookies?.jwt ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null);
        if (token) {
            try {
                const decoded = jwtService.verify(token);
                if (decoded.role === 'SUPER_ADMIN' ||
                    decoded.isSuperAdmin ||
                    decoded.role?.toUpperCase() === 'SUPER_ADMIN') {
                    decoded.role = 'SUPER_ADMIN';
                    decoded.isSuperAdmin = true;
                    decoded.canCreate = true;
                    decoded.canEdit = true;
                    decoded.canDelete = true;
                    decoded.canView = true;
                    decoded.garageIds = null;
                }
                else {
                    decoded.isSuperAdmin = false;
                    if (!Array.isArray(decoded.garageIds)) {
                        decoded.garageIds = [];
                    }
                }
                req.user = decoded;
                res.locals.currentUser = decoded;
                res.locals.isSuperAdmin = Boolean(decoded.isSuperAdmin);
            }
            catch {
            }
        }
        next();
    });
    const viewsPath = (0, path_1.join)(rootDir, 'views');
    const partialsPath = (0, path_1.join)(rootDir, 'views', 'partials');
    const publicPath = (0, path_1.join)(rootDir, 'public');
    app.useStaticAssets(publicPath);
    app.setBaseViewsDir(viewsPath);
    app.setViewEngine('hbs');
    app.set('view options', { layout: 'layouts/main' });
    if ((0, fs_1.existsSync)(partialsPath)) {
        const files = (0, fs_1.readdirSync)(partialsPath);
        for (const file of files) {
            if (file.endsWith('.hbs') || file.endsWith('.html')) {
                const partialName = file.replace(/\.(hbs|html)$/, '');
                const partialContent = (0, fs_1.readFileSync)((0, path_1.join)(partialsPath, file), 'utf8');
                hbs.registerPartial(partialName, partialContent);
                hbs.registerPartial(partialName.replace(/-/g, '_'), partialContent);
                hbs.registerPartial(partialName.replace(/_/g, '-'), partialContent);
            }
        }
    }
    hbs.registerPartials(partialsPath);
    hbs.registerHelper('eq', (a, b) => a === b);
    hbs.registerHelper('ne', (a, b) => a !== b);
    hbs.registerHelper('gt', (a, b) => Number(a) > Number(b));
    hbs.registerHelper('gte', (a, b) => Number(a) >= Number(b));
    hbs.registerHelper('lt', (a, b) => Number(a) < Number(b));
    hbs.registerHelper('lte', (a, b) => Number(a) <= Number(b));
    hbs.registerHelper('and', function (...args) {
        const values = args.slice(0, -1);
        return values.every((val) => Boolean(val));
    });
    hbs.registerHelper('or', function (...args) {
        const values = args.slice(0, -1);
        return values.some((val) => Boolean(val));
    });
    hbs.registerHelper('not', (a) => !a);
    hbs.registerHelper('json', (context) => JSON.stringify(context, null, 2));
    hbs.registerHelper('includes', (arr, val) => {
        if (!arr)
            return false;
        if (Array.isArray(arr)) {
            return arr.includes(val);
        }
        return false;
    });
    hbs.registerHelper('add', (a, b) => Number(a || 0) + Number(b || 0));
    hbs.registerHelper('subtract', (a, b) => Number(a) - Number(b));
    hbs.registerHelper('modulo', (a, b) => ((Math.abs(Number(a)) % Number(b)) + 1));
    hbs.registerHelper('concat', function (...args) {
        const values = args.slice(0, -1);
        return values.join('');
    });
    hbs.registerHelper('firstChar', function (str) {
        if (!str || typeof str !== 'string')
            return '';
        const trimmed = str.trim();
        if (!trimmed)
            return '';
        return trimmed.charAt(0).toUpperCase();
    });
    hbs.registerHelper('first', function (arr) {
        if (!arr)
            return '';
        if (Array.isArray(arr) && arr.length > 0) {
            const item = arr[0];
            if (item && typeof item === 'object') {
                return item.number || item.value || item.name || '';
            }
            return item;
        }
        return arr;
    });
    hbs.registerHelper('resolvePhones', function (phones, fallbackNum) {
        if (Array.isArray(phones) && phones.length > 0) {
            const valid = phones.filter((p) => p && p.number && String(p.number).trim());
            if (valid.length > 0)
                return valid;
        }
        if (typeof phones === 'string' && phones.trim() && phones !== 'true' && phones !== 'false') {
            try {
                const parsed = JSON.parse(phones);
                if (Array.isArray(parsed)) {
                    const valid = parsed.filter((p) => p && p.number && String(p.number).trim());
                    if (valid.length > 0)
                        return valid;
                }
            }
            catch { }
            return [{ number: phones.trim(), type: 'PRIMARY', isPrimary: true }];
        }
        if (fallbackNum && typeof fallbackNum === 'string' && fallbackNum.trim() && fallbackNum !== 'true' && fallbackNum !== 'false') {
            return [{ number: fallbackNum.trim(), type: 'PRIMARY', isPrimary: true }];
        }
        return [];
    });
    hbs.registerHelper('profilePicUrl', function (entity) {
        if (!entity)
            return null;
        if (typeof entity === 'string')
            return entity.trim() ? entity : null;
        if (entity.profilePicture)
            return entity.profilePicture;
        if (entity.photoUrl)
            return entity.photoUrl;
        const docs = Array.isArray(entity.documents) ? entity.documents : [];
        if (!docs || docs.length === 0)
            return null;
        const photo = docs.slice().reverse().find((d) => {
            if (!d)
                return false;
            const tag = (d.tag || '').toUpperCase();
            const isPhotoTag = tag === 'PHOTO' || tag === 'AVATAR' || tag === 'PROFILE';
            const isImg = (d.mimeType && d.mimeType.startsWith('image/')) ||
                /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.filePath || d.fileName || d.originalName || '');
            return isPhotoTag && isImg;
        });
        if (photo && photo.filePath) {
            return `/files/preview?path=${encodeURIComponent(photo.filePath)}&name=${encodeURIComponent(photo.fileName || photo.originalName || 'photo.jpg')}`;
        }
        const anyImg = docs.slice().reverse().find((d) => {
            if (!d)
                return false;
            return (d.mimeType && d.mimeType.startsWith('image/')) ||
                /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(d.filePath || d.fileName || d.originalName || '');
        });
        if (anyImg && anyImg.filePath) {
            return `/files/preview?path=${encodeURIComponent(anyImg.filePath)}&name=${encodeURIComponent(anyImg.fileName || anyImg.originalName || 'photo.jpg')}`;
        }
        return null;
    });
    hbs.registerHelper('formatFileSize', function (bytes) {
        const num = Number(bytes);
        if (!num || num === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(num) / Math.log(k));
        return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    });
    hbs.registerHelper('fileIcon', function (mimeOrName) {
        const str = String(mimeOrName || '').toLowerCase();
        if (str.includes('pdf'))
            return '📕';
        if (str.includes('image') || str.includes('jpg') || str.includes('jpeg') || str.includes('png') || str.includes('webp') || str.includes('heic'))
            return '🖼️';
        if (str.includes('sheet') || str.includes('excel') || str.includes('xls') || str.includes('csv'))
            return '📊';
        if (str.includes('word') || str.includes('doc'))
            return '📄';
        return '📁';
    });
    hbs.registerHelper('t', function (key, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.translate)(key, lang);
    });
    hbs.registerHelper('resolveMsg', function (msg, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.resolveMessage)(msg, lang);
    });
    hbs.registerHelper('bnNum', function (val, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.formatNumberWithLang)(val, lang);
    });
    hbs.registerHelper('bnMoney', function (val, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.formatMoneyWithLang)(val, lang);
    });
    hbs.registerHelper('tDate', function (date, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.formatDateWithLang)(date, lang);
    });
    hbs.registerHelper('tTime', function (date, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.formatTimeWithLang)(date, lang);
    });
    hbs.registerHelper('deviceChip', (ua) => {
        if (!ua)
            return '🌐 Web Client';
        if (ua.includes('iPhone'))
            return '📱 iPhone';
        if (ua.includes('iPad'))
            return '📱 iPad';
        if (ua.includes('Android'))
            return '📱 Android';
        if (ua.includes('Windows'))
            return '💻 Windows';
        if (ua.includes('Macintosh') || ua.includes('Mac OS'))
            return '💻 Mac';
        if (ua.includes('Linux'))
            return '💻 Linux';
        if (ua.includes('Chrome'))
            return '🌐 Chrome';
        if (ua.includes('Firefox'))
            return '🌐 Firefox';
        if (ua.includes('Safari'))
            return '🌐 Safari';
        return '🌐 Web Client';
    });
    hbs.registerHelper('formatDate', function (date, options) {
        const lang = options?.data?.root?.lang || 'en';
        return (0, i18n_service_1.formatDateWithLang)(date, lang);
    });
    hbs.registerHelper('roleBadge', function (role, options) {
        const isSuperAdmin = role === 'SUPER_ADMIN';
        const lang = options?.data?.root?.lang || 'en';
        const label = isSuperAdmin
            ? (lang === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin')
            : (lang === 'bn' ? 'সাধারণ কর্মকর্তা' : 'General Staff');
        const badgeClass = isSuperAdmin ? 'badge-admin' : 'badge-officer';
        return new hbs.handlebars.SafeString(`<span class="badge ${badgeClass}"><span class="badge-dot"></span>${label}</span>`);
    });
    hbs.registerHelper('tAuditDetail', function (details, options) {
        const lang = options?.data?.root?.lang || (typeof options === 'string' ? options : 'en');
        return (0, i18n_service_1.translateAuditDetails)(details, lang);
    });
    hbs.registerHelper('auditActionBadge', function (action, options) {
        const lang = options?.data?.root?.lang || 'en';
        const isBn = lang === 'bn';
        const badges = {
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
        return new hbs.handlebars.SafeString(`<span class="badge" style="background: ${item.bg}; color: ${item.color}; border: 1px solid ${item.border}; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>${item.icon}</span> <span>${mainLabel}</span>
      </span>`);
    });
    hbs.registerHelper('auditEntityBadge', function (entityType, options) {
        const lang = options?.data?.root?.lang || 'en';
        const isBn = lang === 'bn';
        const entities = {
            CUSTOMER: { labelBn: 'গ্রাহক', labelEn: 'Customer', icon: '👥' },
            ELECTRIC_BILL: { labelBn: 'বিদ্যুৎ বিল', labelEn: 'Electric Bill', icon: '⚡' },
            GARAGE: { labelBn: 'গ্যারেজ', labelEn: 'Garage', icon: '🏢' },
            EMPLOYEE: { labelBn: 'কর্মকর্তা', labelEn: 'Employee', icon: '🧑‍💼' },
            AUTH: { labelBn: 'নিরাপত্তা', labelEn: 'Auth', icon: '🔐' },
            COMPANY: { labelBn: 'কোম্পানি', labelEn: 'Company', icon: '🏛️' },
        };
        const item = entities[entityType] || { labelBn: entityType, labelEn: entityType, icon: '🏷️' };
        const mainLabel = isBn ? item.labelBn : item.labelEn;
        return new hbs.handlebars.SafeString(`<span class="badge" style="background: rgba(99, 102, 241, 0.12); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.25); font-size: 0.74rem; font-weight: 600; padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
        <span>${item.icon}</span> <span>${mainLabel}</span>
      </span>`);
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
    }));
    app.useGlobalInterceptors(new current_user_interceptor_1.CurrentUserInterceptor());
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
//# sourceMappingURL=main.js.map