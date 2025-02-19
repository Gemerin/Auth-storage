import mongoose from 'mongoose'
import { logger } from './winston.js'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise<mongoose.Mongoose>} Resolves to a Mongoose instance if connection succeeded.
 */
export const connectToDatabase = async () => {
  const { connection } = mongoose
  const connectionString = process.env.DB_CONNECTION_STRING

  // Will cause errors to be produced instead of dropping the bad data.
  mongoose.set('strict', 'throw')

  // Turn on strict mode for query filters.
  mongoose.set('strictQuery', true)

  // Bind connection to events (to get notifications).
  connection.on('connected', () => logger.info('Mongoose connected to MongoDB.'))
  connection.on('error', (err) => logger.info(`Mongoose connection error: ${err}`))
  connection.on('disconnected', () => logger.info('Mongoose disconnected from MongoDB.'))

  // If the Node.js process ends, close the connection.
  for (const signalEvent of ['SIGINT', 'SIGTERM']) {
    process.on(signalEvent, () => {
      (async () => {
        await connection.close()
        logger.info(`Mongoose disconnected from MongoDB through ${signalEvent}.`)
        process.exit(0)
      })()
    })
  }

  // Connect to the server.
  logger.info('Mongoose connecting to MongoDB.')
  return mongoose.connect(connectionString)
}
