FactoryGirl.define do
  factory :tournament_round do
    tournament
    sequence(:order)
  end
end
