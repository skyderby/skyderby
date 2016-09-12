# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string(510)      default(""), not null
#  encrypted_password     :string(510)      default(""), not null
#  reset_password_token   :string(510)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(510)
#  last_sign_in_ip        :string(510)
#  created_at             :datetime
#  updated_at             :datetime
#  confirmation_token     :string(510)
#  confirmed_at           :datetime
#  confirmation_sent_at   :datetime
#  unconfirmed_email      :string(510)
#

FactoryGirl.define do
  factory :user do
    sequence(:name) { |n| "Василий-#{n}" }
    sequence(:email) { |n| "person-#{n}@example.com" }
    password 'secret'
    password_confirmation 'secret'
    confirmed_at Time.now

    trait :admin do
      after(:create) do |user|
        admin_role = create(:role, :admin)
        create(:assignment, user: user, role: admin_role)
      end
    end
  end
end
