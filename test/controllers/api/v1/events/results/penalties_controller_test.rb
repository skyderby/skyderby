describe Api::V1::Events::Results::PenaltiesController do
  render_views

  describe '#update' do
    it 'when authorized' do
      sign_in users(:event_responsible)
      event = events(:published_public)

      result = event_results(:distance_competitor_1)

      put :update, params: {
        event_id: event.id,
        result_id: result.id,
        penalty: {
          penalized: true,
          penaltySize: 20,
          penaltyReason: 'Reason'
        }
      }

      result.reload

      aggregate_failures 'testing result' do
        expect(response.successful?).to be_truthy
        expect(result.penalized).to be_truthy
        expect(result.penalty_size).to eq(20)
        expect(result.penalty_reason).to eq('Reason')
      end
    end

    it 'when not authorized' do
      event = events(:published_public)

      result = event.results.first

      put :update, params: {
        event_id: event.id,
        result_id: result.id,
        penalty: {
          penalized: true,
          penaltySize: 20,
          penaltyReason: 'Reason'
        }
      }

      expect(response.forbidden?).to be_truthy
    end
  end
end
