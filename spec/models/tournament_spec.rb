# == Schema Information
#
# Table name: tournaments
#
#  id               :integer          not null, primary key
#  name             :string(510)
#  place_id         :integer
#  discipline       :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  finish_start_lat :decimal(15, 10)
#  finish_start_lon :decimal(15, 10)
#  finish_end_lat   :decimal(15, 10)
#  finish_end_lon   :decimal(15, 10)
#  starts_at        :date
#  exit_lat         :decimal(15, 10)
#  exit_lon         :decimal(15, 10)
#

require 'rails_helper'

RSpec.describe Tournament, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
