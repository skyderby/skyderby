describe Events::Scoreboards do
  describe '.for' do
    it 'raise error on unsupported scoreboard' do
      event = create :event
      event.update!(rules: nil)
      params = Events::Scoreboards::Params.new(event, {})

      expect { Events::Scoreboards.for(event, params) }.to raise_exception(
        NotImplementedError,
        'Scoreboard for nil is not defined'
      )
    end
  end
end
