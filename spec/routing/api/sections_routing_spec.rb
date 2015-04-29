require 'spec_helper'

# || POST   /api/sections/reorder(.:format) api/sections#reorder
# || POST   /api/sections(.:format)         api/sections#create
# || PATCH  /api/sections/:id(.:format)     api/sections#update
# || PUT    /api/sections/:id(.:format)     api/sections#update
# || DELETE /api/sections/:id(.:format)     api/sections#destroy
describe Api::SectionsController, 'routing', type: :routing do
  it 'to #create' do
    expect(post('/api/sections')).to route_to(
      'api/sections#create',
      default: {"format" => :json}
    )
  end

  it 'to #update' do
    expect(patch('/api/sections/1')).to route_to(
      'api/sections#update', 
      id: '1',
      default: {"format" => :json}
    )
  end

  it 'to #destroy' do
    expect(delete('/api/sections/1')).to route_to(
      'api/sections#destroy', 
      id: '1',
      default: {"format" => :json}
    )
  end

  it 'to #reorder' do
    expect(post('/api/sections/reorder')).to route_to(
      'api/sections#reorder',
      default: {"format" => :json}
    )
  end
end


