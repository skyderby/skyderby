require 'rails_helper'

RSpec.describe Velocity do
  it 'load 100 correctly' do
    value = Velocity.load(100)
    expect(value).to eq 100
  end

  it 'load Infinity as 0' do
    value = Velocity.load(Float::INFINITY)
    expect(value).to eq 0
  end
end
