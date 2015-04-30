FactoryGirl.define do
  factory :worldwide_online_event, class: 'VirtualCompetition' do
    name 'WW Comp'
    period_from Date.today.beginning_of_year
    period_to Date.today.end_of_year
    jumps_kind VirtualCompetition.jumps_kinds['skydive']
    suits_kind VirtualCompetition.suits_kinds['wingsuit']
  end

  factory :place_specific_online_event, class: 'VirtualCompetition' do
    name 'Place specific Comp'
    period_from Date.today.beginning_of_year
    period_to Date.today.end_of_year
    jumps_kind VirtualCompetition.jumps_kinds['skydive']
    suits_kind VirtualCompetition.suits_kinds['wingsuit']
    place
  end

  factory :last_year_online_event, class: 'VirtualCompetition' do
    name 'Last year Comp'
    period_from 1.year.ago.beginning_of_year
    period_to 1.year.ago.end_of_year
    jumps_kind VirtualCompetition.jumps_kinds['skydive']
    suits_kind VirtualCompetition.suits_kinds['wingsuit']
    place
  end
end
