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
require 'support/event_ongoing_validation'

RSpec.describe EventOrganizer, type: :model do
  let(:event) do
    event = Event.new
    event.save!(validate: false)
    event
  end

  let(:profile) do
    profile = Profile.new
    profile.save!(validate: false)
    profile
  end

  it_should_behave_like 'event_ongoing_validation' do
    let(:target) { FactoryGirl.create(:event_organizer) }
  end

  it 'requires event' do
    expect(EventOrganizer.create(profile: profile)).not_to be_valid
  end

  it 'requires user profile' do
    expect(EventOrganizer.create(event: event)).not_to be_valid
  end
end
