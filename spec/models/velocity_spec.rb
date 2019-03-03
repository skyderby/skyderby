require 'spec_helper'

describe Velocity do
  describe '.load' do
    it 'load 100 correctly' do
      value = Velocity.load(100)
      expect(value).to eq 100
    end

    it 'load Infinity as 0' do
      value = Velocity.load(Float::INFINITY)
      expect(value).to eq 0
    end
  end

  describe '.dump' do
    it 'dumps Fixnums' do
      expect(Velocity.dump(281)).to eq(281)
    end

    it 'dumps BigDecimals' do
      expect(Velocity.dump(BigDecimal(281))).to eq(281)
    end
  end
end
