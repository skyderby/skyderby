# == Schema Information
#
# Table name: manufacturers
#
#  id   :integer          not null, primary key
#  name :string(255)
#  code :string(255)
#

FactoryGirl.define do
  factory :manufacturer do
    name 'Phoenix Fly'
  end
end
