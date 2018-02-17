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
#  name                  :string(510)
#  virtual_comp_group_id :integer
#  range_from            :integer          default(0)
#  range_to              :integer          default(0)
#  display_highest_speed :boolean
#  display_highest_gr    :boolean
#  display_on_start_page :boolean
#  default_view          :integer          default("default_overall"), not null
#

FactoryBot.define do
  factory :virtual_competition, aliases: [:online_event] do
    sequence(:name) { |n| "Online event#{n}" }
    association :group, factory: :virtual_comp_group

    discipline { VirtualCompetition.disciplines.values.sample }

    period_from Date.today.beginning_of_year
    period_to Date.today.end_of_year
    jumps_kind VirtualCompetition.jumps_kinds['skydive']
    suits_kind VirtualCompetition.suits_kinds['wingsuit']

    trait :place_specific do
      association :place, factory: [:place, :gridset]
    end

    trait :last_year do
      period_from 1.year.ago.beginning_of_year
      period_to 1.year.ago.end_of_year
    end
  end
end
