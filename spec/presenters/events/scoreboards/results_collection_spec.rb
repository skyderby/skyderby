describe Events::Scoreboards::ResultsCollection do
  describe '#for' do
    it 'by round and competitor' do
      params = build_params
      collection = Events::Scoreboards::ResultsCollection.new(event.event_tracks, params)
      competitor = competitors(:competitor_1)
      round = rounds(:speed_round_1)

      result = collection.for(competitor: competitor, round: round).result
      expect(result).to eq(200)
    end

    it 'by round and competitor, without penalties' do
      params = build_params({ omit_penalties: 'true' })
      collection = Events::Scoreboards::ResultsCollection.new(event.event_tracks, params)
      competitor = competitors(:competitor_1)
      round = rounds(:speed_round_1)

      result = collection.for(competitor: competitor, round: round).result
      expect(result).to eq(250)
    end
  end

  describe '#best_in' do
    it 'round' do
      params = build_params
      collection = Events::Scoreboards::ResultsCollection.new(event.event_tracks, params)

      best_in_round = collection.best_in(round: rounds(:speed_round_1))

      expect(best_in_round.result).to eq(270)
    end
  end

  describe '#worst_in' do
    it 'round' do
      params = build_params
      collection = Events::Scoreboards::ResultsCollection.new(event.event_tracks, params)

      worst_in_round = collection.worst_in(round: rounds(:speed_round_1))

      expect(worst_in_round.result).to eq(200)
    end
  end

  def build_params(raw_params = {})
    Events::Scoreboards::Params.new(event, raw_params)
  end

  def event
    events(:published_public)
  end
end
