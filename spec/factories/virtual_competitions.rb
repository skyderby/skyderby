# == Schema Information
#
# Table name: virtual_competitions
#
#  id                    :integer          not null, primary key
#  jumps_kind            :integer
#  suits_kind            :integer
#  place_id              :integer
#  period_from           :date
#  period_to             :date
#  discipline            :integer
#  discipline_parameter  :integer          default(0)
#  created_at            :datetime
#  updated_at            :datetime
#  name                  :string(255)
#  virtual_comp_group_id :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean          default(FALSE)
#  display_highest_gr    :boolean          default(FALSE)
#

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
