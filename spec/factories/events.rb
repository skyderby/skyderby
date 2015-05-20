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
