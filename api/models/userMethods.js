const bcrypt = require('bcryptjs');

/**
 * Compares the provided password with the user's password.
 *
 * @param {MongoUser} user - The user to compare the password for.
 * @param {string} candidatePassword - The password to test against the user's password.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the password matches.
 */
const comparePassword = async (user, candidatePassword) => {
  if (!user) {
    throw new Error('No user provided');
  }

  if (!user.password) {
    throw new Error('No password, likely an email first registered via Social/OIDC login');
  }

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        reject(err);
      }
      resolve(isMatch);
    });
  });
};

/**
 * Get all users for admin purposes (for sharing functionality)
 * @param {Object} [filters={}] - Optional filters to apply
 * @returns {Promise<Array<{id: string, email: string, name: string}>>} Array of user objects with basic info
 */
const getAllUsers = async function (filters = {}) {
  const query = User.find(filters);
  const users = await query.select('_id email name').lean();

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name || user.email.split('@')[0],
  }));
};

module.exports = {
  comparePassword,
  deleteUserById,
  generateToken,
  getUserById,
  updateUser,
  createUser,
  countUsers,
  findUser,
  getAllUsers, // Add the new function
};
