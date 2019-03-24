# == Schema Information
#
# Table name: roles
#
#  id   :integer          not null, primary key
#  name :string(510)
#

FactoryBot.define do
  factory :role do
    trait :user do
      name { 'user' }
      initialize_with { Role.where(name: 'user').first_or_create }
    end

    trait :admin do
      name { 'admin' }
      initialize_with { Role.where(name: 'admin').first_or_create }
    end
  end
end
