import fs from 'fs';
import path from 'path';

const ELEVEN_KEY = 'sk_140d10dcdc705e07ae8a1a65ce5d8fc3675f06082a590f40';

const ITEMS = [
  {
    id: 'aud-demo-1',
    voiceId: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo
    text: 'Atenção clientes do Supermercado! Quarta da Carne com Alcatra Friboi por apenas trinta e seis reais e noventa centavos o quilo! Coxa e sobrecoxa Sadia só oito reais e noventa e nove centavos!',
  },
  {
    id: 'aud-demo-2',
    voiceId: 'wHnxjlY53t8X9Oi14Awz', // Juliano Magalhães
    text: 'O fim de semana chegou com tudo no Supermercado Alvorada! Picanha bovina fatiada grill por só cinquenta e nove reais e noventa centavos o quilo! Cerveja Heineken lata bem gelada, quatro reais e oitenta e nove centavos!',
  },
  {
    id: 'aud-demo-3',
    voiceId: 'cabLxBh81HurPAAJfEHo', // Bea - Calm & Friendly
    text: 'Tem feirinha fresca hoje no nosso supermercado! Banana-caturra selecionada por apenas três reais e noventa e nove centavos o quilo! Tomate italiano fresquinho por quatro reais e quarenta e nove centavos o quilo!',
  },
  {
    id: 'voice_marcos-institucional',
    voiceId: 'a1ijbt2xmlhzaGXHewzV', // Augusto Vasconcelos
    text: 'Você já é cadastrado no nosso Clube de Vantagens? Informe seu CPF no caixa para ativar ofertas exclusivas direto no leitor. Cadastre-se gratuitamente no balcão de atendimento.',
  },
  {
    id: 'voice_daniel-varejo',
    voiceId: 'dXQsuVXyCGkF7meZLeFk', // Dany Varejo
    text: 'Atenção clientes do Supermercado! Sou o Daniel. Ofertas relâmpago e preços baixos no açougue e mercearia para você encher o carrinho com a maior economia da cidade!',
  },
  {
    id: 'voice_carolina-acolhedora',
    voiceId: 'cabLxBh81HurPAAJfEHo', // Bea
    text: 'Olá! Seja muito bem-vindo ao nosso supermercado. Pão quentinho saindo a toda hora na padaria e as melhores frutas fresquinhas selecionadas com carinho para sua família.',
  },
  {
    id: 'voice_rodrigo-grave',
    voiceId: 'wHnxjlY53t8X9Oi14Awz', // Juliano Magalhães
    text: 'Atenção! Queima total de estoque e preços de atacarejo em toda a loja! Economia bruta de verdade é só aqui. Venha conferir agora mesmo!',
  },
  {
    id: 'voice_mariana-jovem',
    voiceId: 'AKXBn24T1f9tvTDnWzWT', // Bruna Costa
    text: 'E aí, tudo bem? Sextou com ofertas imperdíveis no setor de bebidas, snacks e conveniência. Vem curtir os melhores preços e aproveitar seu fim de semana!',
  },
  {
    id: 'style_energetica_supermercado',
    voiceId: 'dXQsuVXyCGkF7meZLeFk',
    text: 'Super Queima de Estoque no açougue e feirinha do supermercado! Ofertas imbatíveis e economia de verdade só hoje!',
  },
  {
    id: 'style_animada_promocional',
    voiceId: 'AKXBn24T1f9tvTDnWzWT',
    text: 'Chegou o festival de ofertas e prêmios da loja! Venha economizar e participar do show de preços baixos!',
  },
  {
    id: 'style_elegante_institucional',
    voiceId: 'a1ijbt2xmlhzaGXHewzV',
    text: 'Supermercado Modelo. Tradição em servir com excelência, qualidade rigorosa e o melhor atendimento para você e sua família.',
  },
  {
    id: 'style_natural_amigavel',
    voiceId: 'cabLxBh81HurPAAJfEHo',
    text: 'Bom dia! Tudo preparado com muito carinho para suas compras de hoje. Aproveite nossos produtos fresquinhos e selecione o melhor para sua casa.',
  },
  {
    id: 'style_popular_descontraida',
    voiceId: 'dXQsuVXyCGkF7meZLeFk',
    text: 'Preço baixo de verdade você já sabe onde encontrar! Corre pra cá e garanta o melhor para o seu bolso hoje mesmo!',
  },
  {
    id: 'style_urgente_oportunidade',
    voiceId: 'wHnxjlY53t8X9Oi14Awz',
    text: 'Atenção! Últimas horas de ofertas relâmpago! Estoques limitados em todos os setores da loja. Não perca!',
  },
];

async function generateOne(item: typeof ITEMS[0]) {
  console.log(`🎙️ Sintetizando [${item.id}] com ElevenLabs (Voice ID: ${item.voiceId})...`);
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${item.voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVEN_KEY,
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: item.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Falha ElevenLabs para ${item.id}: ${response.status} - ${err}`);
  }

  const arrBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrBuffer);

  const seedDir = path.resolve(process.cwd(), 'server', 'seed_audios');
  const localDir = path.resolve(process.cwd(), '.locucao_audios');

  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  fs.writeFileSync(path.join(seedDir, `${item.id}.mp3`), buffer);
  fs.writeFileSync(path.join(localDir, `${item.id}.mp3`), buffer);

  console.log(`  ✓ Salvo ${item.id}.mp3 (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log(`Iniciando geração de ${ITEMS.length} locuções com ElevenLabs...\n`);
  for (const item of ITEMS) {
    try {
      await generateOne(item);
    } catch (e: any) {
      console.error(`❌ Erro em ${item.id}:`, e.message);
    }
  }
  console.log('\n✅ Todas as locuções ElevenLabs foram geradas e salvas com sucesso!');
}

main().catch(console.error);

