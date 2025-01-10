# == Schema Information
#
# Table name: tournament_match_competitors
#
#  id                       :integer          not null, primary key
#  result                   :decimal(10, 3)
#  tournament_competitor_id :integer
#  tournament_match_id      :integer
#  track_id                 :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  is_winner                :boolean
#  is_disqualified          :boolean
#  is_lucky_looser          :boolean
#  notes                    :string(510)
#  earn_medal               :integer
#

describe Tournament::Match::Slot do
  it 'replace NaN in result with 0.0' do
    record = Tournament::Match::Slot.create(attributes.merge(result: BigDecimal::NAN))

    expect(record.result).to eq 0.0
  end

  it 'replace Infinity in result with 0.0' do
    record = Tournament::Match::Slot.create!(attributes.merge(result: BigDecimal('Infinity')))

    expect(record.result).to eq 0.0
  end

  it 'correctly handles null in result' do
    record = Tournament::Match::Slot.create!(attributes.merge(result: nil))

    expect(record.result).to eq nil
  end

  def attributes
    {
      competitor: tournament_competitors(:race_competitor),
      match: tournament_matches(:match_1)
    }
  end
end
