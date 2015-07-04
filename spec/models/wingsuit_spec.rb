# == Schema Information
#
# Table name: wingsuits
#
#  id              :integer          not null, primary key
#  manufacturer_id :integer
#  ws_class_id     :integer
#  name            :string(255)
#  kind            :integer          default(0)
#

require 'spec_helper'

RSpec.describe Wingsuit, type: :model do
  let(:manufacturer) { create(:manufacturer) }
  let(:wingsuit) { create(:wingsuit) }

  context 'required fields' do
    it 'requires manufacturer' do
      expect(Wingsuit.create(name: 'Ghost Hunter')).not_to be_valid
    end

    it 'requires name' do
      expect(Wingsuit.create(manufacturer: manufacturer)).not_to be_valid
    end
  end

  context 'performs search by name and manufacturer name' do
    it 'performs search by country name' do
      expect(Wingsuit.search('pho')).to include(wingsuit)
    end

    it 'performs search by name' do
      expect(Wingsuit.search('st')).to include(wingsuit)
    end
  end
end
