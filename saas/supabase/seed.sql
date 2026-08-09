-- Seed system templates (pre-made, available to all users)

-- ============================================================
-- 1. Regular Home Game (mirrors existing app exactly)
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'Regular Home Game', 'The classic setup — 18 rounds, 20-min levels, one break with add-ons. Mirrors the original app.', TRUE, 500, 500, 500, 80, 20, 10, 1000, TRUE, TRUE, 3, TRUE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000001', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000001', 1, 'Round 1', 5, 10, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 2, 'Round 2', 10, 20, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 3, 'Round 3', 20, 40, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 4, 'Round 4', 40, 80, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 5, 'Break + Add-On', 0, 0, 30, FALSE),
('00000000-0000-0000-0000-000000000001', 6, 'Round 5', 50, 100, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 7, 'Round 6', 100, 200, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 8, 'Round 7', 200, 400, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 9, 'Round 8', 400, 800, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 10, 'Round 9', 1000, 2000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 11, 'Round 10', 2000, 4000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 12, 'Round 11', 4000, 8000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 13, 'Round 12', 8000, 16000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 14, 'Round 13', 16000, 32000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 15, 'Round 14', 32000, 64000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 16, 'Round 15', 64000, 128000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 17, 'Round 16', 125000, 250000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 18, 'Round 17', 250000, 500000, 20, FALSE),
('00000000-0000-0000-0000-000000000001', 19, 'Round 18', 500000, 1000000, 20, FALSE);

-- ============================================================
-- 2. Turbo
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000002', NULL, 'Turbo', 'Fast-paced action — 10-min levels, blinds escalate quickly. Great for a 2-3 hour session.', TRUE, 500, 500, 0, 80, 20, 10, 1500, TRUE, FALSE, 0, FALSE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000002', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000002', 1, 'Round 1', 10, 20, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 2, 'Round 2', 20, 40, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 3, 'Round 3', 40, 80, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 4, 'Round 4', 75, 150, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 5, 'Round 5', 100, 200, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 6, 'Round 6', 200, 400, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 7, 'Round 7', 400, 800, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 8, 'Round 8', 1000, 2000, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 9, 'Round 9', 2000, 4000, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 10, 'Round 10', 5000, 10000, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 11, 'Round 11', 10000, 20000, 10, FALSE),
('00000000-0000-0000-0000-000000000002', 12, 'Round 12', 25000, 50000, 10, FALSE);

-- ============================================================
-- 3. Deep Stack
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000003', NULL, 'Deep Stack', '30-min levels, generous starting stack. Rewards skilled play over luck. Plan for a 6+ hour evening.', TRUE, 1000, 1000, 1000, 75, 25, 10, 5000, TRUE, TRUE, 2, TRUE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000003', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000003', 1, 'Round 1', 5, 10, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 2, 'Round 2', 10, 20, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 3, 'Round 3', 15, 30, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 4, 'Round 4', 25, 50, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 5, 'Round 5', 50, 100, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 6, 'Break + Add-On', 0, 0, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 7, 'Round 6', 75, 150, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 8, 'Round 7', 100, 200, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 9, 'Round 8', 200, 400, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 10, 'Round 9', 400, 800, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 11, 'Round 10', 800, 1600, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 12, 'Round 11', 1500, 3000, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 13, 'Round 12', 3000, 6000, 30, FALSE),
('00000000-0000-0000-0000-000000000003', 14, 'Round 13', 6000, 12000, 30, FALSE);

-- ============================================================
-- 4. WPT Style
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000004', NULL, 'WPT Style', 'Casino-grade structure. 60-min levels, slow escalation. A serious all-day tournament experience.', TRUE, 2000, 0, 0, 70, 20, 10, 10000, FALSE, FALSE, 0, FALSE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000004', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000004', 1, 'Level 1', 25, 50, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 2, 'Level 2', 50, 100, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 3, 'Level 3', 75, 150, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 4, 'Level 4', 100, 200, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 5, 'Break', 0, 0, 15, FALSE),
('00000000-0000-0000-0000-000000000004', 6, 'Level 5', 150, 300, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 7, 'Level 6', 200, 400, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 8, 'Level 7', 300, 600, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 9, 'Level 8', 400, 800, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 10, 'Break', 0, 0, 15, FALSE),
('00000000-0000-0000-0000-000000000004', 11, 'Level 9', 600, 1200, 60, FALSE),
('00000000-0000-0000-0000-000000000004', 12, 'Level 10', 1000, 2000, 60, FALSE);

-- ============================================================
-- 5. Quick Fire (under 1 hour)
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000005', NULL, 'Quick Fire', 'Lightning-fast 5-min levels, 8 rounds. Perfect when you only have an hour.', TRUE, 500, 500, 0, 100, 0, 0, 500, TRUE, FALSE, 0, FALSE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000005', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000005', 1, 'Round 1', 25, 50, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 2, 'Round 2', 50, 100, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 3, 'Round 3', 100, 200, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 4, 'Round 4', 200, 400, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 5, 'Round 5', 400, 800, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 6, 'Round 6', 800, 1600, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 7, 'Round 7', 1500, 3000, 5, FALSE),
('00000000-0000-0000-0000-000000000005', 8, 'Round 8', 3000, 6000, 5, FALSE);

-- ============================================================
-- 6. Freezeout (no rebuys)
-- ============================================================
INSERT INTO public.templates (id, user_id, name, description, is_system, buy_in_amount, rebuy_amount, addon_amount, prize_first_pct, prize_second_pct, house_fee_pct, starting_chips, allow_rebuys, allow_addons, fire_rounds_count, fire_rounds_before_break)
VALUES ('00000000-0000-0000-0000-000000000006', NULL, 'Freezeout', 'One life only. No rebuys, no add-ons. Classic elimination format — every chip matters.', TRUE, 500, 0, 0, 80, 20, 10, 1000, FALSE, FALSE, 0, FALSE);

INSERT INTO public.template_rounds (template_id, position, name, small_blind, big_blind, duration_minutes, is_test) VALUES
('00000000-0000-0000-0000-000000000006', 0, 'Test Round', 0, 0, 1, TRUE),
('00000000-0000-0000-0000-000000000006', 1, 'Round 1', 5, 10, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 2, 'Round 2', 10, 20, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 3, 'Round 3', 20, 40, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 4, 'Round 4', 40, 80, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 5, 'Round 5', 75, 150, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 6, 'Round 6', 150, 300, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 7, 'Round 7', 300, 600, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 8, 'Round 8', 600, 1200, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 9, 'Round 9', 1200, 2400, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 10, 'Round 10', 2500, 5000, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 11, 'Round 11', 5000, 10000, 20, FALSE),
('00000000-0000-0000-0000-000000000006', 12, 'Round 12', 10000, 20000, 20, FALSE);
