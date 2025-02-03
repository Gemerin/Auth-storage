import jwt from 'jsonwebtoken'
import fs from 'fs'

const PRIVATE_KEY = fs.readFileSync('/var/www/auth-service/keys/private.pem', 'utf8')

/**
 * Exposes methods for working with JSON Web Tokens (JWTs).
 */
export class JsonWebToken {
  /**
   * Encodes user information into a JSON Web Token (JWT) payload.
   *
   * @param {object} user - The user object containing user information to encode.
   * @param {string|number} expiresIn - The expiration time for the JWT, specified in seconds or as a string describing a time span (e.g., '1d', '2h') using the vercel/ms library.
   * @returns {Promise<string>} A Promise that resolves to the generated JWT.
   */
  static async encodeUser (user, expiresIn) {
    const payload = {
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username
    }

    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        PRIVATE_KEY,
        {
          algorithm: 'RS256',
          expiresIn: '1h'
        },
        (error, token) => {
          if (error) {
            reject(error)
            return
          }
          resolve(token)
        }
      )
    })
  }
}
