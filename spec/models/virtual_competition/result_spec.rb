# == Schema Information
#
# Table name: virtual_comp_results
#
#  id                     :integer          not null, primary key
#  virtual_competition_id :integer
#  track_id               :integer
#  result                 :float            default(0.0)
#  created_at             :datetime
#  updated_at             :datetime
#  highest_speed          :float            default(0.0)
#  highest_gr             :float            default(0.0)
#

describe VirtualCompetition::Result do
  it 'validates uniqueness by virtual competition and track' do
    existed_record = VirtualCompetition::Result.create!(valid_attributes)
    duplicated_record = VirtualCompetition::Result.new(valid_attributes)

    expect(duplicated_record).not_to be_valid
  end

  def valid_attributes
    @valid_attributes ||= {
      track: create(:empty_track),
      virtual_competition: virtual_competitions(:base_race)
    }
  end
end
