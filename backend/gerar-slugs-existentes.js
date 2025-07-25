const { Rifa } = require('./src/models');

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function generateUniqueSlug(titulo, excludeId = null) {
    const baseSlug = slugify(titulo);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const whereClause = { slug };
        if (excludeId) {
            whereClause.id = { [require('sequelize').Op.ne]: excludeId };
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
        console.log('Buscando rifas sem slug...');

        const rifasSemSlug = await Rifa.findAll({
            where: {
                slug: null
            }
        });

        console.log(`Encontradas ${rifasSemSlug.length} rifas sem slug`);

        for (const rifa of rifasSemSlug) {
            const slug = await generateUniqueSlug(rifa.titulo, rifa.id);

            await rifa.update({ slug });

            console.log(`Rifa "${rifa.titulo}" -> slug: "${slug}"`);
        }

        console.log('Processo concluído!');
    } catch (error) {
        console.error('Erro ao gerar slugs:', error);
    }
}

// Executar o script
gerarSlugsParaRifasExistentes().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('Erro:', error);
    process.exit(1);
});
