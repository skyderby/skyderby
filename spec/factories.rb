FactoryGirl.define do

  sequence(:email) { |n| "person-#{n}@example.com" }
  sequence(:count)

  factory :user do
    email
    password 'secret'
    password_confirmation 'secret'
    confirmed_at Time.now
  end

  factory :role do
    factory :user_role do
      name 'user'
    end

    factory :admin_role do
      name 'admin'
    end

    factory :create_events_role do
      name 'create_events'
    end
  end

 end