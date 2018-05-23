# == Schema Information
#
# Table name: virtual_comp_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

FactoryBot.define do
  factory :virtual_competition_group, class: VirtualCompetition::Group do
    sequence(:name) { |n| "Group-#{n}" }
  end
end
