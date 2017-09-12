# == Schema Information
#
# Table name: tracks
#
#  id                                    :integer          not null, primary key
#  name                                  :string(510)
#  created_at                            :datetime
#  lastviewed_at                         :datetime
#  suit                                  :string(510)
#  comment                               :text
#  location                              :string(510)
#  user_id                               :integer
#  kind                                  :integer          default("skydive")
#  wingsuit_id                           :integer
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
      create :event_track, track: track

      track.destroy
      expect(track.destroyed?).to be_falsey
    end
  end

  describe '#delete' do
    it 'can not be deleted if track has competition result' do
      track = create :empty_track
      create :event_track, track: track

      expect { track.delete }.to raise_exception(ActiveRecord::InvalidForeignKey)
    end
  end
end
