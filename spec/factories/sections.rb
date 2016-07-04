# == Schema Information
#
# Table name: sections
#
#  id       :integer          not null, primary key
#  name     :string(510)
#  order    :integer
#  event_id :integer
#

FactoryGirl.define do
  factory :section do
    sequence(:name) { |n| "Place-#{n}" }
    sequence(:order) { |n| n }
    event
  end
end
