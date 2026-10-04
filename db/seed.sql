-- Seed اولیه‌ی دسته‌بندی مصالح (فاز MVP) — متریاب (MatYab)

INSERT INTO material_categories (id, name, parent_id) VALUES
    ('cat_rebar',    'میلگرد',            NULL),
    ('cat_cement',   'سیمان و بلوک',      NULL),
    ('cat_tile',     'کاشی و سرامیک',     NULL),
    ('cat_door_win', 'درب و پنجره',       NULL),
    ('cat_pipe',     'لوله و اتصالات',    NULL),
    ('cat_insulation','عایق',             NULL),
    ('cat_wood',     'چوب',               NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id;

INSERT INTO material_categories (id, name, parent_id) VALUES
    ('cat_rebar_8',  'میلگرد ۸ میل',  'cat_rebar'),
    ('cat_rebar_12', 'میلگرد ۱۲ میل', 'cat_rebar'),
    ('cat_block',    'بلوک سیمانی',   'cat_cement')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id;
