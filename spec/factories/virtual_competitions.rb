FactoryGirl.define do
  factory :online_event, class: 'VirtualCompetition' do
    sequence(:name) { |n| "Online event#{n}" }
    period_from Date.today.beginning_of_year
    period_to Date.today.end_of_year
    jumps_kind VirtualCompetition.jumps_kinds['skydive']
    suits_kind VirtualCompetition.suits_kinds['wingsuit']

    trait :place_specific do
      place
    end

    trait :last_year do
      period_from 1.year.ago.beginning_of_year
      period_to 1.year.ago.end_of_year
    end
  end
end
