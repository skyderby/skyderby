# == Schema Information
#
# Table name: countries
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

FactoryGirl.define do
  factory :country do
    sequence(:name) { |n| "Country-#{n}" }
    sequence(:code) { |n| n.to_s }

    trait :norway do
      name 'Norway'
      code 'no'

      initialize_with { Country.where(name: 'Norway').first_or_create }
    end
  end
end
