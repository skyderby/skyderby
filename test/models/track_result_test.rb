# == Schema Information
#
# Table name: track_results
#
#  id         :integer          not null, primary key
#  track_id   :integer
#  discipline :integer
#  range_from :integer
#  range_to   :integer
#  result     :float
#

describe Track::Result, type: :model do
  let(:track) { tracks(:hellesylt) }

  it 'replace NaN in result with 0.0' do
    record = Track::Result.create!(track: track, result: Float::NAN)

    expect(record.result).to eq 0.0
  end

  it 'replace Infinity in result with 0.0' do
    record = Track::Result.create!(track: track, result: Float::INFINITY)

    expect(record.result).to eq 0.0
  end

  it 'correctly handles null in result' do
    record = Track::Result.create!(track: track, result: nil)

    expect(record.result).to eq nil
  end

  it 'validates uniqueness by discipline and track' do
    attrs = { track: track, discipline: :time }
    Track::Result.create!(attrs)

    expect(Track::Result.create(attrs)).not_to be_valid
  end
end
