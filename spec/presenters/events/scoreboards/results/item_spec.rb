describe Events::Scoreboards::Results::Item do
  describe '#result' do
    it 'raw' do
      event_track = event_results(:distance_competitor_1)
      result = build_result(event_track, {})

      expect(result.result).to eq(3000)
    end

    it 'wind adjusted' do
      event_track = event_results(:distance_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, {})

      expect(result.result).to eq(2900)
    end

    it 'raw, penalty' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.result).to eq(200)
    end

    it 'wind adjusted, penalty' do
      event_track = event_results(:speed_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, {})

      expect(result.result).to eq(192)
    end

    it 'raw, omit penalty' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, omit_penalties: 'true')

      expect(result.result).to eq(250)
    end

    it 'wind adjusted, omit penalty' do
      event_track = event_results(:speed_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, omit_penalties: 'true')

      expect(result.result).to eq(240)
    end
  end

  describe 'penalized?' do
    it 'penalized' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.penalized?).to be_truthy
    end

    it 'omit penalties' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, omit_penalties: 'true')

      expect(result.penalized?).to be_falsey
    end
  end

  describe 'penalty_size?' do
    it 'penalized' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.penalty_size).to eq(20)
    end

    it 'omit penalties' do
      event_track = event_results(:speed_competitor_1)
      result = build_result(event_track, omit_penalties: 'true')

      expect(result.penalty_size).to eq(0)
    end
  end

  describe 'best_in_round_and_category?' do
    it 'true for best result' do
      event_track = event_results(:speed_competitor_2)
      event = event_track.event

      params = Events::Scoreboards::Params.new(event, {})
      collection = Events::Scoreboards::Results::Collection.new(event.results, params)

      result = collection.for(competitor: event_competitors(:competitor_2), round: event_rounds(:speed_round_1))

      expect(result.best_in_round_and_category?).to be_truthy
    end
  end

  def build_result(event_track, raw_params)
    event = event_track.event
    params = Events::Scoreboards::Params.new(event, raw_params)
    collection = Events::Scoreboards::Results::Collection.new(event.results, params)

    Events::Scoreboards::Results::Item.new(event_track, collection, params)
  end
end
