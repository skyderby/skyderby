describe Track, type: :model do
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
