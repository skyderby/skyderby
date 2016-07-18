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

require 'spec_helper'

RSpec.describe EventOrganizer, type: :model do
  let(:event) do
    event = Event.new
    event.save!(validate: false)
    event
  end

  let(:user_profile) do
    user_profile = UserProfile.new
    user_profile.save!(validate: false)
    user_profile
  end

  it 'requires event' do
    expect(EventOrganizer.create(user_profile: user_profile)).not_to be_valid
  end

  it 'requires user profile' do
    expect(EventOrganizer.create(event: event)).not_to be_valid
  end
end
