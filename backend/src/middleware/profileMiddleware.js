// Middleware para validar perfis específicos
const requireProfile = (profiles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.perfil) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const userProfile = req.user.perfil;
        const allowedProfiles = Array.isArray(profiles) ? profiles : [profiles];

        if (!allowedProfiles.includes(userProfile)) {
            return res.status(403).json({
                error: `Acesso negado. Perfil necessário: ${allowedProfiles.join(' ou ')}`
            });
        }

        next();
    };
};

// Middleware para verificar se é admin
const requireAdmin = requireProfile('admin');

// Middleware para verificar se é admin ou vendedor
const requireAdminOrVendedor = requireProfile(['admin', 'vendedor']);

// Middleware para verificar se o usuário está ativo
const requireActiveUser = (req, res, next) => {
    if (!req.user.ativo) {
        return res.status(403).json({ error: 'Usuário inativo' });
    }
    next();
};

// Middleware para verificar se o usuário pode acessar dados de outro usuário
const requireOwnerOrAdmin = (req, res, next) => {
    const requestedUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;
    const isAdmin = req.user.perfil === 'admin';

    if (requestedUserId !== currentUserId && !isAdmin) {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
};

module.exports = {
    requireProfile,
    requireAdmin,
    requireAdminOrVendedor,
    requireActiveUser,
    requireOwnerOrAdmin
};
