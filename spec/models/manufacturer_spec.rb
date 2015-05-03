require 'spec_helper'

describe Manufacturer, type: :model do
  it 'name is required' do
    expect(Manufacturer.create).not_to be_valid
  end
end
