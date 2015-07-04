# == Schema Information
#
# Table name: events
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  range_from      :integer
#  range_to        :integer
#  created_at      :datetime
#  updated_at      :datetime
#  status          :integer          default(0)
#  user_profile_id :integer
#  place_id        :integer
#  is_official     :boolean          default(FALSE)
#

FactoryGirl.define do
  factory :event do
    sequence(:name) { |n| "Event#{n}" }
    range_from Date.today.beginning_of_year
    range_to Date.today.end_of_year
    responsible

    trait :place_specific do
      place
    end

    trait :draft do
      status Event.statuses['draft']
    end

    trait :published do
      status Event.statuses['published']
    end
  end
end
