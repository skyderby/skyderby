# == Schema Information
#
# Table name: tournament_rounds
#
#  id            :integer          not null, primary key
#  order         :integer
#  tournament_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

FactoryGirl.define do
  factory :tournament_round do
    tournament
    sequence(:order)
  end
end
