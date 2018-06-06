describe Events::Scoreboards::Params do
  describe '#omit_penalties?' do
    it 'without specified params' do
      event = events(:published_public)
      params = Events::Scoreboards::Params.new(event, {})

      expect(params.omit_penalties?).to be_falsey
    end

    it 'when specified "true"' do
      event = events(:published_public)
      params = Events::Scoreboards::Params.new(event, { omit_penalties: 'true' })

      expect(params.omit_penalties?).to be_truthy
    end
  end

  describe '#adjust_to_wind?' do
    describe 'wind cancellation disabled' do
      it 'when parameter not specified' do
        event = events(:published_public)
        event.update!(wind_cancellation: false)

        params = Events::Scoreboards::Params.new(event, {})

        expect(params.adjust_to_wind?).to be_falsey
      end

      it 'when parameter set to "true"' do
        event = events(:published_public)
        event.update!(wind_cancellation: false)

        params = Events::Scoreboards::Params.new(event, { display_raw_results: 'true' })

        expect(params.adjust_to_wind?).to be_falsey
      end
    end

    describe 'wind cancellation enabled' do
      it 'when parameter not specified' do
        event = events(:published_public)
        event.update!(wind_cancellation: true)

        params = Events::Scoreboards::Params.new(event, {})

        expect(params.adjust_to_wind?).to be_truthy
      end

      it 'when parameter specified' do
        event = events(:published_public)
        event.update!(wind_cancellation: true)

        params = Events::Scoreboards::Params.new(event, { display_raw_results: 'true'})

        expect(params.adjust_to_wind?).to be_falsey
      end
    end
  end
end
