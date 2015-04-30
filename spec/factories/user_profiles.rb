FactoryGirl.define do
  factory :pilot, class: 'UserProfile' do
    sequence(:name) { |n| "pilot#{n}" }
  end
end
