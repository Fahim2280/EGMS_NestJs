import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
export declare class DashboardController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    renderDashboard(req: Request, res: Response): Promise<void>;
    setLanguage(locale: string, req: Request, res: Response): void;
    setTheme(mode: string, req: Request, res: Response): void;
}
