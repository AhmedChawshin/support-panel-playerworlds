import { authMiddleware } from '../../../utils/middleware';
import { createTicket } from './handlers/createTicket';
import { getTickets } from './handlers/getTickets';
import { updateTicket } from './handlers/updateTicket';

export const POST = authMiddleware(createTicket);
export const GET = authMiddleware(getTickets);
export const PUT = authMiddleware(updateTicket);