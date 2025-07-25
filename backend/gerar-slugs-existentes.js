const { Rifa } = require('./src/models');
const { Op } = require('sequelize');

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui espaços e caracteres especiais por hífen
        .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
        .substring(0, 100); // Limita a 100 caracteres
}

async function generateUniqueSlug(titulo, excludeId = null) {
    let baseSlug = slugify(titulo);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const whereClause = { slug };
        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }

        const existingRifa = await Rifa.findOne({ where: whereClause });
        
        if (!existingRifa) {
            return slug;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

async function gerarSlugsParaRifasExistentes() {
    try {
        console.log('🔍 Conectando ao banco de dados...');
        
        // Verificar se a coluna slug existe
        const rifasSemSlug = await Rifa.findAll({
            where: {
                [Op.or]: [
                    { slug: null },
                    { slug: '' }
                ]
            }
        });

        console.log(`📋 Encontradas ${rifasSemSlug.length} rifas sem slug`);

        if (rifasSemSlug.length === 0) {
            console.log('✅ Todas as rifas já possuem slug!');
            return;
        }

        for (const rifa of rifasSemSlug) {
            try {
                const slug = await generateUniqueSlug(rifa.titulo, rifa.id);
                
                await rifa.update({ slug });
                
                console.log(`✅ Rifa "${rifa.titulo}" -> slug: "${slug}"`);
            } catch (error) {
                console.error(`❌ Erro ao processar rifa "${rifa.titulo}":`, error.message);
            }
        }

        console.log('🎉 Processo concluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro geral:', error);
        throw error;
    }
}

// Executar o script
gerarSlugsParaRifasExistentes().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('Erro:', error);
    process.exit(1);
});
