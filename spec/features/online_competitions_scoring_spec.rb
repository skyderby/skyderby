require 'spec_helper'
require 'sidekiq/testing'

feature 'Scoring tracks in online competitions' do
  before do
    Sidekiq::Testing.inline!
  end

  scenario 'Distance in time competition' do
    online_competition = VirtualCompetition.create!(
      name: 'Distance in time competition',
      jumps_kind: :base,
      suits_kind: :wingsuit,
      period_from: Date.parse('2015-01-01'),
      period_to: Date.parse('2015-12-31'),
      discipline: :distance_in_time,
      discipline_parameter: 20)

    track = create_track_from_file '06-38-21_SimonP.CSV'
    track.kind = :base
    track.save!
    track.run_callbacks(:commit)

    expect(track.virtual_comp_results.count).to eq(1)

    record = track.virtual_comp_results.first
    expect(record.result).to be_within(0.01).of(700.73)
    expect(record.highest_gr).to be_within(0.01).of(2.09)
    expect(record.highest_speed).to be_within(1).of(203)
  end

  def create_track_from_file filename
    pilot = create :pilot
    suit = create :wingsuit

    track_file = TrackFile.create(
      file: File.new("#{Rails.root}/spec/support/tracks/#{filename}")
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      wingsuit: suit
    }
    CreateTrackService.new(pilot.user, params, 0).execute
  end
end
