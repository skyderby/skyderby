# == Schema Information
#
# Table name: wingsuits
#
#  id              :integer          not null, primary key
#  manufacturer_id :integer
#  ws_class_id     :integer
#  name            :string(255)
#  kind            :integer          default(0)
#

FactoryGirl.define do
  factory :wingsuit do
    name 'Ghost 3'
    manufacturer
  end
end
