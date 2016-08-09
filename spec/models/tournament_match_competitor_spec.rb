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

require 'rails_helper'

RSpec.describe TournamentMatchCompetitor, type: :model do
  it "replace NaN in result with 0.0" do
    record = TournamentMatchCompetitor.create(result: BigDecimal::NAN)
    expect(record.result).to eq 0.0
  end

  it "replace Infinity in result with 0.0" do
    record = TournamentMatchCompetitor.create!(result: BigDecimal.new('Infinity'))
    expect(record.result).to eq 0.0
  end

  it "correctly handles null in result" do
    record = TournamentMatchCompetitor.create!(result: nil)
    expect(record.result).to eq nil
  end
end
