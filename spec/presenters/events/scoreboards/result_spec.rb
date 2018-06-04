describe Events::Scoreboards::Result do
  describe '#result' do
    it 'raw' do
      event_track = event_tracks(:distance_competitor_1)
      result = build_result(event_track, {})

      expect(result.result).to eq(3000)
    end

    it 'wind adjusted' do
      event_track = event_tracks(:distance_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, {})

      expect(result.result).to eq(2900)
    end

    it 'raw, penalty' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.result).to eq(200)
    end

    it 'wind adjusted, penalty' do
      event_track = event_tracks(:speed_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, {})

      expect(result.result).to eq(192)
    end

    it 'raw, omit penalty' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, { omit_penalties: 'true'})

      expect(result.result).to eq(250)
    end

    it 'wind adjusted, omit penalty' do
      event_track = event_tracks(:speed_competitor_1)
      event_track.event.update!(wind_cancellation: true)
      result = build_result(event_track, { omit_penalties: 'true'})

      expect(result.result).to eq(240)
    end
  end

  describe 'penalized?' do
    it 'penalized' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.penalized?).to be_truthy
    end

    it 'omit penalties' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, { omit_penalties: 'true'})

      expect(result.penalized?).to be_falsey
    end
  end

  describe 'penalty_size?' do
    it 'penalized' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, {})

      expect(result.penalty_size).to eq(20)
    end

    it 'omit penalties' do
      event_track = event_tracks(:speed_competitor_1)
      result = build_result(event_track, { omit_penalties: 'true'})

      expect(result.penalty_size).to eq(0)
    end
  end

  def build_result(event_track, raw_params)
    params = Events::Scoreboards::Params.new(event_track.event, raw_params)
    collection = Events::Scoreboards::ResultsCollection.new(event_track.event, params)
    result = Events::Scoreboards::Result.new(event_track, collection, params)
  end
end
