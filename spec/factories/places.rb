# == Schema Information
#
# Table name: places
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  latitude    :decimal(15, 10)
#  longitude   :decimal(15, 10)
#  information :text(65535)
#  country_id  :integer
#  msl         :integer
#

FactoryGirl.define do
  factory :place do
    sequence(:name) { |n| "Place-#{n}" }
    country
    latitude '10'
    longitude '-10'
    msl '8'

    trait :gridset do
      association :country, factory: [:country, :norway]
      name 'Gridset'
      latitude '62.5203062'
      longitude '7.5773933'
      msl '8'
      initialize_with { Place.where(name: 'Gridset').first_or_create }
    end
  end
end
