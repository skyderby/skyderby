FactoryGirl.define do
  factory :user_profile, aliases: [:responsible, :pilot] do
    sequence(:name) { |n| "pilot#{n}" }
  end
end
