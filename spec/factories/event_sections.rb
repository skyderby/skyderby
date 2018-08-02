# == Schema Information
#
# Table name: sections
#
#  id       :integer          not null, primary key
#  name     :string(510)
#  order    :integer
#  event_id :integer
#

FactoryBot.define do
  factory :event_section, class: Event::Section do
    sequence(:name) { |n| "Section-#{n}" }
    sequence(:order) { |n| n }
    event
  end
end
