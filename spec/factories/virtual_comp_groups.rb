# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

FactoryGirl.define do
  factory :virtual_comp_group do
    sequence(:name) { |n| "Group-#{n}" }
  end
end
