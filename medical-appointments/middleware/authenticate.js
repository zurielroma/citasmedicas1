const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    console.log('✅ Token decodificado:', decoded); // DEBUG
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token inválido' });
  }
};