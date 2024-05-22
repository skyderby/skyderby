describe PerformanceCompetitionSeries::Scoreboard::Settings do
  describe '#display_raw_results' do
    it 'default value is false' do
      settings = described_class.new
      expect(settings.display_raw_results).to eq(false)
    end

    {
      'true' => true,
      'false' => false,
      '0' => false,
      '1' => true
    }.each do |input, output|
      it 'converts string "true" to boolean true' do
        params =
          ActionController::Parameters
          .new(display_raw_results: input)
          .permit(:display_raw_results)

        settings = described_class.new(params)
        expect(settings.display_raw_results).to eq(output)
      end
    end
  end
end
