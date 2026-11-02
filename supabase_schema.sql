-- ============================================================
-- LOCUÇÃO SUPER IA - SUPABASE SQL SCHEMA
-- Sistema de Geração de Locuções Comerciais e Roteiros para Supermercados
-- ============================================================

-- Habilitar extensão UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS / PERFIS (profiles)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company_name TEXT DEFAULT 'Supermercado',
    city TEXT,
    role TEXT NOT NULL DEFAULT 'supermarket_owner' CHECK (role IN ('supermarket_owner', 'manager', 'admin')),
    plan TEXT NOT NULL DEFAULT 'pro_varejo' CHECK (plan IN ('gratuito', 'pro_varejo', 'redes_atacarejo')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'bloqueado')),
    notes TEXT,
    credits_balance INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- -------------------------------------------------------------
-- 2. TABELA DE PROJETOS E CAMPANHAS (projects)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    store_name TEXT DEFAULT '',
    store_city TEXT DEFAULT '',
    objective TEXT DEFAULT '',
    campaign_type TEXT NOT NULL DEFAULT 'ofertas_dia',
    style TEXT NOT NULL DEFAULT 'energetica_supermercado',
    desired_duration TEXT NOT NULL DEFAULT '30s',
    tone TEXT NOT NULL DEFAULT 'persuasivo',
    presentation_format TEXT NOT NULL DEFAULT 'abertura_sequencia_encerramento',
    custom_opening TEXT DEFAULT '',
    custom_closing TEXT DEFAULT '',
    free_instructions TEXT DEFAULT '',
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    scripts JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_script_index INTEGER NOT NULL DEFAULT 0,
    audios JSONB NOT NULL DEFAULT '[]'::jsonb,
    soundtrack_id TEXT DEFAULT 'sem_trilha',
    soundtrack_volume NUMERIC(3,2) DEFAULT 0.20,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scripted', 'ready', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- -------------------------------------------------------------
-- 3. TABELA DE TRANSAÇÕES DE CRÉDITO (credit_transactions)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- -------------------------------------------------------------
-- 4. TABELA DE VOZES E LOCUTORES (voices)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.voices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino')),
    description TEXT NOT NULL,
    eleven_voice_id TEXT,
    gemini_voice_name TEXT DEFAULT 'Fenrir',
    accent TEXT NOT NULL DEFAULT 'Português Brasileiro',
    style_tag TEXT NOT NULL DEFAULT 'Varejo & Supermercado',
    category TEXT DEFAULT 'premade',
    is_default BOOLEAN NOT NULL DEFAULT false,
    preview_url TEXT,
    sample_audio_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. TABELA DE CONFIGURAÇÕES GERAIS (admin_settings)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    default_voice_id TEXT NOT NULL DEFAULT 'daniel-varejo',
    credits_per_generation INTEGER NOT NULL DEFAULT 10,
    initial_credits INTEGER NOT NULL DEFAULT 500,
    eleven_labs_model TEXT NOT NULL DEFAULT 'eleven_multilingual_v2',
    gemini_model TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
    system_announcement TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir configuração padrão inicial
INSERT INTO public.admin_settings (id, default_voice_id, credits_per_generation, initial_credits, eleven_labs_model)
VALUES (1, 'daniel-varejo', 10, 500, 'eleven_multilingual_v2')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 6. DADOS INICIAIS DE VOZES (SEED)
-- -------------------------------------------------------------
INSERT INTO public.voices (id, name, gender, description, eleven_voice_id, gemini_voice_name, accent, style_tag, is_default)
VALUES 
    ('daniel-varejo', 'Daniel (Varejo Enérgico)', 'masculino', 'Voz comercial clássica de supermercado, vibrante e persuasiva. Ideal para ofertas relâmpago.', 'ErXwobaYiN019PkySvjV', 'Fenrir', 'Português Brasileiro (Neutro/Comercial)', 'Varejo & Supermercado', true),
    ('carolina-acolhedora', 'Carolina (Vendedora Amigável)', 'feminino', 'Tom caloroso, convidativo e empático. Perfeito para padaria, hortifrúti e compras familiares.', '21m00Tcm4TlvDq8ikWAM', 'Kore', 'Português Brasileiro (Suave e Firme)', 'Familiar & Empática', false),
    ('rodrigo-grave', 'Rodrigo (Voz de Impacto)', 'masculino', 'Grave marcante, autoridade e entusiasmo. Excelente para atacarejos, queima de estoque e Black Friday.', 'pNInz6obpgDQGcFmaJgB', 'Puck', 'Português Brasileiro (Locutor FM)', 'Impacto & Atacarejo', false),
    ('mariana-jovem', 'Mariana (Descontraída & Dinâmica)', 'feminino', 'Jovem, moderna e cheia de ritmo. Excelente para conveniências, hortifrúti gourmet e bebidas.', 'EXAVITQu4vr4xnSDxMaL', 'Zephyr', 'Português Brasileiro (Contemporâneo)', 'Jovem & Dinâmica', false),
    ('marcos-institucional', 'Marcos (Elegante & Institucional)', 'masculino', 'Locução sóbria e refinada para comunicados da loja, inaugurações, clube de vantagens e horários.', 'VR6AewLTigWG4xSOukaG', 'Charon', 'Português Brasileiro (Institucional)', 'Institucional & Clube', false)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 7. USUÁRIOS DEMO INICIAIS (SEED)
-- -------------------------------------------------------------
INSERT INTO public.profiles (id, name, email, phone, company_name, city, role, plan, credits_balance)
VALUES 
    ('user-alvorada', 'Carlos Mendes', 'carlos@supermercadoalvorada.com.br', '(11) 98765-4321', 'Supermercado Alvorada', 'São Paulo - SP', 'supermarket_owner', 'pro_varejo', 480),
    ('user-atacado-preco-bom', 'Renata Silveira', 'renata@precobomatacado.com.br', '(31) 99234-5678', 'Atacado Preço Bom', 'Belo Horizonte - MG', 'supermarket_owner', 'redes_atacarejo', 1250),
    ('user-hortifruti-vida', 'Marcos Oliveira', 'marcos@hortifrutivida.com.br', '(21) 98112-9988', 'Hortifrúti Vida Leve', 'Niterói - RJ', 'manager', 'pro_varejo', 320),
    ('user-admin-mestre', 'Administrador do Sistema', 'admin@superlocucao.com.br', '(11) 99999-0000', 'Super Locução IA Matriz', 'São Paulo - SP', 'admin', 'redes_atacarejo', 99999)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 8. TABELA DE CONFIGURAÇÃO DA RÁDIO INDOOR (radio_config)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.radio_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    station_name TEXT NOT NULL DEFAULT 'Rádio Supermercado Alvorada FM',
    slogan TEXT DEFAULT 'A rádio da economia e das melhores ofertas para a sua família!',
    is_on_air BOOLEAN NOT NULL DEFAULT false,
    mode TEXT NOT NULL DEFAULT 'intervalo_tempo',
    spots_every_n_tracks INTEGER NOT NULL DEFAULT 1,
    spots_interval_seconds INTEGER NOT NULL DEFAULT 45,
    only_offers_pause_seconds INTEGER NOT NULL DEFAULT 4,
    music_volume NUMERIC(3,2) NOT NULL DEFAULT 0.75,
    spot_volume NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    ducking_level NUMERIC(3,2) NOT NULL DEFAULT 0.12,
    selected_music_category TEXT NOT NULL DEFAULT 'todas',
    active_playlist_id TEXT NOT NULL DEFAULT 'todas',
    playlists JSONB NOT NULL DEFAULT '[]'::jsonb,
    queue JSONB NOT NULL DEFAULT '[]'::jsonb,
    music_tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
    auto_publish_new_audios BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir configuração de rádio padrão
INSERT INTO public.radio_config (id, station_name, slogan, is_on_air)
VALUES (1, 'Rádio Supermercado Alvorada FM', 'A rádio da economia e das melhores ofertas para a sua família!', false)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 9. POLÍTICAS DE SEGURANÇA (Row Level Security - RLS)
-- -------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_config ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública/Geral para vozes, rádio e configurações
CREATE POLICY "Permitir leitura de vozes para todos" ON public.voices FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de settings para todos" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de radio para todos" ON public.radio_config FOR SELECT USING (true);

-- Políticas para Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (true);

-- Políticas para Projects
CREATE POLICY "Usuários podem gerenciar seus próprios projetos" ON public.projects FOR ALL USING (true);

-- Políticas para Transações
CREATE POLICY "Usuários podem visualizar suas próprias transações" ON public.credit_transactions FOR SELECT USING (true);
