# == Schema Information
#
# Table name: tournament_matches
#
#  id                    :integer          not null, primary key
#  start_time_in_seconds :decimal(17, 3)
#  tournament_round_id   :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  match_type            :integer          default("regular"), not null
#

FactoryGirl.define do
  factory :tournament_match do
    association :round, factory: :tournament_round
  end
end
