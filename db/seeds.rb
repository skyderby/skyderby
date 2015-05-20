# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

# TODO - first or create
Role.create(name: :admin)
Role.create(name: :user)
Role.create(name: :create_events)

Discipline.create(name: 'Speed')
Discipline.create(name: 'Distance')
Discipline.create(name: 'Time')

t_class = WsClass.create(name: 'TrackSuit')
r_class = WsClass.create(name: 'Rookie')
i_class = WsClass.create(name: 'Intermediate')
a_class = WsClass.create(name: 'Advanced')

# Phoenix Fly
pf = Manufacturer.create(name: 'Phoenix Fly')

Wingsuit.create(name: 'Prodigy', manufacturer: pf, ws_class: r_class)
Wingsuit.create(name: 'Acro', manufacturer: pf, ws_class: r_class)
Wingsuit.create(name: 'Shadow', manufacturer: pf, ws_class: r_class)

# Phantom series
Wingsuit.create(name: 'Phantom 1', manufacturer: pf, ws_class: r_class)
Wingsuit.create(name: 'Phantom 2', manufacturer: pf, ws_class: r_class)
Wingsuit.create(name: 'Phantom 2z', manufacturer: pf, ws_class: r_class)
Wingsuit.create(name: 'Phantom 3', manufacturer: pf, ws_class: r_class)

# Ghost series
Wingsuit.create(name: 'Ghost 1', manufacturer: pf, ws_class: i_class)
Wingsuit.create(name: 'Ghost 2', manufacturer: pf, ws_class: i_class)
Wingsuit.create(name: 'Ghost 3', manufacturer: pf, ws_class: i_class)

Wingsuit.create(name: 'Havok', manufacturer: pf, ws_class: i_class)
Wingsuit.create(name: 'Stealth 1', manufacturer: pf, ws_class: i_class)
Wingsuit.create(name: 'Vampire 1', manufacturer: pf, ws_class: i_class)
Wingsuit.create(name: 'Vampire 2', manufacturer: pf, ws_class: i_class)

Wingsuit.create(name: 'Stealth 2', manufacturer: pf, ws_class: a_class)

Wingsuit.create(name: 'Vampire 3', manufacturer: pf, ws_class: a_class)
Wingsuit.create(name: 'Vampire 4', manufacturer: pf, ws_class: a_class)
Wingsuit.create(name: 'Vampire 5', manufacturer: pf, ws_class: a_class)
Wingsuit.create(name: 'Vampire Race', manufacturer: pf, ws_class: a_class)

Wingsuit.create(name: 'Venom', manufacturer: pf, ws_class: a_class)
Wingsuit.create(name: 'Venom Power', manufacturer: pf, ws_class: a_class)
Wingsuit.create(name: 'Viper', manufacturer: pf, ws_class: a_class)

Wingsuit.create(name: 'Track suit', manufacturer: pf, ws_class: t_class)
Wingsuit.create(name: 'Power tracking suit', manufacturer: pf, ws_class: t_class)

# Tony Suit
ts = Manufacturer.create(name: 'Tony Suit')

Wingsuit.create(name: 'Intro', manufacturer: ts, ws_class: r_class)
Wingsuit.create(name: 'I-Bird', manufacturer: ts, ws_class: r_class)
Wingsuit.create(name: 'Eagle', manufacturer: ts, ws_class: r_class)
Wingsuit.create(name: 'T-Bird', manufacturer: ts, ws_class: r_class)

Wingsuit.create(name: 'R-Bird', manufacturer: ts, ws_class: i_class)
Wingsuit.create(name: 'Raptor', manufacturer: ts, ws_class: i_class)
Wingsuit.create(name: 'Nebula', manufacturer: ts, ws_class: i_class)
Wingsuit.create(name: 'Mach Series', manufacturer: ts, ws_class: i_class)

Wingsuit.create(name: 'M-Wing', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'S-Bird', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'X-Bird', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'X-Wing', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Xs', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Super Mach Series', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Apache Series', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Rebel Series', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Jedei Series', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Fusion Series', manufacturer: ts, ws_class: a_class)
Wingsuit.create(name: 'Scorpion Series', manufacturer: ts, ws_class: a_class)

Wingsuit.create(name: 'Masai tracking suit', manufacturer: ts, ws_class: t_class)

# Bird Man
bm = Manufacturer.create(name: 'Bird Man')

Wingsuit.create(name: 'Classic Series', manufacturer: bm, ws_class: r_class)
Wingsuit.create(name: 'GTI', manufacturer: bm, ws_class: r_class)
Wingsuit.create(name: 'Firebird Series', manufacturer: bm, ws_class: r_class)

Wingsuit.create(name: 'Phi', manufacturer: bm, ws_class: i_class)
Wingsuit.create(name: 'Skyflyer Series', manufacturer: ts, ws_class: i_class)
Wingsuit.create(name: 'Tengu', manufacturer: bm, ws_class: i_class)
Wingsuit.create(name: 'Blade 1', manufacturer: bm, ws_class: i_class)
Wingsuit.create(name: 'Blade 2', manufacturer: bm, ws_class: i_class)
Wingsuit.create(name: 'Ninja', manufacturer: bm, ws_class: i_class)

Wingsuit.create(name: 'Blade 3', manufacturer: bm, ws_class: a_class)
Wingsuit.create(name: 'Katana', manufacturer: bm, ws_class: a_class)

# S-Fly
sf = Manufacturer.create(name: 'S-Fly')

Wingsuit.create(name: 'Access', manufacturer: sf, ws_class: r_class)
Wingsuit.create(name: 'Indy', manufacturer: sf, ws_class: r_class)
Wingsuit.create(name: 'Expert', manufacturer: sf, ws_class: r_class)

Wingsuit.create(name: 'Verso', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'Hawk', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'Profly', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'Elite', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'MTR 1', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'MTR 2', manufacturer: sf, ws_class: i_class)
Wingsuit.create(name: 'MTR 3', manufacturer: sf, ws_class: i_class)

Wingsuit.create(name: 'Fleet', manufacturer: sf, ws_class: a_class)
Wingsuit.create(name: 'Fury', manufacturer: sf, ws_class: a_class)

Wingsuit.create(name: 'Cruise', manufacturer: sf, ws_class: t_class)

# Pressurized
pr = Manufacturer.create(name: 'Pressurized')

Wingsuit.create(name: 'Twenty G Series', manufacturer: pr, ws_class: r_class)
Wingsuit.create(name: 'Trigger', manufacturer: pr, ws_class: i_class)

# Jii Wings
ji = Manufacturer.create(name: 'Jii Wings')

Wingsuit.create(name: 'Glide System 1', manufacturer: ji, ws_class: i_class)

# Nitro Rigging
nr = Manufacturer.create(name: 'Nitro Rigging')

Wingsuit.create(name: 'Flockus', manufacturer: nr, ws_class: i_class)
Wingsuit.create(name: 'Pipistrellus', manufacturer: nr, ws_class: i_class)
Wingsuit.create(name: 'Psycho', manufacturer: nr, ws_class: i_class)
Wingsuit.create(name: 'Rigor Mortis', manufacturer: nr, ws_class: i_class)
Wingsuit.create(name: 'XXX', manufacturer: nr, ws_class: a_class)

# Sugar Glider
sg = Manufacturer.create(name: 'Sugar Glider')

Wingsuit.create(name: 'Sugar Glider', manufacturer: sg, ws_class: i_class)

# Parasport Italia
pi = Manufacturer.create(name: 'Parasport Italia')

Wingsuit.create(name: 'Crossbow', manufacturer: pi, ws_class: r_class)

# Dakine Suit
ds = Manufacturer.create(name: 'Dakine Suit')

Wingsuit.create(name: 'Soaring Suit', manufacturer: ds, ws_class: r_class)

# Intrud Air
ia = Manufacturer.create(name: 'Intrud Air')

Wingsuit.create(name: 'Piranha Series', manufacturer: ia, ws_class: r_class)

Wingsuit.create(name: 'Barracuda', manufacturer: ia, ws_class: i_class)

Wingsuit.create(name: 'Shark', manufacturer: ia, ws_class: a_class)
Wingsuit.create(name: 'Manta', manufacturer: ia, ws_class: a_class)

Wingsuit.create(name: 'Tracking suit', manufacturer: ia, ws_class: t_class)

# Alien Suit
as = Manufacturer.create(name: 'Alien Suit')

Wingsuit.create(name: 'G-1 (Beginner)', manufacturer: as, ws_class: i_class)
Wingsuit.create(name: 'G-5 (Intermediate)', manufacturer: as, ws_class: i_class)

Wingsuit.create(name: 'G-7 (Advanced)', manufacturer: as, ws_class: a_class)
Wingsuit.create(name: 'G-12 (Expert)', manufacturer: as, ws_class: a_class)

# Squirrel Suits
ss = Manufacturer.create(name: 'Squirrel Suits')

Wingsuit.create(name: 'Swift', manufacturer: ss, ws_class: i_class)

Wingsuit.create(name: 'Colugo', manufacturer: ss, ws_class: a_class)
Wingsuit.create(name: 'Aura', manufacturer: ss, ws_class: a_class)

Wingsuit.create(name: 'Sumo track suit', manufacturer: ss, ws_class: t_class)

# Parasuit
ps = Manufacturer.create(name: 'Parasuit')

Wingsuit.create(name: 'Joy', manufacturer: ps, ws_class: i_class)
Wingsuit.create(name: 'Chimera', manufacturer: ss, ws_class: a_class)

Wingsuit.create(name: 'Track suit', manufacturer: ps, ws_class: t_class)

# Baseguru

bg = Manufacturer.create(name: 'Baseguru')

Wingsuit.create(name: 'Track suit', manufacturer: bg, ws_class: t_class)
