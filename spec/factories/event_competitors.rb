# == Schema Information
#
# Table name: competitors
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#  suit_id    :integer
#  name       :string(510)
#  section_id :integer
#  profile_id :integer
#

FactoryBot.define do
  factory :event_competitor, class: Event::Competitor do
    profile
    suit
    section factory: 'event_section'
    event
  end
end
