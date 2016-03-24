# == Schema Information
#
# Table name: events
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  range_from        :integer
#  range_to          :integer
#  created_at        :datetime
#  updated_at        :datetime
#  status            :integer          default(0)
#  user_profile_id   :integer
#  place_id          :integer
#  is_official       :boolean          default(FALSE)
#  rules             :integer          default(0)
#  starts_at         :date
#  wind_cancellation :boolean          default(FALSE)
#

FactoryGirl.define do
  factory :event do
    sequence(:name) { |n| "Event#{n}" }
    starts_at Date.today
    range_from 3000
    range_to 2000
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
