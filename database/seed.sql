-- ============================================================
-- Seed Data for ph_transport_waits
-- ============================================================

USE `ph_transport_waits`;

-- Transport Types
INSERT INTO `transport_types` (`slug`, `label`, `icon`) VALUES
  ('jeepney', 'Jeepney',     '🚐'),
  ('bus',     'Bus',         '🚌'),
  ('uv',     'UV Express',  '🚗'),
  ('train',  'Train',       '🚆'),
  ('other',  'Other',       '🚍')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);

-- Routes (Iloilo City area + Metro Manila samples)
INSERT INTO `routes` (`route_code`, `transport_type_id`, `route_name`, `origin`, `destination`, `estimated_fare`, `estimated_duration_minutes`) VALUES
  ('route-001', 1, 'City Proper - Jaro',              'Iloilo City Proper', 'Jaro',              13.00, 25),
  ('route-002', 2, 'City Proper - Airport',            'Iloilo City Proper', 'Iloilo Airport',    30.00, 40),
  ('route-003', 1, 'Jaro - Mandurriao',                'Jaro',               'Mandurriao',        13.00, 20),
  ('route-004', 3, 'SM City - Oton',                   'SM City Iloilo',     'Oton',              25.00, 30),
  ('route-005', 1, 'Molo - La Paz',                    'Molo',               'La Paz',            13.00, 15),
  ('route-006', 2, 'Tagbak Terminal - Passi City',     'Tagbak Terminal',    'Passi City',         80.00, 60),
  ('route-007', 3, 'Jaro - Pavia',                     'Jaro',               'Pavia',             20.00, 25),
  ('route-008', 1, 'City Proper - Arevalo',            'Iloilo City Proper', 'Arevalo',           13.00, 20),
  ('route-009', 4, 'North Avenue - Taft Avenue',       'North Avenue',       'Taft Avenue',       15.00, 30),
  ('route-010', 2, 'Cubao - Alabang',                  'Cubao',              'Alabang',            55.00, 90),
  ('route-011', 1, 'Quiapo - Divisoria',               'Quiapo',             'Divisoria',         13.00, 15),
  ('route-012', 3, 'Makati - Antipolo',                'Makati CBD',         'Antipolo',           60.00, 75)
ON DUPLICATE KEY UPDATE `route_name` = VALUES(`route_name`);

-- Waiting Times (initial demo data)
INSERT INTO `waiting_times` (`route_id`, `estimated_wait_minutes`, `status`, `passenger_count`, `is_demo`, `recorded_at`) VALUES
  (1,  18, 'delayed',       25, 1, NOW()),
  (2,  10, 'normal',        12, 1, NOW()),
  (3,  22, 'delayed',       30, 1, NOW()),
  (4,   8, 'normal',         8, 1, NOW()),
  (5,  15, 'moderate',      18, 1, NOW()),
  (6,  35, 'very-delayed',  45, 1, NOW()),
  (7,  12, 'moderate',      15, 1, NOW()),
  (8,  20, 'delayed',       22, 1, NOW()),
  (9,   5, 'normal',        40, 1, NOW()),
  (10, 25, 'delayed',       35, 1, NOW()),
  (11, 14, 'moderate',      20, 1, NOW()),
  (12, 30, 'very-delayed',  28, 1, NOW());

-- Stats (initial)
INSERT INTO `stats` (`stat_key`, `stat_value`, `stat_label`) VALUES
  ('total_routes',       '12',           'Active Routes'),
  ('avg_wait_time',      '17.8 min',     'Avg. Wait Time'),
  ('total_reports',      '1,247',        'Reports Filed'),
  ('commuters_helped',   '15,000+',      'Commuters Helped')
ON DUPLICATE KEY UPDATE `stat_value` = VALUES(`stat_value`);
