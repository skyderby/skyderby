describe Skyderby::Trigonometry do
  before do
    Skyderby::Trigonometry.module_eval do
      module_function :normalize_angle
    end
  end

  it 'normalizes angle > 360' do
    expect(
      Skyderby::Trigonometry.normalize_angle(361)
    ).to eq(1)
  end

  it 'normalizes angle < 0' do
    expect(
      Skyderby::Trigonometry.normalize_angle(-181)
    ).to eq(179)
  end
end
