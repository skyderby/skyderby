describe Distance do
  describe '.load' do
    it 'correctly loads decimals' do
      value = Distance.load(BigDecimal(100))
      expect(value).to eq(100)
    end

    it 'correctly loads floats' do
      value = Distance.load(100.0)
      expect(value).to eq(100)
    end
  end

  describe '.dump' do
    it 'dumps Fixnums' do
      expect(Distance.dump(281)).to eq(281)
    end

    it 'dumps BigDecimals' do
      expect(Distance.dump(BigDecimal(281))).to eq(281)
    end

    it 'dumps self as a BigDecimal' do
      value = Distance.load(BigDecimal(100))
      expect(value.dump).to eql(BigDecimal(100))
    end
  end

  describe 'initialization with different units' do
    it 'can be initialized with feets' do
      value = Distance.new(1000, :ft)
      expect(value).to be_within(0.001).of(304.8)
    end

    it 'can be initialized with miles' do
      value = Distance.new(5, :mi)
      expect(value).to be_within(0.001).of(8046.72)
    end

    it 'inititalizes without conversion if no unit given' do
      value = Distance.new(100)
      expect(value).to eq(100)
    end
  end

  describe 'conversion to different units' do
    it 'can be converted to feets' do
      value = Distance.new(304.8)
      expect(value.to_ft).to be_within(0.001).of(1000)
    end

    it 'can be converted to miles' do
      value = Distance.new(8046.72)
      expect(value.to_mi).to be_within(0.001).of(5)
    end
  end
end
