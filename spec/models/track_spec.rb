# == Schema Information
#
# Table name: tracks
#
#  id                                    :integer          not null, primary key
#  name                                  :string(510)
#  created_at                            :datetime
#  updated_at                            :datetime
#  missing_suit_name                     :string(510)
#  comment                               :text
#  location                              :string(510)
#  user_id                               :integer
#  kind                                  :integer          default("skydive")
#  suit_id                               :integer
#  ff_start                              :integer
#  ff_end                                :integer
#  ge_enabled                            :boolean          default(TRUE)
#  visibility                            :integer          default("public_track")
#  profile_id                            :integer
#  place_id                              :integer
#  gps_type                              :integer          default("gpx")
#  file_file_name                        :string(510)
#  file_content_type                     :string(510)
#  file_file_size                        :integer
#  file_updated_at                       :datetime
#  track_file_id                         :integer
#  ground_level                          :decimal(5, 1)    default(0.0)
#  recorded_at                           :datetime
#  disqualified_from_online_competitions :boolean          default(FALSE), not null
#  data_frequency                        :decimal(3, 1)
#  missing_ranges                        :jsonb
#  require_range_review                  :boolean          default(FALSE), not null
#

describe Track, type: :model do
  describe 'validations' do
    it 'requires name if pilot not specified' do
      track = create :empty_track
      track.pilot = nil
      track.name = nil

      expect(track).not_to be_valid
    end

    it 'not require name if pilot specified' do
      track = create :empty_track
      track.pilot = create :profile
      track.name = nil

      expect(track).to be_valid
    end
  end

  describe '#destroy' do
    it 'can not destroy if track has competition result' do
      track = create :empty_track
      event_results(:distance_competitor_1).update_columns(track_id: track.id)

      track.destroy
      expect(track.destroyed?).to be_falsey
    end

    it 'cleans up online competition results ' do
      online_competition = virtual_competitions(:base_race)
      track = create :empty_track
      online_competition.results.create!(track: track, result: 123)

      expect { track.destroy }.to change { online_competition.results.count }.by(-1)
    end
  end

  describe '#delete' do
    it 'can not be deleted if track has competition result' do
      track = create :empty_track
      event_results(:distance_competitor_1).update_columns(track_id: track.id)

      expect { track.delete }.to raise_exception(ActiveRecord::InvalidForeignKey)
    end
  end

  describe '#delete_online_competitions_results' do
    it 'deletes all results' do
      online_competition = virtual_competitions(:skydive_distance)
      track = create :empty_track
      results = [
        online_competition.results.create!(track: track, result: 123),
        online_competition.results.create!(track: track, result: 123, wind_cancelled: true)
      ]

      expect { track.delete_online_competitions_results }
        .to change { online_competition.results.where(id: results.map(&:id)).count }.from(2).to(0)
    end
  end
end
