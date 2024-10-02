import pino from "pino";
import pretty from 'pino-pretty'
import { format } from "date-fns"


export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    },
    timestamp: () => `,"time":"${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}"`
})
