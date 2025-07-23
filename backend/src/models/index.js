const Participante = require('./Participante');
const Rifa = require('./Rifa');
const Bilhete = require('./Bilhete');
const Sorteio = require('./Sorteio');
const Pagamento = require('./Pagamento');
const Usuario = require('./Usuario');

// Associações simples baseadas apenas nos campos que existem nas tabelas

// Sorteio pertence a uma Rifa
Sorteio.belongsTo(Rifa, { foreignKey: 'rifaId', as: 'rifa' });
Rifa.hasMany(Sorteio, { foreignKey: 'rifaId', as: 'sorteios' });

// Bilhete pertence a uma Rifa
Bilhete.belongsTo(Rifa, { foreignKey: 'rifaId', as: 'rifa' });
Rifa.hasMany(Bilhete, { foreignKey: 'rifaId', as: 'bilhetes' });

// Bilhete pertence a um Participante
Bilhete.belongsTo(Participante, { foreignKey: 'participanteId', as: 'participante' });
Participante.hasMany(Bilhete, { foreignKey: 'participanteId', as: 'bilhetes' });

// Pagamento pertence a um Bilhete
Pagamento.belongsTo(Bilhete, { foreignKey: 'bilheteId', as: 'bilhete' });
Bilhete.hasOne(Pagamento, { foreignKey: 'bilheteId', as: 'pagamento' });

// Pagamento pertence a um Participante
Pagamento.belongsTo(Participante, { foreignKey: 'participanteId', as: 'participante' });
Participante.hasMany(Pagamento, { foreignKey: 'participanteId', as: 'pagamentos' });

module.exports = {
    Participante,
    Rifa,
    Bilhete,
    Sorteio,
    Pagamento,
    Usuario
};
