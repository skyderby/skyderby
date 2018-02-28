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
  it 'has status: Draft' do
    expect(event.status).to eql 'draft'
  end

  it 'generate name if not specified' do
    expect(event.name).to be_present
  end

  it 'fill range if not specified' do
    expect(event.range_from).to be_present
    expect(event.range_to).to be_present
  end

  it 'fill responsible' do
    expect(event.responsible).to eql(user)
  end

  it 'blank responsible does not allowed' do
    expect(Event.create(responsible: nil)).not_to be_valid
  end

  def event
    @event = Event.create!(responsible: user, starts_at: Time.zone.today)
  end

  describe 'best and worst summary' do
    it 'returns best and worst' do
      event = create :event
      round1 = create :round, event: event
      round2 = create :round, event: event
      section = create :section, event: event
      competitor1 = create :competitor, section: section
      competitor2 = create :competitor, section: section

      create :event_track, round: round1, competitor: competitor1, result_net: 95
      create :event_track, round: round1, competitor: competitor2, result_net: 105
      create :event_track, round: round2, competitor: competitor1, result_net: 115
      create :event_track, round: round2, competitor: competitor2, result_net: 125

      expect(event.best_result_in(round: round1, net: true).result_net).to eq 105
      expect(event.best_result_in(section: section, net: true).result_net).to eq 125
      expect(event.worst_result_in(round: round2, net: true).result_net).to eq 115
      expect(event.worst_result_in(section: section, net: true).result_net).to eq 95
    end
  end

  describe 'changes visibility of tracks on event visibility change' do
    it 'changes to public if event becomes public' do
      event = create :event, visibility: Event.visibilities[:private_event]
      section = create :section, event: event
      competitor = create :competitor, section: section
      round = create :round, event: event
      track = create :empty_track, visibility: Track.visibilities[:unlisted_track]
      event_track = create :event_track, competitor: competitor, round: round, track: track

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
      event_track = create :event_track, competitor: competitor, round: round, track: track

      event.private_event!
      track.reload

      expect(track.unlisted_track?).to be_truthy
    end
  end

  def user
    @user ||= create :user
  end
end
