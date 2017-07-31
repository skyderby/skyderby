# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

FactoryGirl.define do
  factory :virtual_comp_group do
    sequence(:name) { |n| "Group-#{n}" }
  end
end
