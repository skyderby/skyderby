require 'spec_helper'

# || POST   /api/competitors(.:format)      api/competitors#create
# || PATCH  /api/competitors/:id(.:format)  api/competitors#update
# || DELETE /api/competitors/:id(.:format)  api/competitors#destroy
describe Api::CompetitorsController, 'routing', type: :routing do
  it 'to #create' do
    expect(post('/api/competitors')).to route_to(
      'api/competitors#create',
      default: { 'format' => :json }
    )
  end

  it 'to #update' do
    expect(patch('/api/competitors/1')).to route_to(
      'api/competitors#update',
      id: '1',
      default: { 'format' => :json }
    )
  end

  it 'to #destroy' do
    expect(delete('/api/competitors/1')).to route_to(
      'api/competitors#destroy',
      id: '1',
      default: { 'format' => :json }
    )
  end
end
