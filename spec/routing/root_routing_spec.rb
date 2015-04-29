require 'spec_helper'

# || GET    /(:locale)(.:format)  static_pages#index {:locale=>/en|de|es|ru/}
# || GET    /
describe 'Root', 'routing', type: :routing do
  it 'to #index locale: ru' do
    expect(get('/ru')).to route_to('static_pages#index', locale: 'ru')
  end

  it 'to #index locale: en' do
    expect(get('/en')).to route_to('static_pages#index', locale: 'en')
  end

  it 'to #index locale: de' do
    expect(get('/de')).to route_to('static_pages#index', locale: 'de')
  end

  it 'to #index locale: es' do
    expect(get('/es')).to route_to('static_pages#index', locale: 'es')
  end

  it 'to #index default locale' do
    expect(get('/')).to route_to('static_pages#index')
  end
end


