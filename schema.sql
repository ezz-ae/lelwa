-- Lelwa Database Schema
-- Extracted from lelwa.com project specification

-- LAYER I: OBSERVED REALITY
CREATE TABLE IF NOT EXISTS layer1_projects (
    project_id       SERIAL PRIMARY KEY,
    project_name     TEXT NOT NULL,
    developer_id     TEXT,
    area             TEXT,
    city             TEXT,
    latitude         FLOAT,
    longitude        FLOAT,
    launch_date      TEXT,
    completion_date  TEXT,
    total_units      INT,
    master_plan_id   TEXT,
    url_slug         TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer1_units (
    unit_id          SERIAL PRIMARY KEY,
    project_id       INT REFERENCES layer1_projects(project_id),
    unit_type        TEXT,
    bedrooms         INT,
    internal_area_sqft FLOAT,
    balcony_area_sqft  FLOAT,
    parking_count    INT,
    view_type        TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- LAYER II: DECLARED MARKET TRUTHS
CREATE TABLE IF NOT EXISTS layer2_declared_prices (
    id               SERIAL PRIMARY KEY,
    project_id       INT REFERENCES layer1_projects(project_id),
    source           TEXT NOT NULL,
    declared_price   FLOAT,
    declared_date    TEXT,
    currency         TEXT DEFAULT 'AED',
    source_confidence FLOAT DEFAULT 0.5
);

CREATE TABLE IF NOT EXISTS layer2_declared_rents (
    id               SERIAL PRIMARY KEY,
    project_id       INT REFERENCES layer1_projects(project_id),
    annual_rent      FLOAT,
    contract_start   TEXT,
    contract_end     TEXT,
    source           TEXT
);

CREATE TABLE IF NOT EXISTS layer2_developer_records (
    developer_id     TEXT PRIMARY KEY,
    canonical_name   TEXT,
    rera_id          TEXT,
    license_status   TEXT,
    website          TEXT,
    historical_completions INT,
    avg_delay_months FLOAT,
    tier             TEXT,
    reliability_score FLOAT
);

CREATE TABLE IF NOT EXISTS layer2_media (
    id               SERIAL PRIMARY KEY,
    project_id       INT REFERENCES layer1_projects(project_id),
    hero_image_url   TEXT,
    payment_plan     TEXT,
    amenities        TEXT,
    construction_phase TEXT,
    delivery_date    TEXT,
    bedroom_types    TEXT,
    source           TEXT,
    verified         BOOLEAN DEFAULT FALSE
);

-- LAYER III: DERIVED ALGEBRA
CREATE TABLE IF NOT EXISTS layer3_project_financials (
    project_id       INT PRIMARY KEY REFERENCES layer1_projects(project_id),
    price_per_sqft   FLOAT,
    gross_yield      FLOAT,
    net_yield        FLOAT,
    estimated_monthly_rent FLOAT,
    estimated_annual_rent  FLOAT,
    annual_cashflow  FLOAT,
    break_even_years FLOAT,
    cap_rate         FLOAT,
    roic_pct         FLOAT,
    purchase_price   FLOAT,
    current_value    FLOAT,
    capital_gain_pct FLOAT,
    computed_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer3_project_metrics (
    project_id       INT PRIMARY KEY REFERENCES layer1_projects(project_id),
    absorption_rate  FLOAT,
    sales_velocity   FLOAT,
    rental_demand_score  FLOAT,
    rental_supply_score  FLOAT,
    demand_supply_ratio  FLOAT,
    rental_market_balance TEXT,
    secondary_resale_rate    FLOAT,
    secondary_units_available INT,
    secondary_avg_hold_days  INT,
    secondary_flip_ratio     FLOAT,
    computed_at      TIMESTAMP DEFAULT NOW()
);

-- LAYER IV: INFERENCE & INTELLIGENCE
CREATE TABLE IF NOT EXISTS layer4_market_inferences (
    id               SERIAL PRIMARY KEY,
    entity_type      TEXT NOT NULL,
    entity_id        INT NOT NULL,
    inference_type   TEXT NOT NULL,
    inferred_value   FLOAT,
    inference_label  TEXT,
    confidence_score FLOAT,
    reasoning        TEXT,
    model_version    TEXT DEFAULT 'v1.0',
    computed_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer4_composite_scores (
    project_id       INT PRIMARY KEY REFERENCES layer1_projects(project_id),
    investment_score FLOAT,
    risk_composite   FLOAT,
    buyer_opportunity FLOAT,
    developer_reliability FLOAT,
    area_competitiveness  FLOAT,
    price_reality_index   FLOAT,
    market_timing    TEXT,
    computed_at      TIMESTAMP DEFAULT NOW()
);

-- LAYER V: CONFIDENCE & INTEGRITY
CREATE TABLE IF NOT EXISTS layer5_data_confidence (
    id               SERIAL PRIMARY KEY,
    entity_type      TEXT NOT NULL,
    entity_id        INT NOT NULL,
    truth_layer      INT NOT NULL,
    confidence_score FLOAT NOT NULL,
    confidence_label TEXT,
    decay_rate       FLOAT DEFAULT 0.01,
    pressure_index   FLOAT DEFAULT 0.0,
    last_verified_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_type, entity_id, truth_layer)
);

-- LAYER VI: TEMPORAL MEMORY
CREATE TABLE IF NOT EXISTS layer6_market_snapshots (
    id               SERIAL PRIMARY KEY,
    snapshot_date    TIMESTAMP DEFAULT NOW(),
    entity_type      TEXT NOT NULL,
    entity_id        INT NOT NULL,
    state_hash       TEXT,
    metrics_json     JSONB,
    snapshot_version TEXT DEFAULT 'v1.0'
);

-- Growth intelligence
CREATE TABLE IF NOT EXISTS layer3_growth_by_area (
    id SERIAL PRIMARY KEY,
    area TEXT, city TEXT, total_projects INT,
    recent_launches INT, active_construction INT, completed INT,
    pipeline_ratio FLOAT, construction_intensity FLOAT,
    avg_price FLOAT, median_price FLOAT, avg_yield FLOAT,
    avg_demand_score FLOAT, avg_supply_score FLOAT, demand_supply_gap FLOAT,
    avg_appreciation FLOAT, tier1_developer_pct FLOAT,
    growth_score FLOAT, growth_class TEXT,
    computed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer3_growth_by_city (
    id SERIAL PRIMARY KEY,
    city TEXT, total_projects INT, unique_areas INT, unique_developers INT,
    avg_price FLOAT, median_price FLOAT, total_portfolio_value FLOAT,
    avg_yield FLOAT, avg_appreciation FLOAT, undersupplied_pct FLOAT,
    growth_score FLOAT, growth_class TEXT,
    computed_at TIMESTAMP DEFAULT NOW()
);

-- Investor Profiles & Intent
CREATE TABLE IF NOT EXISTS investor_profiles_v1 (
    risk_profile TEXT PRIMARY KEY,
    allowed_bands TEXT[]
);

INSERT INTO investor_profiles_v1 (risk_profile, allowed_bands) VALUES
('Conservative', ARRAY['Institutional Safe', 'Capital Safe']),
('Moderate', ARRAY['Institutional Safe', 'Capital Safe', 'Opportunistic']),
('Aggressive', ARRAY['Institutional Safe', 'Capital Safe', 'Opportunistic', 'Speculative'])
ON CONFLICT (risk_profile) DO NOTHING;

CREATE TABLE IF NOT EXISTS investor_intent_profiles (
    session_id TEXT PRIMARY KEY,
    risk_profile TEXT,
    horizon TEXT,
    budget_aed NUMERIC,
    preferred_area TEXT,
    beds_pref TEXT,
    intent TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Market Scores & Inventory View (Pushed from Python but defined here for reference)
CREATE TABLE IF NOT EXISTS market_scores_v1 (
    asset_id TEXT PRIMARY KEY,
    city TEXT,
    area TEXT,
    status_band TEXT,
    price_tier TEXT,
    score_0_100 FLOAT,
    classification TEXT,
    safety_band TEXT,
    roi_band TEXT,
    timeline_risk_band TEXT,
    liquidity_band TEXT,
    reason_codes TEXT,
    risk_flags TEXT,
    warnings TEXT,
    drivers TEXT
);

CREATE TABLE IF NOT EXISTS agent_inventory_view_v1 (
    asset_id TEXT PRIMARY KEY,
    name TEXT,
    developer TEXT,
    city TEXT,
    area TEXT,
    status TEXT,
    completion_year TEXT,
    price_aed FLOAT,
    beds TEXT,
    score_0_100 FLOAT,
    classification TEXT,
    safety_band TEXT,
    roi_band TEXT,
    timeline_risk_band TEXT,
    liquidity_band TEXT,
    status_band TEXT,
    price_tier TEXT,
    reason_codes TEXT,
    risk_flags TEXT,
    drivers TEXT,
    warnings TEXT,
    updated_at TEXT
);

-- Area Intelligence Table
CREATE TABLE IF NOT EXISTS entrestate_area_cards (
    area TEXT PRIMARY KEY,
    description TEXT,
    highlights TEXT[],
    amenities TEXT[],
    growth_index FLOAT,
    yield_median FLOAT,
    price_median_aed FLOAT
);

CREATE TABLE IF NOT EXISTS dld_area_benchmarks (
    area_name_clean TEXT PRIMARY KEY,
    avg_price_per_sqft FLOAT,
    yoy_growth_pct FLOAT,
    transaction_volume_30d INT
);

-- FUNCTIONS

CREATE OR REPLACE FUNCTION agent_ranked_for_investor_v1(
    p_risk_profile TEXT,
    p_horizon TEXT,
    p_budget NUMERIC DEFAULT 0,
    p_area_pref TEXT DEFAULT NULL,
    p_beds_pref TEXT DEFAULT NULL,
    p_intent TEXT DEFAULT 'invest',
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    asset_id TEXT, name TEXT, developer TEXT, city TEXT, area TEXT,
    status_band TEXT, price_aed DOUBLE PRECISION, beds TEXT,
    score_0_100 BIGINT, classification TEXT, safety_band TEXT,
    roi_band TEXT, timeline_risk_band TEXT, liquidity_band TEXT,
    reason_codes TEXT, risk_flags TEXT, drivers TEXT,
    match_score INT, final_rank INT
)
LANGUAGE plpgsql STABLE
AS $fn$
DECLARE
    v_max_ord INT;
BEGIN
    v_max_ord := CASE p_horizon
        WHEN 'Ready'  THEN 1
        WHEN '6-12mo' THEN 2
        WHEN '1-2yr'  THEN 3
        WHEN '2-4yr'  THEN 4
        WHEN '4yr+'   THEN 5
        ELSE 4
    END;

    RETURN QUERY
    WITH allowed AS (
        SELECT unnest(allowed_bands) AS band
        FROM investor_profiles_v1
        WHERE risk_profile = p_risk_profile
    ),
    candidates AS (
        SELECT v.*
        FROM agent_inventory_view_v1 v
        WHERE v.safety_band IN (SELECT band FROM allowed)
          AND (CASE v.status_band
                WHEN 'Completed'        THEN 1
                WHEN 'Handover2025'     THEN 2
                WHEN 'Handover2026'     THEN 3
                WHEN 'Handover2027'     THEN 4
                WHEN 'Handover2028_29'  THEN 5
                WHEN 'Handover2030Plus' THEN 6
                ELSE 999
              END) <= v_max_ord
    ),
    scored AS (
        SELECT
            c.asset_id, c.name, c.developer, c.city, c.area,
            c.status_band, c.price_aed::DOUBLE PRECISION, c.beds,
            c.score_0_100::BIGINT, c.classification, c.safety_band,
            c.roi_band, c.timeline_risk_band, c.liquidity_band,
            c.reason_codes, c.risk_flags, c.drivers,
            ROUND((
                0.35 * CASE
                    WHEN p_budget > 0 AND c.price_aed IS NOT NULL AND c.price_aed > 0
                    THEN GREATEST(0, 1.0 - ABS(c.price_aed - p_budget) / GREATEST(p_budget, 1))
                    ELSE 0.5
                END
                + 0.25 * CASE
                    WHEN p_area_pref IS NOT NULL AND c.area IS NOT NULL
                         AND LOWER(c.area) = LOWER(p_area_pref) THEN 1.0
                    WHEN p_area_pref IS NULL THEN 0.5
                    ELSE 0.3
                END
                + 0.20 * CASE
                    WHEN p_beds_pref IS NOT NULL AND c.beds IS NOT NULL
                         AND LOWER(c.beds) LIKE '%' || LOWER(p_beds_pref) || '%' THEN 1.0
                    WHEN p_beds_pref IS NULL THEN 0.5
                    ELSE 0.3
                END
                + 0.10 * CASE p_intent
                    WHEN 'invest' THEN CASE WHEN c.status_band IN ('Handover2025','Handover2026','Handover2027') THEN 0.9 ELSE 0.5 END
                    WHEN 'live' THEN CASE WHEN c.status_band = 'Completed' THEN 1.0 WHEN c.status_band = 'Handover2025' THEN 0.7 ELSE 0.3 END
                    WHEN 'rent' THEN CASE WHEN c.status_band = 'Completed' THEN 1.0 ELSE 0.2 END
                    ELSE 0.5
                END
                + 0.10 * CASE c.status_band
                    WHEN 'Completed' THEN 1.0
                    WHEN 'Handover2025' THEN 0.85
                    WHEN 'Handover2026' THEN 0.70
                    WHEN 'Handover2027' THEN 0.55
                    WHEN 'Handover2028_29' THEN 0.35
                    ELSE 0.15
                END
            ) * 100)::INT AS match_score,
            0::INT AS final_rank
        FROM candidates c
    )
    SELECT
        s.asset_id, s.name, s.developer, s.city, s.area,
        s.status_band, s.price_aed, s.beds,
        s.score_0_100, s.classification, s.safety_band,
        s.roi_band, s.timeline_risk_band, s.liquidity_band,
        s.reason_codes, s.risk_flags, s.drivers,
        s.match_score,
        ROUND(0.65 * s.score_0_100 + 0.35 * s.match_score)::INT AS final_rank
    FROM scored s
    ORDER BY final_rank DESC
    LIMIT p_limit;
END;
$fn$;

CREATE OR REPLACE FUNCTION get_market_overview()
RETURNS TABLE (
    total BIGINT,
    inst_safe BIGINT,
    cap_safe BIGINT,
    opportunistic BIGINT,
    speculative BIGINT,
    avg_score NUMERIC
)
LANGUAGE sql STABLE
AS $fn$
    SELECT COUNT(*) AS total,
        COUNT(*) FILTER (WHERE safety_band = 'Institutional Safe') AS inst_safe,
        COUNT(*) FILTER (WHERE safety_band = 'Capital Safe') AS cap_safe,
        COUNT(*) FILTER (WHERE safety_band = 'Opportunistic') AS opportunistic,
        COUNT(*) FILTER (WHERE safety_band = 'Speculative') AS speculative,
        ROUND(AVG(score_0_100)::numeric, 1) AS avg_score
    FROM market_scores_v1;
$fn$;
