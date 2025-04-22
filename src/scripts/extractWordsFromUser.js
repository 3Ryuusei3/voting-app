import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// 🔐 Tu configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'XXXXX';

async function exportarVotos() {
  let votos = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('option_id')
      .eq('user_id', userId)
      .eq('poll_id', 1)
      .in('filter', ['difficult', 'not_exist'])
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (votesError) {
      console.error('❌ Error al obtener votos:', votesError);
      return;
    }

    if (!votesData.length) break;

    const optionIds = votesData.map(vote => vote.option_id);
    const { data: optionsData, error: optionsError } = await supabase
      .from('options')
      .select('option')
      .in('id', optionIds);

    if (optionsError) {
      console.error('❌ Error al obtener palabras de options:', optionsError);
      return;
    }

    votos = votos.concat(optionsData.map(option => option.option));
    page++;
  }

  const json = { words: votos };
  fs.writeFileSync('votadas.json', JSON.stringify(json, null, 2), 'utf8');
  console.log(`✅ Exportadas ${votos.length} palabras a votadas.json`);
}

exportarVotos();
