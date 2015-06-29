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
  pending "add some examples to (or delete) #{__FILE__}"
end
