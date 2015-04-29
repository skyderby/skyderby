require 'spec_helper'

# || POST   /api/event_tracks(.:format)     api/round_tracks#create
# || PATCH  /api/event_tracks/:id(.:format) api/round_tracks#update
# || DELETE /api/event_tracks/:id(.:format) api/round_tracks#destroy
describe Api::EventTracksController, 'routing', type: :routing do
  it 'to #create' do
    expect(post('/api/event_tracks')).to route_to(
      'api/event_tracks#create',
      default: {"format" => :json}
    )
  end

  it 'to #update' do
    expect(patch('/api/event_tracks/1')).to route_to(
      'api/event_tracks#update', 
      id: '1',
      default: {"format" => :json}
    )
  end

  it 'to #destroy' do
    expect(delete('/api/event_tracks/1')).to route_to(
      'api/event_tracks#destroy', 
      id: '1',
      default: {"format" => :json}
    )
  end
end
