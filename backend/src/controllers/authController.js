const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    try {
        const user = await Usuario.findOne({ where: { usuario } });

        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }

        // Atualiza o último acesso
        await user.update({ ultimoAcesso: new Date() });

        const payload = {
            id: user.id,
            usuario: user.usuario,
            perfil: user.perfil,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h',
        });

        res.status(200).json({
            token,
            perfil: user.perfil,
            nome: user.nome
        });

    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};
