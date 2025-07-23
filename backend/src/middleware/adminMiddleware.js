module.exports = (req, res, next) => {
    if (req.user.perfil !== 'admin') {
        return res.status(403).json({ error: 'Acesso restrito ao administrador' });
    }
    next();
};