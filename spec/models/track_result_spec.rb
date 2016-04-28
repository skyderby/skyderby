# == Schema Information
#
# Table name: track_results
#
#  id         :integer          not null, primary key
#  track_id   :integer
#  discipline :integer
#  range_from :integer
#  range_to   :integer
#  result     :float(24)
#

require 'rails_helper'

RSpec.describe TrackResult, type: :model do
  it "replace NaN in result with 0.0" do
    record = TrackResult.create!(result: Float::NAN)
    expect(record.result).to eq 0.0
  end

  it "replace Infinity in result with 0.0" do
    record = TrackResult.create!(result: Float::INFINITY)
    expect(record.result).to eq 0.0
  end

  it "correctly handles null in result" do
    record = TrackResult.create!(result: nil)
    expect(record.result).to eq nil
  end

  it 'validates uniqueness by discipline and track' do
    attrs = { track_id: 1, discipline: :time }
    record = TrackResult.create!(attrs)
    expect(TrackResult.create(attrs)).not_to be_valid
  end
end
