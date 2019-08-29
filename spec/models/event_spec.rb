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
#  responsible_id              :integer
#

describe Event do
  describe 'Initial state' do
    subject do
      Event.create!(responsible: user, starts_at: Time.zone.today)
    end

    it 'has status: Draft' do
      expect(subject.status).to eql 'draft'
    end

    it 'generate name if not specified' do
      expect(subject.name).to be_present
    end

    it 'fill range if not specified' do
      expect(subject.range_from).to be_present
      expect(subject.range_to).to be_present
    end

    it 'fill responsible' do
      expect(subject.responsible).to eql(user)
    end

    it 'apply penalty to score' do
      expect(subject.apply_penalty_to_score).to be_falsey
    end

    it 'start DL on 10 sec' do
      expect(subject.designated_lane_start).to eq('on_10_sec')
    end
  end

  it 'blank responsible does not allowed' do
    expect(Event.create(responsible: nil)).not_to be_valid
  end

  describe 'changes visibility of tracks on event visibility change' do
    it 'changes to public if event becomes public' do
      event = create :event, visibility: Event.visibilities[:private_event]
      section = create :event_section, event: event
      competitor = create :event_competitor, section: section
      round = create :event_round, event: event
      track = create :empty_track, visibility: Track.visibilities[:unlisted_track]
      create :event_result, competitor: competitor, round: round, track: track

      event.public_event!
      track.reload

      expect(track.public_track?).to be_truthy
    end

    it 'changes to unlisted if event becomes unlisted or private' do
      event = create :event, visibility: Event.visibilities[:public_event]
      section = create :event_section, event: event
      competitor = create :event_competitor, section: section
      round = create :event_round, event: event
      track = create :empty_track, visibility: Track.visibilities[:public_track]
      create :event_result, competitor: competitor, round: round, track: track

      event.private_event!
      track.reload

      expect(track.unlisted_track?).to be_truthy
    end
  end

  def user
    @user ||= create :user
  end
end
