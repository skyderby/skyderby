require 'spec_helper'

# || api_event PATCH  /api/events/:id(.:format)   api/events#update
describe Api::EventsController, 'routing', type: :routing do
  it 'to #update' do
    expect(patch('/api/events/1')).to route_to(
      action: 'update',
      default: { 'format' => :json },
      controller: 'api/events',
      id: '1'
    )
  end
end
