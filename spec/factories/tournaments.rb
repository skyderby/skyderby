FactoryGirl.define do
  factory :tournament do
    sequence(:name) { |n| "Tournament-#{n}" }
    responsible
  end
end
