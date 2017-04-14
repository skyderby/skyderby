# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

[:admin, :user].each do |name|
  next if Role.find_by(name: name)
  Role.create!(name: name)
  p "Role #{name} created"
end

manufacturers = YAML.load(File.open(Rails.root.join('db', 'seeds', 'manufacturers.yml')))
manufacturers.each do |attrs|
  next if Manufacturer.find_by(code: attrs['code'])
  Manufacturer.create!(attrs)
  p "Manufacturer #{attrs['name']} created"
end

suits = YAML.load(File.open(Rails.root.join('db', 'seeds', 'suits.yml')))
suits.each do |attrs|
  manufacturer = Manufacturer.find_by(code: attrs['manufacturer_code'])
  raise "Manufacturer with code #{attrs['manufacturer_code']} not found." unless manufacturer
  attrs.fetch('wingsuits', []).each do |suit_name|
    next if Wingsuit.find_by(manufacturer: manufacturer, name: suit_name)
    suit = Wingsuit.new(manufacturer: manufacturer, name: suit_name)
    suit.wingsuit!
    suit.save!
    p "Wingsuit #{attrs['manufacturer_code']} #{suit_name} created"
  end

  attrs.fetch('tracksuits', []).each do |suit_name|
    next if Wingsuit.find_by(manufacturer: manufacturer, name: suit_name)
    suit = Wingsuit.new(manufacturer: manufacturer, name: suit_name)
    suit.tracksuit!
    suit.save!
    p "Tracksuit #{attrs['manufacturer_code']} #{suit_name} created"
  end

  attrs.fetch('slicks', []).each do |suit_name|
    next if Wingsuit.find_by(manufacturer: manufacturer, name: suit_name)
    suit = Wingsuit.new(manufacturer: manufacturer, name: suit_name)
    suit.slick!
    suit.save!
    p "Slick suit #{attrs['manufacturer_code']} #{suit_name} created"
  end
end

countries = YAML.load(File.open(Rails.root.join('db', 'seeds', 'countries.yml')))
countries.each do |attrs|
  next if Country.find_by(code: attrs['code'])
  Country.create! attrs
  p "Country #{attrs['name']} created"
end

place_files = Dir.glob(Rails.root.join('db', 'seeds', 'places', '*'))
place_files.each do |file|
  data = YAML.load(File.open(file))
  country = Country.find_by(code: data['country_code'])
  raise "Can't load places from #{file}. Country with code #{data['country_code']} not found" unless country
  data['places'].each do |attrs|
    next if Place.find_by(country: country, name: attrs['name'])
    Place.create!(attrs.merge(country: country))
    p "Place #{data['country_code']} #{attrs['name']} created"
  end
end
