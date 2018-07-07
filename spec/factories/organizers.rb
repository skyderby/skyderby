# == Schema Information
#
# Table name: organizers
#
#  id               :integer          not null, primary key
#  organizable_id   :integer
#  profile_id       :integer
#  created_at       :datetime
#  updated_at       :datetime
#  organizable_type :string
#

FactoryBot.define do
  factory :event_organizer, class: 'Organizer' do
    user
    association :organizable, factory: :event
  end
end
