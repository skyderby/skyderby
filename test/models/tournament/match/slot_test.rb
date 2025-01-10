describe Tournament::Match::Slot do
  describe 'score calculation' do
    let(:place) { places(:hellesylt_wbr) }
    let(:responsible) { users(:event_responsible) }
    let(:finish_line) do
      place.finish_lines.create! \
        name: 'wbr',
        start_latitude: 62.053858,
        start_longitude: 6.945123,
        end_latitude: 62.056071,
        end_longitude: 6.945568
    end
    let(:tournament) do
      Tournament.create! \
        name: 'WBR',
        responsible: responsible,
        place: place,
        finish_line: finish_line
    end

    it 'Competitor intersected finish line' do
      round = tournament.rounds.create!
      match = round.matches.create!(start_time: '2015-07-02 11:45:38.185')

      match_competitor = match.slots.create!(
        competitor: competitor,
        track: create_track_from_file('WBR/11-40-01_Ratmir.CSV')
      )

      expect(match_competitor.result).to be_within(0.001).of(33.543)
    end

    it 'Another competitor intersected finish line' do
      round = tournament.rounds.create!
      match = round.matches.create!(start_time: '2015-07-02 13:46:11.447')

      match_competitor = match.slots.create!(
        competitor: competitor,
        track: create_track_from_file('WBR/13-35-43_Andreas.CSV')
      )

      expect(match_competitor.result).to be_within(0.001).of(32.822)
    end

    it 'Competitor did not intersect finish line' do
      round = tournament.rounds.create!
      match = round.matches.create!(start_time: '2015-07-03 11:10:30.450')

      match_competitor = match.slots.create!(
        competitor: competitor,
        track: create_track_from_file('WBR/11-05-01_Ratmir.CSV')
      )

      expect(match_competitor.result).to eq(0)
      expect(match_competitor.is_disqualified).to be_truthy
      expect(match_competitor.notes).to eq("Didn't intersected finish line")
    end

    def competitor
      @competitor ||= tournament.competitors.create! \
        profile: profiles(:alex),
        suit: suits(:apache)
    end
  end
end
