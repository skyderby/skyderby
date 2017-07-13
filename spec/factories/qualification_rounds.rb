# == Schema Information
#
# Table name: qualification_rounds
#
#  id            :integer          not null, primary key
#  tournament_id :integer
#  order         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

FactoryGirl.define do
  factory :qualification_round do
    tournament
    sequence(:order)
  end
end
