describe Api::V1::Events::ReferencePointAssignmentsController do
  it '#create' do
    sign_in users(:event_responsible)

    event = events(:published_public)
    competitor = event_competitors(:competitor_1)
    round = event_rounds(:distance_round_1)

    params = {
      event_id: event.id,
      round_name: 'Distance-1',
      competitor_id: competitor.id,
      'reference_point[name]': 'Target 1',
      'reference_point[latitude]': 20,
      'reference_point[longitude]': 20
    }

    post :create, params: params, format: :json

    expect(response.successful?).to be_truthy

    reference_point = event.reference_points.find_by(name: 'Target 1')
    expect(reference_point).to be_present

    assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
    expect(assignment.reference_point).to eq(reference_point)
  end
end
