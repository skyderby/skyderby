# == Schema Information
#
# Table name: competitors
#
#  id          :integer          not null, primary key
#  event_id    :integer
#  user_id     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  wingsuit_id :integer
#  name        :string(510)
#  section_id  :integer
#  profile_id  :integer
#

FactoryGirl.define do
  factory :badge do
    sequence(:name) { |n| "Badge-#{n}" }
    kind Badge.kinds['silver']
    profile
  end
end
