const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = auth;
