# == Schema Information
#
# Table name: badges
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  kind       :integer
#  profile_id :integer
#  created_at :datetime
#  updated_at :datetime
#

FactoryBot.define do
  factory :badge do
    sequence(:name) { |n| "Badge-#{n}" }
    kind Badge.kinds['silver']
    profile
  end
end
