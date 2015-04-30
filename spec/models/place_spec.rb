require 'spec_helper'

RSpec.describe Place, type: :model do
  let(:country) { create(:country) }
  let(:place) { create(:place) }
  let(:point) { create(:point) }

  context 'required fields' do
    it 'requires country' do
      expect(Place.create(name: 'Gridset')).not_to be_valid
    end

    it 'requires name' do
      expect(Place.create(country: country)).not_to be_valid
    end
  end

  context 'performs search by name and country name' do
    it 'performs search by country name' do
      expect(Place.search('no')).to include(place) 
    end

    it 'performs search by name' do
      expect(Place.search('ri')).to include(place) 
    end
  end

  it 'performs search nearby place to point' do
    expect(Place.nearby(point, 1)).to include(place)
  end
end
