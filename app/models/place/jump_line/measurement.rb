# == Schema Information
#
# Table name: exit_measurements
#
#  id       :integer          not null, primary key
#  place_id :integer
#  altitude :integer
#  distance :integer
#

class Place::JumpLine::Measurement < ApplicationRecord
  belongs_to :jump_line, touch: true
end
