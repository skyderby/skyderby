# == Schema Information
#
# Table name: event_organizers
#
#  id         :integer          not null, primary key
#  event_id   :integer
#  profile_id :integer
#  created_at :datetime
#  updated_at :datetime
#

FactoryBot.define do
  factory :event_organizer, class: 'Organizer' do
    profile
    association :organizable, factory: :event
  end

  factory :tournament_organizer, class: 'Organizer' do
    profile
    association :organizable, factory: :tournament
  end
end
