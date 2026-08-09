-- Poker Championship SaaS - Initial Schema

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT,
  narration_used_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player pool per user
CREATE TABLE public.players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament templates (blind structures + settings)
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  buy_in_amount INTEGER DEFAULT 500,
  rebuy_amount INTEGER DEFAULT 500,
  addon_amount INTEGER DEFAULT 0,
  prize_first_pct INTEGER DEFAULT 80,
  prize_second_pct INTEGER DEFAULT 20,
  house_fee_pct INTEGER DEFAULT 10,
  starting_chips INTEGER DEFAULT 1000,
  allow_rebuys BOOLEAN DEFAULT TRUE,
  allow_addons BOOLEAN DEFAULT TRUE,
  fire_rounds_count INTEGER DEFAULT 3,
  fire_rounds_before_break BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual rounds for a template
CREATE TABLE public.template_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  small_blind INTEGER DEFAULT 0,
  big_blind INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 20,
  is_break BOOLEAN DEFAULT FALSE,
  is_test BOOLEAN DEFAULT FALSE
);

-- Active and archived tournaments
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id),
  name TEXT NOT NULL,
  is_major BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  current_round_position INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  game_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players in a specific tournament
CREATE TABLE public.tournament_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player_pool_id UUID REFERENCES public.players(id),
  name TEXT NOT NULL,
  stacks INTEGER DEFAULT 1,
  total_paid INTEGER DEFAULT 0,
  has_addon BOOLEAN DEFAULT FALSE,
  is_eliminated BOOLEAN DEFAULT FALSE,
  eliminated_at TIMESTAMPTZ,
  eliminated_by TEXT,
  final_rank INTEGER,
  prize_won INTEGER DEFAULT 0,
  rebuy_count INTEGER DEFAULT 0
);

-- Kill feed / event log
CREATE TABLE public.tournament_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  player_name TEXT,
  actor_name TEXT,
  round_position INTEGER,
  elapsed_minutes DECIMAL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart home configurations
CREATE TABLE public.smart_home_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider TEXT DEFAULT 'webhook' CHECK (provider IN ('webhook', 'ifttt', 'hue', 'home_assistant')),
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_home_configs ENABLE ROW LEVEL SECURITY;

-- profiles: own row only
CREATE POLICY "profiles_own" ON public.profiles FOR ALL USING (auth.uid() = id);

-- players: own rows only
CREATE POLICY "players_own" ON public.players FOR ALL USING (auth.uid() = user_id);

-- templates: own rows + system templates readable by all
CREATE POLICY "templates_own" ON public.templates FOR ALL USING (auth.uid() = user_id OR is_system = TRUE);
CREATE POLICY "templates_insert" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- template_rounds: via template ownership
CREATE POLICY "template_rounds_own" ON public.template_rounds FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.templates t
    WHERE t.id = template_id AND (t.user_id = auth.uid() OR t.is_system = TRUE)
  ));
CREATE POLICY "template_rounds_insert" ON public.template_rounds FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

-- tournaments: own rows only
CREATE POLICY "tournaments_own" ON public.tournaments FOR ALL USING (auth.uid() = user_id);

-- tournament_players: via tournament ownership
CREATE POLICY "tournament_players_own" ON public.tournament_players FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.user_id = auth.uid()
  ));

-- tournament_events: via tournament ownership
CREATE POLICY "tournament_events_own" ON public.tournament_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.user_id = auth.uid()
  ));

-- smart_home_configs: own row only
CREATE POLICY "smart_home_configs_own" ON public.smart_home_configs FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
