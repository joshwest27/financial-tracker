import jwt from 'jsonwebtoken';

const jwtVerify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('unauthorized');
  }

  try {
    const [, token] = authHeader.split(' ');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).send('unauthorized');
  }
};

export default jwtVerify;
