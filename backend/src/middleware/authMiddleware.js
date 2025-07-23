const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário à requisição
        req.usuarioId = decoded.id; // <-- Adicione esta linha!
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};