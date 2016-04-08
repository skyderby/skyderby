require 'spec_helper'

describe Skyderby::Trigonometry do
  it 'normalizes angle > 360' do
    expect(
      Skyderby::Trigonometry.normalize(361)
    ).to eq(1)
  end

  it 'normalizes angle < 0' do
    expect(
      Skyderby::Trigonometry.normalize(-181)
    ).to eq(179)
  end
end
