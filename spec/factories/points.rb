FactoryBot.define do
  factory :point do
    abs_altitude 700
    latitude '62.5203062'
    longitude '7.5773933'
    gps_time_in_seconds 1.year.ago.to_f
  end
end
