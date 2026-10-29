-- ============================================================
-- InterCamp - estrutura do banco de dados (PostgreSQL)
-- Pode ser executado mais de uma vez: só cria o que não existe.
-- Ordem de criação respeita as chaves estrangeiras:
--   torneio -> equipes -> competicoes -> jogos -> sets_volei / eventos
--   noticias (independente)
-- ============================================================


-- ------------------------------------------------------------
-- TORNEIO: dados gerais do evento (existe só UMA linha, id = 1)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS torneio (
  id           SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nome         TEXT  NOT NULL,
  subtitulo    TEXT,
  organizacao  TEXT,
  lemas        TEXT[] NOT NULL DEFAULT '{}',
  -- Pontos que cada resultado vale no ranking das turmas
  pontuacao    JSONB NOT NULL DEFAULT '{"vitoria":3,"derrota":0}'
);


-- ------------------------------------------------------------
-- EQUIPES: cada equipe é uma turma da escola (ex.: "301 INT")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipes (
  id          SERIAL PRIMARY KEY,
  nome        TEXT     NOT NULL UNIQUE,
  slug        TEXT     NOT NULL UNIQUE,                -- usado em URLs: "301-int"
  serie       SMALLINT NOT NULL CHECK (serie BETWEEN 1 AND 3),
  curso       TEXT     CHECK (curso IN ('INT', 'ADM')), -- NULL nas turmas da 1ª série
  cor         TEXT,                                     -- cor em hexadecimal: "#1E6BFF"
  escudo_url  TEXT
);


-- ------------------------------------------------------------
-- COMPETIÇÕES: cada modalidade + naipe (ex.: Futsal Masculino)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competicoes (
  id                   SERIAL PRIMARY KEY,
  slug                 TEXT NOT NULL UNIQUE,
  nome                 TEXT NOT NULL,
  esporte              TEXT NOT NULL CHECK (esporte IN ('handebol', 'futsal', 'volei_quadra', 'volei_praia')),
  naipe                TEXT NOT NULL CHECK (naipe IN ('masculino', 'feminino')),
  formato_placar       TEXT NOT NULL CHECK (formato_placar IN ('gols', 'sets')),

  -- Regras de set (só valem para o vôlei; ficam NULL nos esportes de gols)
  sets_para_vencer     SMALLINT CHECK (sets_para_vencer > 0),
  pontos_por_set       SMALLINT CHECK (pontos_por_set > 0),
  pontos_set_decisivo  SMALLINT CHECK (pontos_set_decisivo > 0),

  cor                  TEXT,
  ordem                SMALLINT NOT NULL DEFAULT 0,       -- ordem de exibição no app

  -- Preenchidos automaticamente quando a final for encerrada
  campeao_id           INTEGER REFERENCES equipes (id) ON DELETE SET NULL,
  vice_id              INTEGER REFERENCES equipes (id) ON DELETE SET NULL,

  -- Competição de sets precisa ter as regras de set preenchidas
  CONSTRAINT competicoes_regras_sets_ck CHECK (
    formato_placar = 'gols'
    OR (sets_para_vencer IS NOT NULL AND pontos_por_set IS NOT NULL AND pontos_set_decisivo IS NOT NULL)
  ),
  -- Campeão e vice não podem ser a mesma turma
  CONSTRAINT competicoes_campeao_vice_ck CHECK (campeao_id IS DISTINCT FROM vice_id OR campeao_id IS NULL)
);


-- ------------------------------------------------------------
-- JOGOS: cada partida do mata-mata
-- Uma vaga (lado A ou B) pode estar:
--   * definida      -> equipe_x_id preenchido
--   * vindo de jogo -> origem_x_jogo_id aponta o jogo cujo vencedor ocupa a vaga
--   * a definir     -> equipe e origem nulas (rotulo_x explica, ex.: "Vencedor - direto")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jogos (
  id                   SERIAL PRIMARY KEY,
  competicao_id        INTEGER  NOT NULL REFERENCES competicoes (id) ON DELETE CASCADE,
  numero               SMALLINT NOT NULL CHECK (numero > 0),
  fase_ordem           SMALLINT NOT NULL CHECK (fase_ordem > 0),
  fase_rotulo          TEXT     NOT NULL CHECK (fase_rotulo IN ('1ª Fase', '2ª Fase', '3ª Fase', 'Final')),
  eh_final             BOOLEAN  NOT NULL DEFAULT FALSE,

  equipe_a_id          INTEGER REFERENCES equipes (id) ON DELETE SET NULL,
  equipe_b_id          INTEGER REFERENCES equipes (id) ON DELETE SET NULL,
  origem_a_jogo_id     INTEGER REFERENCES jogos (id) ON DELETE SET NULL,
  origem_b_jogo_id     INTEGER REFERENCES jogos (id) ON DELETE SET NULL,
  rotulo_a             TEXT,
  rotulo_b             TEXT,

  -- Nulos = "A definir" no app
  local                TEXT,
  data                 DATE,
  horario              TIME,

  status               TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'ao_vivo', 'encerrado')),
  periodo              TEXT CHECK (periodo IN ('1º tempo', 'intervalo', '2º tempo', 'fim')),
  periodo_iniciado_em  TIMESTAMPTZ,

  -- Gols (handebol/futsal) ou sets vencidos (vôlei)
  placar_a             SMALLINT NOT NULL DEFAULT 0 CHECK (placar_a >= 0),
  placar_b             SMALLINT NOT NULL DEFAULT 0 CHECK (placar_b >= 0),
  vencedor_id          INTEGER REFERENCES equipes (id) ON DELETE SET NULL,

  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- O número do jogo não se repete dentro da mesma competição
  CONSTRAINT jogos_numero_uk UNIQUE (competicao_id, numero),
  -- Uma turma não joga contra ela mesma
  CONSTRAINT jogos_equipes_diferentes_ck CHECK (equipe_a_id IS DISTINCT FROM equipe_b_id OR equipe_a_id IS NULL),
  -- O vencedor tem que ser uma das duas equipes do jogo
  CONSTRAINT jogos_vencedor_ck CHECK (vencedor_id IS NULL OR vencedor_id = equipe_a_id OR vencedor_id = equipe_b_id),
  -- Jogo encerrado precisa ter vencedor (no mata-mata não há empate)
  CONSTRAINT jogos_encerrado_vencedor_ck CHECK (status <> 'encerrado' OR vencedor_id IS NOT NULL),
  -- "eh_final" e o rótulo "Final" andam juntos
  CONSTRAINT jogos_final_ck CHECK (eh_final = (fase_rotulo = 'Final')),
  -- Um jogo não pode ser origem dele mesmo
  CONSTRAINT jogos_origem_ck CHECK (origem_a_jogo_id IS DISTINCT FROM id AND origem_b_jogo_id IS DISTINCT FROM id)
);

CREATE INDEX IF NOT EXISTS jogos_competicao_idx ON jogos (competicao_id);
CREATE INDEX IF NOT EXISTS jogos_data_idx       ON jogos (data);
CREATE INDEX IF NOT EXISTS jogos_status_idx     ON jogos (status);


-- ------------------------------------------------------------
-- SETS DO VÔLEI: pontos de cada set de um jogo de vôlei
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sets_volei (
  id         SERIAL PRIMARY KEY,
  jogo_id    INTEGER  NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
  numero     SMALLINT NOT NULL CHECK (numero BETWEEN 1 AND 5),
  pontos_a   SMALLINT NOT NULL DEFAULT 0 CHECK (pontos_a >= 0),
  pontos_b   SMALLINT NOT NULL DEFAULT 0 CHECK (pontos_b >= 0),
  encerrado  BOOLEAN  NOT NULL DEFAULT FALSE,

  -- Cada jogo tem no máximo um "set 1", um "set 2"...
  CONSTRAINT sets_volei_numero_uk UNIQUE (jogo_id, numero)
);


-- ------------------------------------------------------------
-- EVENTOS: linha do tempo dos esportes de gols
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id         SERIAL PRIMARY KEY,
  jogo_id    INTEGER NOT NULL REFERENCES jogos (id) ON DELETE CASCADE,
  tipo       TEXT    NOT NULL CHECK (tipo IN (
               'inicio', 'gol', 'cartao_amarelo', 'cartao_vermelho', 'falta',
               'finalizacao', 'finalizacao_alvo', 'intervalo', 'fim')),
  minuto     SMALLINT CHECK (minuto >= 0),
  equipe_id  INTEGER REFERENCES equipes (id) ON DELETE SET NULL, -- NULL em inicio/intervalo/fim
  jogador    TEXT,                                               -- opcional
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eventos_jogo_idx ON eventos (jogo_id);


-- ------------------------------------------------------------
-- NOTÍCIAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id            SERIAL PRIMARY KEY,
  titulo        TEXT        NOT NULL,
  resumo        TEXT,
  corpo         TEXT,
  imagem_url    TEXT,
  destaque      BOOLEAN     NOT NULL DEFAULT FALSE,
  publicada_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);
