import http from 'node:http'
import fs from 'fs'
import { logger } from '../../config/winston.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
import { UserModel } from '../../model/userModel.js'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    const ACCESS_TOKEN_SECRET = fs.readFileSync('/var/www/auth-service/keys/private.pem', 'utf8')
    try {
      logger.silly('Authenticating user', { body: req.body })

      const userDocument = await UserModel.authenticate(req.body.username, req.body.password)
      const user = userDocument.toObject()

      // Create the access token with the shorter lifespan.
      const accessToken = await JsonWebToken.encodeUser(user,
        ACCESS_TOKEN_SECRET, // privat
        process.env.ACCESS_TOKEN_LIFE
      )

      logger.silly('Authenticated user', { user })

      res
        .status(201)
        .json({
          access_token: accessToken
        })
    } catch (error) {
      // Authentication failed.
      const httpStatusCode = 401
      const err = new Error(http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error

      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      logger.silly('Creating new user document', { body: req.body })

      const { username, password, firstName, lastName, email } = req.body

      const userDocument = await UserModel.create({
        username,
        password,
        firstName,
        lastName,
        email
      })

      logger.silly('Created new user document')

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${userDocument.id}`
      )

      res
        .location(location.href)
        .status(201)
        .json({ id: userDocument.id })
    } catch (error) {
      let httpStatusCode = 500

      if (error.code === 11_000) {
        // Duplicated keys.
        httpStatusCode = 409
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        httpStatusCode = 400
      }

      const err = new Error(http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error

      next(err)
    }
  }
}
