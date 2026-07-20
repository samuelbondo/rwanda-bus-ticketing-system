import { Request, Response } from 'express'
import * as auditService from '../services/audit.service.js'

export async function getAuditLogs(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)
  const result = await auditService.getAuditLogs(page, limit)
  res.json({ data: result.logs, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages })
}
