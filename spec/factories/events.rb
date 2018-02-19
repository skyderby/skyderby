# == Schema Information
#
# Table name: events
#
#  id                          :integer          not null, primary key
#  name                        :string(510)
#  range_from                  :integer
#  range_to                    :integer
#  created_at                  :datetime
#  updated_at                  :datetime
#  status                      :integer          default("draft")
#  profile_id                  :integer
#  place_id                    :integer
#  is_official                 :boolean
#  rules                       :integer          default("speed_distance_time")
#  starts_at                   :date
#  wind_cancellation           :boolean          default(FALSE)
#  visibility                  :integer          default("public_event")
#  number_of_results_for_total :integer
#  responsible_id              :integer
#

FactoryBot.define do
  factory :event do
    sequence(:name) { |n| "Event#{n}" }
    starts_at Time.zone.today
    range_from 3000
    range_to 2000
    association :responsible, factory: :user

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
