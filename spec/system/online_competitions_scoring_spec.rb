require 'sidekiq/testing'

describe 'Scoring tracks in online competitions' do
  it 'Distance in time competition' do
    competition = virtual_competitions(:distance_in_time)

    track = create_track_from_file('06-38-21_SimonP.CSV').tap do |track|
      track.kind = :base
      track.save!
    end

    OnlineCompetitionJob.perform_now(track.id)

    results = track.virtual_comp_results.where(virtual_competition: competition)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(0.01).of(701.37)
    expect(record.highest_gr).to be_within(0.01).of(2.09)
    expect(record.highest_speed).to be_within(1).of(203)
  end

  it 'BASE Race' do
    competition = virtual_competitions(:base_race)

    track = create_track_from_file('WBR/Yegor_16_Round3.CSV').tap do |track|
      track.kind = :base
      track.save!
    end

    OnlineCompetitionJob.perform_now(track.id)

    results = track.virtual_comp_results.where(virtual_competition: competition)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(1).of(29.0)
  end
end
