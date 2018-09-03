describe Events::ResultsHelper do
  before do
    allow(helper).to receive(:mobile?).and_return(false)
    allow(helper).to receive(:display_event_params).and_return({})
  end

  it '#new_event_track_link' do
    event = events(:published_public)
    competitor = event_competitors(:competitor_1)
    round = event_rounds(:distance_round_1)

    generated_link = helper.new_event_track_link(event, competitor, round)

    aggregate_failures 'verifying link' do
      expect(generated_link).to include({'result[competitor_id]' => competitor.id }.to_param)
      expect(generated_link).to include({'result[round_id]' => round.id }.to_param)
      expect(generated_link).to include('<i class="fa fa-upload"></i>')
    end
  end

  describe '#show_event_track_link' do
    it 'can_update=false' do
      event = events(:published_public)
      result = event_results(:distance_competitor_1)

      generated_link = helper.show_event_track_link(event, result, false)

      expect(generated_link).to include('<i class="fa fa-search"></i>')
    end

    it 'can_update=true' do
      event = events(:published_public)
      result = event_results(:distance_competitor_1)

      generated_link = helper.show_event_track_link(event, result, true)

      expect(generated_link).to include('<i class="fa fa-pencil"></i>')
    end
  end
end
