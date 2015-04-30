FactoryGirl.define do

  sequence(:email) { |n| "person-#{n}@example.com" }
  sequence(:count)

  factory :user do
    name 'Василий'
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

  factory :country do
    name 'Norway'
  end
 
  factory :point do
    latitude '62.5203062'
    longitude '7.5773933'
  end

  factory :manufacturer do
    name 'Phoenix Fly'
  end

  factory :wingsuit do
    name 'Ghost 3'
    manufacturer
  end
end
