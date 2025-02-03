# == Schema Information
#
# Table name: rounds
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  event_id   :integer
#  created_at :datetime
#  updated_at :datetime
#  discipline :integer
#  profile_id :integer
#

FactoryBot.define do
  factory :event_round, class: PerformanceCompetition::Round do
    event
    discipline { PerformanceCompetition::Round.disciplines.keys.sample }
  end
end
