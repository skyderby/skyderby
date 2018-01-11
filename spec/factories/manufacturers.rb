# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(510)
#  code :string(510)
#

FactoryBot.define do
  factory :manufacturer do
    name 'Phoenix Fly'
    code 'PF'

    initialize_with { Manufacturer.where(code: 'PF').first_or_create }
  end
end
