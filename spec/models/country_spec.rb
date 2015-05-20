require 'spec_helper'

RSpec.describe Country, type: :model do
  it 'requires name' do
    expect(Country.create).not_to be_valid
  end
end
