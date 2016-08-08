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

FactoryGirl.define do
  factory :round do
    event
    discipline { Round.disciplines.keys.sample }
  end
end
