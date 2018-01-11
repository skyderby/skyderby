# == Schema Information
#
# Table name: events
#
#  id                          :integer          not null, primary key
#  name                        :string(510)
#  range_from                  :integer
#  range_to                    :integer
#  created_at                  :datetime
#  updated_at                  :datetime
#  status                      :integer          default("draft")
#  profile_id                  :integer
#  place_id                    :integer
#  is_official                 :boolean
#  rules                       :integer          default("speed_distance_time")
#  starts_at                   :date
#  wind_cancellation           :boolean          default(FALSE)
#  visibility                  :integer          default("public_event")
#  number_of_results_for_total :integer
#

require 'spec_helper'
require 'rails_helper'

describe Event, type: :model do
  before :all do
    @user = FactoryBot.create(:user)
    @event = Event.create!(responsible: @user.profile, starts_at: Date.today)
  end

  it 'has status: Draft' do
    expect(@event.status).to eql 'draft'
  end

  it 'generate name if not specified' do
    expect(@event.name).to be_present
  end

  it 'fill range if not specified' do
    expect(@event.range_from).to be_present
    expect(@event.range_to).to be_present
  end

  it 'fill responsible' do
    expect(@event.responsible).to eql(@user.profile)
  end

  it 'blank responsible does not allowed' do
    expect(Event.create(responsible: nil)).not_to be_valid
  end

  describe 'changes visibility of tracks on event visibility change' do
    it 'changes to public if event becomes public' do
      event = create :event, visibility: Event.visibilities[:private_event]
      section = create :section, event: event
      competitor = create :competitor, section: section
      round = create :round, event: event
      track = create :empty_track, visibility: Track.visibilities[:unlisted_track]
      event_track = create :event_track, competitor: competitor, round: round,  track: track

      event.public_event!
      track.reload

      expect(track.public_track?).to be_truthy
    end

    it 'changes to unlisted if event becomes unlisted or private' do
      event = create :event, visibility: Event.visibilities[:public_event]
      section = create :section, event: event
      competitor = create :competitor, section: section
      round = create :round, event: event
      track = create :empty_track, visibility: Track.visibilities[:public_track]
      event_track = create :event_track, competitor: competitor, round: round,  track: track

      event.private_event!
      track.reload

      expect(track.unlisted_track?).to be_truthy
    end
  end
end
