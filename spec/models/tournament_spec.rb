# == Schema Information
#
# Table name: tournaments
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  place_id          :integer
#  discipline        :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  finish_start_lat  :decimal(15, 10)
#  finish_start_lon  :decimal(15, 10)
#  finish_end_lat    :decimal(15, 10)
#  finish_end_lon    :decimal(15, 10)
#  starts_at         :date
#  exit_lat          :decimal(15, 10)
#  exit_lon          :decimal(15, 10)
#  profile_id        :integer
#  bracket_size      :integer
#  has_qualification :boolean
#

describe Tournament, type: :model do
  describe '#with_qualification?' do
    it 'returns true if has qulification' do
      tournament = create :tournament, has_qualification: true

      expect(tournament.with_qualification?).to be_truthy
    end

    it 'returns false unless has_qualification' do
      tournament = create :tournament
      expect(tournament.with_qualification?).to be_falsey
    end
  end
end
