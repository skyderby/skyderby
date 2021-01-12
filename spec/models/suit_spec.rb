# == Schema Information
#
# Table name: suits
#
#  id                 :integer          not null, primary key
#  manufacturer_id    :integer
#  name               :string(510)
#  kind               :integer          default("wingsuit")
#  photo_file_name    :string(510)
#  photo_content_type :string(510)
#  photo_file_size    :integer
#  photo_updated_at   :datetime
#  description        :text
#

describe Suit do
  let(:manufacturer) { create(:manufacturer, name: 'Phoenix Fly') }
  let(:suit) { create(:suit, name: 'Ghost 3') }

  context 'required fields' do
    it 'requires manufacturer' do
      expect(Suit.create(name: 'Ghost Hunter')).not_to be_valid
    end

    it 'requires name' do
      expect(Suit.create(manufacturer: manufacturer)).not_to be_valid
    end
  end

  context 'performs search by name and manufacturer name' do
    it 'performs search by country name' do
      expect(Suit.search('pho')).to include(suit)
    end

    it 'performs search by name' do
      expect(Suit.search('st')).to include(suit)
    end
  end
end
