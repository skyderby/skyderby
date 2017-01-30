FactoryGirl.define do
  factory :tournament_match do
    association :round, factory: :tournament_round
  end
end
