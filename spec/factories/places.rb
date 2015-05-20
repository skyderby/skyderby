FactoryGirl.define do
  factory :place do
    id 1
    country
    name 'Gridset'
    latitude '62.5203062'
    longitude '7.5773933'
    msl '8'
    initialize_with { Place.where(id: 1).first_or_create }
  end
end
