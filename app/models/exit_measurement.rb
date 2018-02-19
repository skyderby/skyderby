# == Schema Information
#
# Table name: exit_measurements
#
#  id       :integer          not null, primary key
#  place_id :integer
#  altitude :integer
#  distance :integer
#

class ExitMeasurement < ApplicationRecord
  belongs_to :place
end
