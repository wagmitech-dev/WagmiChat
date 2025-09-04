const { logger } = require('@librechat/data-schemas');
const { isEmailWhitelisted } = require('~/server/services/emailWhitelist');
const { isEmailDomainAllowed } = require('~/server/services/domains');
const { getAppConfig } = require('~/server/services/Config');

/**
 * Checks if the user's email is whitelisted for social login
 *
 * @async
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware function.
 *
 * @returns {Promise<function|Object>} - Returns a Promise which when resolved calls next middleware if the email is whitelisted
 */
const checkEmailWhitelisted = async (req, res, next = () => {}) => {
  const email = req?.user?.email;
  const appConfig = await getAppConfig({
    role: req?.user?.role,
  });
  
  // Check both email whitelist (custom feature) and domain restrictions (upstream)
  const isWhitelisted = await isEmailWhitelisted(email);
  const isDomainAllowed = isEmailDomainAllowed(email, appConfig?.registration?.allowedDomains);
  
  if (email && !isWhitelisted && !isDomainAllowed) {
    logger.error(`[Social Login] [Email not whitelisted/domain not allowed] [Email: ${email}]`);
    return res.redirect('/login?error=email_not_whitelisted');
  } else {
    return next();
  }
};

module.exports = checkEmailWhitelisted;
