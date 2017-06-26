FactoryGirl.define do
  factory :qualification_round do
    tournament
    sequence(:order)
  end
end
